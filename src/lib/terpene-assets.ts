import limonene from "@/assets/terpenes/limonene.jpg";
import myrcene from "@/assets/terpenes/myrcene.jpg";
import pinene from "@/assets/terpenes/pinene.jpg";
import caryophyllene from "@/assets/terpenes/caryophyllene.jpg";
import linalool from "@/assets/terpenes/linalool.jpg";
import humulene from "@/assets/terpenes/humulene.jpg";
import terpinolene from "@/assets/terpenes/terpinolene.jpg";
import ocimene from "@/assets/terpenes/ocimene.jpg";
import { FLAVORS } from "@/lib/shop-filters";

type TerpeneArt = { src: string; alt: string };

/**
 * Original Terps ingredient stills, one per terpene. Each carries meaningful
 * alt text describing the ingredients shown — the page stays readable when
 * images are unavailable.
 */
export const TERPENE_ART: Record<string, TerpeneArt> = {
  limonene: { src: limonene, alt: "Whole and halved lemons with fresh citrus leaves" },
  myrcene: { src: myrcene, alt: "A ripe mango, halved and scored, beside a herb sprig" },
  pinene: { src: pinene, alt: "A fresh pine sprig resting beside a pine cone" },
  caryophyllene: { src: caryophyllene, alt: "A small heap of black peppercorns with a clove sprig" },
  linalool: { src: linalool, alt: "A tied bundle of fresh lavender in flower" },
  humulene: { src: humulene, alt: "Green hop cones on a short vine with leaves" },
  terpinolene: {
    src: terpinolene,
    alt: "A halved green apple beside white blossom and a nutmeg seed",
  },
  ocimene: { src: ocimene, alt: "Fresh basil, mint and parsley leaves" },
};

export function getTerpeneArt(slug: string): TerpeneArt | undefined {
  return TERPENE_ART[slug];
}

/** Flavour tiles, in display order. Keys match the shop flavour filter. */
export const FLAVOUR_TILES: { key: (typeof FLAVORS)[number]; label: string }[] = [
  { key: "citrus", label: "Citrus" },
  { key: "berry", label: "Berry" },
  { key: "tropical", label: "Tropical" },
  { key: "pine", label: "Pine / Wood" },
  { key: "floral", label: "Floral" },
  { key: "earthy", label: "Earthy" },
  { key: "spicy", label: "Spicy" },
  { key: "sweet", label: "Sweet" },
];
