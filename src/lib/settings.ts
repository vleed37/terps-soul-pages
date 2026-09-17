/**
 * Operational settings — the maintainable layer over `src/lib/business.ts` and
 * `src/lib/brand.ts`.
 *
 * Values live in the `app_config` table (public read, service-role write) so the
 * owner can supply final business, legal, shipping and imagery details through
 * the admin screens without a code change.
 *
 * RULES
 *  - A missing value stays missing. Nothing here invents a legal entity, a
 *    shipping rate, a courier or a photograph.
 *  - `src/lib/brand.ts` numbers remain the *proposed* fallbacks. They are only
 *    ever advertised publicly once `shipping.pricing_confirmed` is true.
 *  - Legal readiness needs BOTH complete fields AND an explicit legal review
 *    approval. Flipping one flag is not enough.
 */

import {
  DELIVERY_PRICING_CONFIRMED,
  FREE_DELIVERY_THRESHOLD,
  RETAIL_DELIVERY_FEE,
  VAT_ENABLED,
  WHOLESALE_DELIVERY_FEE,
} from "@/lib/brand";
import { BUSINESS } from "@/lib/business";

export type SettingsMap = Record<string, string>;

/* ------------------------------------------------------------------ keys */

export const BUSINESS_FIELDS = [
  { key: "business.trading_name", label: "Trading name", required: true },
  { key: "business.legal_entity_name", label: "Registered legal entity name", required: true },
  { key: "business.registration_number", label: "Company registration number", required: true },
  { key: "business.vat_number", label: "VAT registration number", required: false },
  { key: "business.address", label: "Registered business address", required: true },
  { key: "business.phone", label: "Contact telephone number", required: true },
  { key: "business.email_sales", label: "Sales / orders email", required: true },
  { key: "business.email_privacy", label: "Privacy contact email", required: true },
  { key: "business.email_shipping", label: "Shipping contact email", required: true },
  { key: "business.email_refunds", label: "Refunds contact email", required: true },
  { key: "business.effective_date", label: "Policy effective date", required: true },
  { key: "business.processing_time", label: "Order processing time", required: true },
  { key: "business.delivery_estimate_standard", label: "Standard delivery estimate", required: true },
  { key: "business.delivery_estimate_express", label: "Express delivery estimate", required: false },
  { key: "business.returns_period", label: "Returns notification period", required: true },
] as const;

export const VAT_STATUS_KEY = "business.vat_status";
export const LEGAL_REVIEW_KEY = "legal.review_approved";

export const SHIPPING_KEYS = {
  retailFee: "shipping.retail_fee",
  wholesaleFee: "shipping.wholesale_fee",
  freeEnabled: "shipping.free_enabled",
  freeThreshold: "shipping.free_threshold",
  confirmed: "shipping.pricing_confirmed",
  courier: "shipping.courier_label",
} as const;

/** Maintainable image slots. Empty = keep the current fallback imagery. */
export const IMAGE_SLOTS = [
  { key: "image.home_hero", label: "Homepage hero", note: "Wide, dark-friendly. Currently a temporary still." },
  { key: "image.home_stockist", label: "Homepage stockist section", note: "Portrait 4:5 retail display." },
  { key: "image.box_pre_roll", label: "Infused Pre-Roll full box (20 units)", note: "Wholesale catalogue + trade pages." },
  { key: "image.box_caviar", label: "Caviar Sticks full box (20 units)", note: "Wholesale catalogue + trade pages." },
  { key: "image.variety_box_pre_roll", label: "Infused Pre-Roll variety box", note: "Mixed-box builder header." },
  { key: "image.variety_box_caviar", label: "Caviar Sticks variety box", note: "Mixed-box builder header." },
  { key: "image.wholesale_catalog", label: "Wholesale catalogue banner", note: "Optional trade catalogue visual." },
  { key: "image.wholesale_order_large", label: "Large wholesale order imagery", note: "Optional multiple-boxes shot." },
  { key: "image.og_default", label: "Social sharing image (default)", note: "1200×630. Falls back to /og/default.jpg." },
] as const;

