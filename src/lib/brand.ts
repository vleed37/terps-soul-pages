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
