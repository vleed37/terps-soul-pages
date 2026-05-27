import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listStockists = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("stockists")
    .select(
      "id,slug,name,address,unit,suburb,city,province,postal_code,latitude,longitude,phone,email,website,hours_json,carried_strain_ids,is_featured,product_listing_urls,accepts_online_orders",
    )
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});
