import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SELECT = "id,slug,name,tagline,description,story,effect_category,flavor_tags,thc_percentage,cbd_percentage,total_terpenes_percentage,batch_number,test_date,lab_name,terpene_breakdown,price_zar,stock_quantity,weight_grams,accent_color_primary,accent_color_accent,is_featured,is_limited,display_order,product_line,product_tier,strain_type,infusion_components,effects,helps_with,negatives,lineage";

export const listStrains = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("strains")
    .select(SELECT)
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getStrainBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { data: strain, error } = await supabaseAdmin
      .from("strains")
      .select(SELECT)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return strain;
  });
