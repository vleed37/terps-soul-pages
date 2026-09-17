/**
 * Server-only address geocoding.
 *
 * Provider abstraction — NO provider is configured yet. To enable geocoding,
 * one of the following must be present in the server environment:
 *
 *  1. Google Maps Platform connector (preferred):
 *       LOVABLE_API_KEY      (provisioned automatically)
 *       GOOGLE_MAPS_API_KEY  (created when the Google Maps connector is linked)
 *     Requests go through the Lovable connector gateway.
 *
 *  2. A direct Google Geocoding API key:
 *       GEOCODING_API_KEY
 *
 * Until one exists, geocode() returns { status: "unconfigured" } and callers
 * save the address without coordinates. No key is ever exposed to the browser.
 */

export type GeocodeResult =
  | { status: "ok"; latitude: number; longitude: number }
  | { status: "not_found" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

/** Which provider, if any, is currently usable. Never returns credentials. */
export function geocodeProviderName(): "google_maps_connector" | "google_geocoding_key" | null {
  if (process.env.LOVABLE_API_KEY && process.env.GOOGLE_MAPS_API_KEY) {
    return "google_maps_connector";
  }
  if (process.env.GEOCODING_API_KEY) return "google_geocoding_key";
  return null;
}

/** Stable comparison key so unchanged addresses are never re-geocoded. */
export function addressKey(parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => (p ?? "").trim().toLowerCase().replace(/\s+/g, " "))
    .filter(Boolean)
    .join(", ");
}

export async function geocodeAddress(parts: {
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
}): Promise<GeocodeResult> {
  const query = addressKey([
    parts.address,
    parts.city,
    parts.province,
    parts.postalCode,
    parts.country ?? "South Africa",
  ]);
  if (!query) return { status: "not_found" };

  const provider = geocodeProviderName();
  if (!provider) return { status: "unconfigured" };

  try {
    let response: Response;
    if (provider === "google_maps_connector") {
      response = await fetch(
        `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(query)}&region=za`,
        {
          headers: {
            Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": process.env.GOOGLE_MAPS_API_KEY!,
          },
        },
      );
    } else {
      response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&region=za&key=${process.env.GEOCODING_API_KEY}`,
      );
    }

    if (!response.ok) {
      const detail = await response.text();
      console.error(`Geocoding failed [${response.status}]: ${detail}`);
      return { status: "error", message: `Geocoding provider error ${response.status}` };
    }

    const body = (await response.json()) as {
      status?: string;
      results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } } }>;
    };
    const loc = body.results?.[0]?.geometry?.location;
    if (body.status !== "OK" || typeof loc?.lat !== "number" || typeof loc?.lng !== "number") {
      return { status: "not_found" };
    }
    return { status: "ok", latitude: loc.lat, longitude: loc.lng };
  } catch (e) {
    console.error("Geocoding threw", e);
    return { status: "error", message: e instanceof Error ? e.message : "Unknown error" };
  }
}