export type ImageSlotKey = (typeof IMAGE_SLOTS)[number]["key"];

export const ALL_SETTING_KEYS: string[] = [
  ...BUSINESS_FIELDS.map((f) => f.key),
  VAT_STATUS_KEY,
  LEGAL_REVIEW_KEY,
  ...Object.values(SHIPPING_KEYS),
  ...IMAGE_SLOTS.map((s) => s.key),
];

/* --------------------------------------------------------------- readers */

export function str(s: SettingsMap, key: string): string | null {
  const v = s[key];
  return v && v.trim() ? v.trim() : null;
}

export function bool(s: SettingsMap, key: string, fallback = false): boolean {
  const v = str(s, key);
  if (v === null) return fallback;
  return v === "true" || v === "1" || v === "yes";
}

export function num(s: SettingsMap, key: string, fallback: number): number {
  const v = str(s, key);
  if (v === null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/* -------------------------------------------------------------- business */

export type VatStatus = "registered" | "not_registered" | "tbc";

export function vatStatus(s: SettingsMap): VatStatus {
  const v = str(s, VAT_STATUS_KEY);
  return v === "registered" || v === "not_registered" ? v : "tbc";
}

/** VAT is only ever applied when the owner has confirmed registration. */
export function vatApplies(s: SettingsMap): boolean {
  return vatStatus(s) === "registered" && VAT_ENABLED;
}

/**
 * Business details as the site should present them: a stored value wins, an
 * already-confirmed constant is kept, otherwise the field stays null so the UI
 * renders an honest "to be confirmed".
 */
export function business(s: SettingsMap) {
  return {
    tradingName: str(s, "business.trading_name") ?? BUSINESS.tradingName,
    legalEntityName: str(s, "business.legal_entity_name") ?? BUSINESS.legalEntityName,
    registrationNumber: str(s, "business.registration_number") ?? BUSINESS.registrationNumber,
    vatNumber: str(s, "business.vat_number") ?? BUSINESS.vatNumber,
    address: str(s, "business.address") ?? BUSINESS.businessAddress,
    phone: str(s, "business.phone") ?? BUSINESS.phoneNumber,
    salesEmail: str(s, "business.email_sales") ?? BUSINESS.salesEmail,
    privacyEmail: str(s, "business.email_privacy") ?? BUSINESS.privacyEmail,
    shippingEmail: str(s, "business.email_shipping") ?? BUSINESS.shippingEmail,
    refundEmail: str(s, "business.email_refunds") ?? BUSINESS.refundEmail,
    effectiveDate: str(s, "business.effective_date") ?? BUSINESS.effectiveDate,
    processingTime: str(s, "business.processing_time") ?? BUSINESS.processingTime,
    standardDeliveryEstimate:
      str(s, "business.delivery_estimate_standard") ?? BUSINESS.standardDeliveryEstimate,
    expressDeliveryEstimate:
      str(s, "business.delivery_estimate_express") ?? BUSINESS.expressDeliveryEstimate,
    returnNotificationPeriod: str(s, "business.returns_period") ?? BUSINESS.returnNotificationPeriod,
    vatStatus: vatStatus(s),
  };
}

/** Required business/legal fields still outstanding, by human label. */
export function missingBusinessFields(s: SettingsMap): string[] {
  const b = business(s);
  const value: Record<string, string | null> = {
    "business.trading_name": b.tradingName,
    "business.legal_entity_name": b.legalEntityName,
    "business.registration_number": b.registrationNumber,
    "business.vat_number": b.vatNumber,
    "business.address": b.address,
    "business.phone": b.phone,
    "business.email_sales": b.salesEmail,
    "business.email_privacy": b.privacyEmail,
    "business.email_shipping": b.shippingEmail,
    "business.email_refunds": b.refundEmail,
    "business.effective_date": b.effectiveDate,
    "business.processing_time": b.processingTime,
    "business.delivery_estimate_standard": b.standardDeliveryEstimate,
    "business.delivery_estimate_express": b.expressDeliveryEstimate,
    "business.returns_period": b.returnNotificationPeriod,
  };
  const missing = BUSINESS_FIELDS.filter((f) => f.required && !value[f.key]).map((f) => f.label);
  // VAT number is only required once the owner confirms VAT registration.
  if (vatStatus(s) === "registered" && !b.vatNumber) missing.push("VAT registration number");
  if (vatStatus(s) === "tbc") missing.push("VAT registration status (yes / no)");
  return missing;
}

export function legalReviewApproved(s: SettingsMap): boolean {
  return bool(s, LEGAL_REVIEW_KEY, false);
}

/**
 * Legal pages are only "ready" when every required field is supplied AND a
 * human has recorded legal approval. Neither alone unblocks publication.
 */
export function legalReadiness(s: SettingsMap) {
  const missing = missingBusinessFields(s);
  const fieldsComplete = missing.length === 0;
  const reviewApproved = legalReviewApproved(s);
  return {
    missing,
    fieldsComplete,
    reviewApproved,
    ready: fieldsComplete && reviewApproved,
  };
}

/** True while legal pages must show a draft notice. */
export function legalIsDraft(s: SettingsMap): boolean {
  return !legalReadiness(s).ready;
}

/* -------------------------------------------------------------- shipping */

export interface DeliveryConfig {
  retailFee: number;
  wholesaleFee: number;
  freeEnabled: boolean;
  freeThreshold: number;
  /** Owner has approved the shipping model in writing. */
  confirmed: boolean;
  courier: string | null;
}

export function deliveryConfig(s: SettingsMap): DeliveryConfig {
  const confirmed = bool(s, SHIPPING_KEYS.confirmed, DELIVERY_PRICING_CONFIRMED);
  return {
    retailFee: num(s, SHIPPING_KEYS.retailFee, RETAIL_DELIVERY_FEE),
    wholesaleFee: num(s, SHIPPING_KEYS.wholesaleFee, WHOLESALE_DELIVERY_FEE),
    freeEnabled: bool(s, SHIPPING_KEYS.freeEnabled, false),
    freeThreshold: num(s, SHIPPING_KEYS.freeThreshold, FREE_DELIVERY_THRESHOLD),
    confirmed,
    courier: str(s, SHIPPING_KEYS.courier),
  };
}

/** Retail delivery fee for a subtotal. Free delivery needs BOTH flags on. */
export function retailFeeFor(subtotal: number, c: DeliveryConfig): number {
  if (c.confirmed && c.freeEnabled && subtotal >= c.freeThreshold) return 0;
  return c.retailFee;
}

/**
 * Customer-facing fee label. While the model is unconfirmed we never render a
 * promotional "Free" or a threshold — only the amount actually applied.
 */
export function formatFee(fee: number, c: DeliveryConfig): string {
  if (fee === 0 && c.confirmed) return "Free";
  return `R${fee.toFixed(0)}`;
}

/** Delivery estimate copy, or null while unconfirmed / unsupplied. */
export function deliveryEstimateCopy(s: SettingsMap): string | null {
  const c = deliveryConfig(s);
  if (!c.confirmed) return null;
  return business(s).standardDeliveryEstimate;
}

export function missingShippingDecisions(s: SettingsMap): string[] {
  const c = deliveryConfig(s);
  const out: string[] = [];
  if (!c.confirmed) out.push("Final delivery pricing sign-off (rates are still proposals)");
  if (!c.courier) out.push("Courier / delivery provider");
  if (!business(s).standardDeliveryEstimate) out.push("Standard delivery estimate");
  if (!business(s).processingTime) out.push("Order processing time");
  if (c.freeEnabled && !c.freeThreshold) out.push("Free-delivery threshold amount");
  return out;
}

/* ---------------------------------------------------------------- images */

export function imageUrl(s: SettingsMap, key: ImageSlotKey): string | null {
  return str(s, key);
}

/** Slot with a supplied final image, plus the ones still outstanding. */
export function missingImageSlots(s: SettingsMap): string[] {
  return IMAGE_SLOTS.filter((slot) => !str(s, slot.key)).map((slot) => slot.label);
}
