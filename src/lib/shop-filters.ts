import { z } from "zod";
import type { Strain } from "@/lib/types";

export const EFFECTS = ["daytime", "balanced", "nighttime"] as const;
export const FLAVORS = [
  "citrus",
  "berry",
  "earthy",
  "sweet",
  "tropical",
  "pine",
  "floral",
  "spicy",
] as const;
export const SORT = ["featured", "price-asc", "price-desc", "name"] as const;
export const STRAIN_TYPES = ["sativa", "hybrid", "indica"] as const;
export const AVAILABILITY = ["in", "limited", "soldout"] as const;

/** Flavour families and the strain flavour tags that belong to each. */
export const FLAVOR_SYNONYMS: Record<(typeof FLAVORS)[number], string[]> = {
  citrus: ["citrus", "lemon", "orange", "lime", "grapefruit"],
  berry: ["berry", "blueberry", "grape", "cherry"],
  tropical: ["tropical", "mango", "pineapple", "guava"],
  pine: ["pine", "wood", "forest", "cedar"],
  floral: ["floral", "lavender", "blossom", "rose"],
  earthy: ["earth", "musk", "hops", "herbal"],
  spicy: ["spice", "spicy", "pepper", "clove"],
  sweet: ["sweet", "vanilla", "cream", "candy", "honey"],
};

/** True when a strain's flavour tags belong to the given flavour family. */
export function matchesFlavor(tags: string[] | null | undefined, family: (typeof FLAVORS)[number]) {
  const lower = (tags ?? []).map((t) => t.toLowerCase());
  return FLAVOR_SYNONYMS[family].some((needle) => lower.some((t) => t.includes(needle)));
}

/** Shared filter/sort search params for both category collection pages. */
export const shopSearchSchema = z.object({
  effect: z.array(z.enum(EFFECTS)).optional(),
  flavor: z.array(z.enum(FLAVORS)).optional(),
  avail: z.array(z.enum(AVAILABILITY)).optional(),
  strain_type: z.array(z.enum(STRAIN_TYPES)).optional(),
  min: z.coerce.number().min(0).max(500).optional(),
  max: z.coerce.number().min(0).max(500).optional(),
  sort: z.enum(SORT).optional(),
});

export type ShopSearch = z.infer<typeof shopSearchSchema>;

export function toggleArr<T extends string>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

/** Filter + sort a strain list against the shared search params. */
export function applyShopFilters(strains: Strain[], search: ShopSearch): Strain[] {
  const effect = search.effect ?? [];
  const flavor = search.flavor ?? [];
  const avail = search.avail ?? [];
  const strainType = search.strain_type ?? [];
  const min = search.min ?? 0;
  const max = search.max ?? 500;
  const sort = search.sort ?? "featured";

  const list = strains.filter((s) => {
    if (strainType.length && (!s.strain_type || !strainType.includes(s.strain_type))) return false;
    if (effect.length && (!s.effect_category || !effect.includes(s.effect_category))) return false;
    if (flavor.length && !flavor.some((f) => matchesFlavor(s.flavor_tags, f))) return false;
    if (avail.length) {
      const isSold = s.stock_quantity <= 0;
      const isLim = !!s.is_limited && !isSold;
      const isIn = !isSold && !isLim;
      const pass =
        (avail.includes("in") && isIn) ||
        (avail.includes("limited") && isLim) ||
        (avail.includes("soldout") && isSold);
      if (!pass) return false;
    }
    const price = Number(s.price_zar);
    return price >= min && price <= max;
  });

  return [...list].sort((a, b) => {
    if (sort === "price-asc") return Number(a.price_zar) - Number(b.price_zar);
    if (sort === "price-desc") return Number(b.price_zar) - Number(a.price_zar);
    if (sort === "name") return a.name.localeCompare(b.name);
    const fa = a.is_featured ? 0 : 1;
    const fb = b.is_featured ? 0 : 1;
    if (fa !== fb) return fa - fb;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });
}
