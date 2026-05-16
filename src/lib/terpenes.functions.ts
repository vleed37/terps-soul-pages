import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listTerpenes = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("terpenes")
    .select("id,slug,name,tastes_like,short_descriptor,long_description,found_in_strain_slugs,display_order")
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});
