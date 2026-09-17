import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Public terpene library.
 *
 * Strain associations now come from the structural `strain_terpenes` table.
 * The legacy `found_in_strain_slugs` array is kept as a fallback for any
 * terpene that has no structural links yet, so nothing disappears from the
 * public library during the transition.
 */
export const listTerpenes = createServerFn({ method: "GET" }).handler(async () => {
  const [{ data, error }, { data: links }, { data: strains }] = await Promise.all([
    supabaseAdmin
      .from("terpenes")
      .select("id,slug,name,tastes_like,short_descriptor,long_description,found_in_strain_slugs,display_order")
      .order("display_order", { ascending: true }),
    supabaseAdmin.from("strain_terpenes").select("terpene_id,strain_id,prominence"),
    supabaseAdmin
      .from("strains")
      .select("id,slug,is_active,is_archived")
      .eq("is_active", true)
      .eq("is_archived", false),
  ]);
  if (error) throw new Error(error.message);

  const slugById = new Map((strains ?? []).map((s) => [s.id, s.slug]));
  const bySlugSet = new Set((strains ?? []).map((s) => s.slug));
  const grouped = new Map<string, string[]>();
  for (const l of (links ?? []).sort((a, b) => (a.prominence ?? 0) - (b.prominence ?? 0))) {
    const slug = slugById.get(l.strain_id);
    if (!slug) continue;
    const list = grouped.get(l.terpene_id) ?? [];
    if (!list.includes(slug)) list.push(slug);
    grouped.set(l.terpene_id, list);
  }

  return (data ?? []).map((t) => {
    const structural = grouped.get(t.id) ?? [];
    const legacy = (t.found_in_strain_slugs ?? []).filter((s: string) => bySlugSet.has(s));
    return { ...t, found_in_strain_slugs: structural.length > 0 ? structural : legacy };
  });
});
