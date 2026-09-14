/**
 * Single source of truth for legal + business details used across the policies,
 * checkout and footer.
 *
 * Values are either CONFIRMED by the owner or `PENDING` — a sentinel that the
 * UI renders as an obvious "pending owner confirmation" marker instead of a raw
 * square-bracket placeholder. Never replace a PENDING value with an invented
 * one: legal entity, registration, address, phone, delivery times and return
 * windows must come from the owner in writing.
 */

export const PENDING = null;
export type Confirmable<T> = T | null;

/** True while any legal/business value below is still unresolved. */
export const LEGAL_DRAFT = true;

/** Draft banner is a preview/development affordance only — never production. */
export const SHOW_LEGAL_DRAFT_NOTICE = import.meta.env.DEV || LEGAL_DRAFT;

export const BUSINESS = {
  // ---- confirmed -------------------------------------------------------
  tradingName: "Terps",
  websiteUrl: "https://terps2.carbonmediasolutions.com",
  currency: "ZAR",
  currencySymbol: "R",
  jurisdiction: "South Africa",
  salesEmail: "sales@terpsnation.co.za",
  ordersEmail: "orders@terpsnation.co.za",

  // ---- pending owner confirmation --------------------------------------
  legalEntityName: PENDING as Confirmable<string>,
  registrationNumber: PENDING as Confirmable<string>,
  vatNumber: PENDING as Confirmable<string>,
  businessAddress: PENDING as Confirmable<string>,
  phoneNumber: PENDING as Confirmable<string>,
  privacyEmail: PENDING as Confirmable<string>,
  shippingEmail: PENDING as Confirmable<string>,
  refundEmail: PENDING as Confirmable<string>,
  effectiveDate: PENDING as Confirmable<string>,
  processingTime: PENDING as Confirmable<string>,
  standardDeliveryEstimate: PENDING as Confirmable<string>,
  expressDeliveryEstimate: PENDING as Confirmable<string>,
  returnNotificationPeriod: PENDING as Confirmable<string>,
} as const;

/** Contact address for a given purpose, falling back to the confirmed sales inbox. */
export function contactEmail(
  purpose: "privacy" | "shipping" | "refund" | "sales" = "sales",
): string {
  const map: Record<string, Confirmable<string>> = {
    privacy: BUSINESS.privacyEmail,
    shipping: BUSINESS.shippingEmail,
    refund: BUSINESS.refundEmail,
    sales: BUSINESS.salesEmail,
  };
  return map[purpose] || BUSINESS.salesEmail;
}

/** The seller reference used in policy prose while the legal entity is unknown. */
export const SELLER_REFERENCE =
  BUSINESS.legalEntityName ?? `${BUSINESS.tradingName} (legal entity to be confirmed)`;

/** Every value still owed by the owner, for the draft notice + launch blockers. */
export const PENDING_BUSINESS_DETAILS: string[] = [
  ["Registered legal entity name", BUSINESS.legalEntityName],
  ["Company registration number", BUSINESS.registrationNumber],
  ["VAT registration number", BUSINESS.vatNumber],
  ["Registered business address", BUSINESS.businessAddress],
  ["Contact phone number", BUSINESS.phoneNumber],
  ["Privacy contact address", BUSINESS.privacyEmail],
  ["Shipping contact address", BUSINESS.shippingEmail],
  ["Refunds contact address", BUSINESS.refundEmail],
  ["Policy effective date", BUSINESS.effectiveDate],
  ["Order processing time", BUSINESS.processingTime],
  ["Standard delivery estimate", BUSINESS.standardDeliveryEstimate],
  ["Express delivery estimate", BUSINESS.expressDeliveryEstimate],
  ["Return notification period", BUSINESS.returnNotificationPeriod],
]
  .filter(([, v]) => !v)
  .map(([label]) => label as string);
