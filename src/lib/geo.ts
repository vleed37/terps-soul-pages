export type LatLng = { lat: number; lng: number };

export const PROVINCE_CENTROIDS: Record<string, LatLng> = {
  "Western Cape": { lat: -33.2278, lng: 21.8569 },
  "Gauteng": { lat: -26.2708, lng: 28.1123 },
  "KwaZulu-Natal": { lat: -28.5306, lng: 30.8958 },
  "Eastern Cape": { lat: -32.2968, lng: 26.4194 },
  "Free State": { lat: -28.4541, lng: 26.7968 },
  "Limpopo": { lat: -23.4013, lng: 29.4179 },
  "Mpumalanga": { lat: -25.5653, lng: 30.5279 },
  "North West": { lat: -26.6639, lng: 25.2837 },
  "Northern Cape": { lat: -29.0467, lng: 21.8569 },
};

export const PROVINCES = Object.keys(PROVINCE_CENTROIDS);

export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export async function getBrowserLocation(): Promise<LatLng | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 5500);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { timeout: 5000, enableHighAccuracy: false },
    );
  });
}

export async function getIPLocation(): Promise<LatLng | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.latitude === "number" && typeof data.longitude === "number") {
      return { lat: data.latitude, lng: data.longitude };
    }
    return null;
  } catch {
    return null;
  }
}

export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}