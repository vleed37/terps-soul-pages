export type WholesalePriceTier = {
  min_boxes: number;
  max_boxes: number | null;
  price_per_box_zar: number;
};

/** Resolve the per-box price for a box quantity from a tier ladder. */
export function resolveTierPrice(tiers: WholesalePriceTier[], boxes: number): number {
  if (!tiers.length || boxes <= 0) return 0;
  const sorted = [...tiers].sort((a, b) => a.min_boxes - b.min_boxes);
  let match = sorted[0];
  for (const t of sorted) {
    const withinMin = boxes >= t.min_boxes;
    const withinMax = t.max_boxes == null || boxes <= t.max_boxes;
    if (withinMin && withinMax) return Number(t.price_per_box_zar);
    if (withinMin) match = t;
  }
  return Number(match.price_per_box_zar);
}

export function lineTotalZar(tiers: WholesalePriceTier[], boxes: number): number {
  return Number((resolveTierPrice(tiers, boxes) * boxes).toFixed(2));
}

export function formatTierRange(t: WholesalePriceTier): string {
  if (t.max_boxes == null) return `${t.min_boxes}+ boxes`;
  if (t.max_boxes === t.min_boxes) return `${t.min_boxes} box`;
  return `${t.min_boxes}–${t.max_boxes} boxes`;
}
