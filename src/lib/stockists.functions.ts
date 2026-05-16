import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listStockists = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("stockists")
    .select("id,slug,name,address,suburb,city,province,latitude,longitude,phone,hours_json,is_featured")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("city");
  if (error) throw new Error(error.message);
  return data ?? [];
});
