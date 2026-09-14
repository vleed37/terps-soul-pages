import shootPreRoll from "@/assets/shoot/divine-110.jpg.asset.json";
import shootCaviar from "@/assets/shoot/divine-115.jpg.asset.json";
import shootPreRollHeader from "@/assets/shoot/divine-56.jpg.asset.json";
import shootCaviarHeader from "@/assets/shoot/divine-117.jpg.asset.json";

/** Product-line database values (matches strains.product_line check constraint). */
export const PRODUCT_LINES = ["pre_roll", "caviar_stix"] as const;
export type ProductLine = (typeof PRODUCT_LINES)[number];

export const PRE_ROLL_DESCRIPTION =
  "Crafted from premium indoor flower, infused with select hash and crumble, and expertly rolled for a refined, elevated experience.";
export const CAVIAR_DESCRIPTION =
  "Crafted from premium indoor flower, infused with select hash and crumble, then finished with a coating of live rosin and a generous layer of hash for an elevated experience.";

/**
 * Swap-in points for collection photography.
 * HERO_MEDIA entries are placeholders until the photographer's collection shots arrive.
 */
export const HERO_MEDIA: Record<ProductLine, string> = {
  pre_roll: shootPreRollHeader.url,
  caviar_stix: shootCaviarHeader.url,
};

/** Hub tile photography — current best photo per line. */
export const HUB_MEDIA: Record<ProductLine, string> = {
  pre_roll: shootPreRoll.url,
  caviar_stix: shootCaviar.url,
};

export interface CollectionMeta {
  line: ProductLine;
  /** Line name used everywhere: nav, homepage, hub, wholesale catalogue. */
  label: string;
  heading: string;
  description: string;
  path: "/shop/infused-pre-rolls" | "/shop/caviar-stix";
  hubImage: string;
  heroImage: string;
}

export const COLLECTIONS: CollectionMeta[] = [
  {
    line: "pre_roll",
    label: "Infused Pre-Rolls",
    heading: "The Infused Pre-Roll",
    description: PRE_ROLL_DESCRIPTION,
    path: "/shop/infused-pre-rolls",
    hubImage: HUB_MEDIA.pre_roll,
    heroImage: HERO_MEDIA.pre_roll,
  },
  {
    line: "caviar_stix",
    label: "Caviar Stix",
    heading: "The Caviar Stix",
    description: CAVIAR_DESCRIPTION,
    path: "/shop/caviar-stix",
    hubImage: HUB_MEDIA.caviar_stix,
    heroImage: HERO_MEDIA.caviar_stix,
  },
];

export function collectionFor(line: ProductLine): CollectionMeta {
  return COLLECTIONS.find((c) => c.line === line) ?? COLLECTIONS[0];
}

export function productLineDescription(line: ProductLine | string | null | undefined): string {
  return line === "caviar_stix" ? CAVIAR_DESCRIPTION : PRE_ROLL_DESCRIPTION;
}
