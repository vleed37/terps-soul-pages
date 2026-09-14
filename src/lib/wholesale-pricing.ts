export type WholesalePriceTier = {
  min_boxes: number;
  max_boxes: number | null;
  price_per_box_zar: number;
};

/** Exact values stored in strains.product_line (DB check constraint). */
export const WHOLESALE_PRODUCT_LINES = ["pre_roll", "caviar_stix"] as const;
export type WholesaleProductLine = (typeof WHOLESALE_PRODUCT_LINES)[number];

export function productLineLabel(line: WholesaleProductLine): string {
  return line === "caviar_stix" ? "Caviar Stix" : "Infused Pre-Rolls";
}

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

/**
 * THE single wholesale box-price rule.
 *
 * The tier is chosen by the number of boxes on that one basket line — not by the
 * order-wide total for the product line. Single-strain boxes and mixed boxes both
 * go through this function so the two can never disagree; change the rule here.
 */
export function wholesaleBoxPrice(tiers: WholesalePriceTier[], boxes: number): number {
  return resolveTierPrice(tiers, boxes);
}

export function wholesaleLineTotal(tiers: WholesalePriceTier[], boxes: number): number {
  return Number((wholesaleBoxPrice(tiers, boxes) * boxes).toFixed(2));
}

export function lineTotalZar(tiers: WholesalePriceTier[], boxes: number): number {
  return wholesaleLineTotal(tiers, boxes);
}

export function formatTierRange(t: WholesalePriceTier): string {
  if (t.max_boxes == null) return `${t.min_boxes}+ boxes`;
  if (t.max_boxes === t.min_boxes) return `${t.min_boxes} box`;
  return `${t.min_boxes}–${t.max_boxes} boxes`;
}

/** True when two ladders are identical (same ranges, same prices). */
export function tiersEqual(a: WholesalePriceTier[], b: WholesalePriceTier[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x.min_boxes - y.min_boxes);
  const sb = [...b].sort((x, y) => x.min_boxes - y.min_boxes);
  return sa.every((t, i) => {
    const o = sb[i];
    return (
      t.min_boxes === o.min_boxes &&
      (t.max_boxes ?? null) === (o.max_boxes ?? null) &&
      Number(t.price_per_box_zar) === Number(o.price_per_box_zar)
    );
  });
}
