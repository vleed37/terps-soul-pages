import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Public stockist finder data.
 *
 * Two sources are merged:
 *  1. Curated `stockists` rows that are marked active.
 *  2. Stockist accounts that have opted in to the public map, supplied complete
 *     public details, and placed at least one paid wholesale order.
 *
 * Only the whitelisted public columns are ever returned. Business identifiers
 * such as VAT or registration numbers never leave the server.
 */
export const listStockists = createServerFn({ method: "GET" }).handler(async () => {
  const curated = await supabaseAdmin
    .from("stockists")
    .select(
      "id,slug,name,address,unit,suburb,city,province,postal_code,latitude,longitude,phone,email,website,hours_json,carried_strain_ids,is_featured,product_listing_urls,accepts_online_orders",
    )
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });
  if (curated.error) throw new Error(curated.error.message);

  // Opted-in stockist accounts with complete public details.
  const optedIn = await supabaseAdmin
    .from("wholesale_accounts")
    .select(
      "id,map_listing_opt_in,public_store_name,public_address,public_city,public_province,public_phone,public_latitude,public_longitude",
    )
    .eq("map_listing_opt_in", true)
    .not("public_store_name", "is", null)
    .not("public_address", "is", null)
    .not("public_phone", "is", null);
  if (optedIn.error) throw new Error(optedIn.error.message);

  const candidates = optedIn.data ?? [];
  let listed: typeof candidates = [];
  if (candidates.length > 0) {
    // Eligibility also requires at least one paid wholesale order.
    const paid = await supabaseAdmin
      .from("wholesale_orders")
      .select("wholesale_account_id")
      .eq("payment_status", "paid")
      .in(
        "wholesale_account_id",
        candidates.map((c) => c.id),
      );
    if (paid.error) throw new Error(paid.error.message);
    const paidIds = new Set((paid.data ?? []).map((r) => r.wholesale_account_id));
    listed = candidates.filter((c) => paidIds.has(c.id));
  }

  const fromAccounts = listed.map((a) => ({
    id: a.id,
    slug: `stockist-${a.id}`,
    name: a.public_store_name ?? "",
    address: a.public_address ?? "",
    unit: null as string | null,
    suburb: null as string | null,
    city: a.public_city ?? "",
    province: a.public_province ?? "",
    postal_code: null as string | null,
    latitude: a.public_latitude,
    longitude: a.public_longitude,
    phone: a.public_phone,
    email: null as string | null,
    website: null as string | null,
    hours_json: null,
    carried_strain_ids: [] as string[],
    is_featured: false,
    product_listing_urls: null,
    accepts_online_orders: false,
  }));

  return [...(curated.data ?? []), ...fromAccounts];
});
