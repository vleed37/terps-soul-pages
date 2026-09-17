/** Single source of truth for public-facing brand contact details. */
export const SALES_EMAIL = "sales@terpsnation.co.za";
export const ORDERS_EMAIL = "orders@terpsnation.co.za";
export const INSTAGRAM_HANDLE = "@terps.official_";
export const INSTAGRAM_URL = "https://instagram.com/terps.official_";

/**
 * Commercial constants — the single configurable source for fees and tax.
 *
 * LAUNCH BLOCKERS — every value below needs written owner confirmation before
 * production payments are enabled:
 *   - RETAIL_DELIVERY_FEE (proposed R80)
 *   - FREE_DELIVERY_THRESHOLD (proposed free over R500)
 *   - WHOLESALE_DELIVERY_FEE (proposed R250)
 *   - VAT_ENABLED (fails safe: OFF until VAT registration is confirmed)
 */
export const RETAIL_DELIVERY_FEE = 80;
export const FREE_DELIVERY_THRESHOLD = 500;
export const WHOLESALE_DELIVERY_FEE = 250;

/**
 * VAT fails safe. Do NOT set VAT_ENABLED to true until Terps' VAT registration
 * status is confirmed in writing. While false, no VAT is added to any total.
 */
export const VAT_ENABLED = false;
export const VAT_RATE = 0.15;

/** Effective VAT rate actually applied to totals. 0 while VAT is disabled. */
export const EFFECTIVE_VAT_RATE = VAT_ENABLED ? VAT_RATE : 0;

/** Retail delivery fee for a given subtotal (delivery only — no collection). */
export function retailDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : RETAIL_DELIVERY_FEE;
}

/** VAT amount on a taxable base. Returns 0 while VAT collection is disabled. */
export function vatOn(base: number): number {
  return Number((base * EFFECTIVE_VAT_RATE).toFixed(2));
}

/**
 * 14 Sept 2026 decision: the delivery model (fees, courier, thresholds) is NOT
 * approved. Fees stay configurable above and are still applied at checkout, but
 * nothing about them may be advertised publicly until this flag flips.
 */
export const DELIVERY_PRICING_CONFIRMED = false;

/** Neutral, non-committal delivery line used anywhere a promise used to sit. */
export const DELIVERY_COPY =
  "Available delivery options and costs are shown at checkout.";


/**
 * Formats a delivery fee for customer-facing display.
 *
 * While DELIVERY_PRICING_CONFIRMED is false we never render a promotional
 * "Free" label or any free-delivery threshold — the shipping model is not
 * approved yet. The amount actually applied to the order is still shown.
 */
export function formatDeliveryFee(fee: number): string {
  if (fee === 0 && DELIVERY_PRICING_CONFIRMED) return "Free";
  return `R${fee.toFixed(0)}`;
}
