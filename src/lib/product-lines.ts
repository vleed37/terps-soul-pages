/**
 * Product-line naming and approved category copy (14 Sept 2026 review).
 *
 * The database identifiers stay as they are (`pre_roll`, `caviar_stix`) so no
 * cart, order snapshot or indexed URL is orphaned. Only the *visible* wording
 * changes: "Caviar Stix" is now "Caviar Stick".
 */

export type ProductLine = "pre_roll" | "caviar_stix";

export const PRODUCT_LINES = ["pre_roll", "caviar_stix"] as const;

interface LineMeta {
  /** Singular display name, e.g. "The Caviar Stick" heading uses `title`. */
  name: string;
  title: string;
  plural: string;
  /** Approved category description — do not reword without owner sign-off. */
  description: string;
  path: "/shop/infused-pre-rolls" | "/shop/caviar-sticks";
}

export const PRODUCT_LINE_META: Record<ProductLine, LineMeta> = {
  pre_roll: {
    name: "Infused Pre-Roll",
    title: "The Infused Pre-Roll",
    plural: "Infused Pre-Rolls",
    description:
      "Crafted from premium indoor flower, infused with select hash and crumble, and expertly rolled for a refined, elevated experience.",
    path: "/shop/infused-pre-rolls",
  },
  caviar_stix: {
    name: "Caviar Stick",
    title: "The Caviar Stick",
    plural: "Caviar Sticks",
    description:
      "Crafted from premium indoor flower, infused with select hash and crumble, then finished with a coating of live rosin and a generous layer of hash for an elevated experience.",
    path: "/shop/caviar-sticks",
  },
};

export function lineMeta(line: string | null | undefined): LineMeta {
  return PRODUCT_LINE_META[(line as ProductLine) ?? "pre_roll"] ?? PRODUCT_LINE_META.pre_roll;
}

export function lineLabel(line: string | null | undefined): string {
  return lineMeta(line).name;
}

/**
 * Legacy slug aliases. Product slugs in the database are unchanged; these let
 * the newer "stick"/"cookies" spellings resolve to the same product so shared
 * or typed links never 404.
 */
export const SLUG_ALIASES: Record<string, string> = {
  "caviar-stick-sativa": "caviar-stix-sativa",
  "caviar-stick-hybrid": "caviar-stix-hybrid",
  "caviar-stick-indica": "caviar-stix-indica",
  "girl-scout-cookies": "girl-scout-cookie",
};

export function canonicalSlug(slug: string): string {
  return SLUG_ALIASES[slug] ?? slug;
}
