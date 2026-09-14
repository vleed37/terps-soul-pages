import { SALES_EMAIL, ORDERS_EMAIL } from "./brand";

/**
 * Single source of truth for the legal pages.
 *
 * PENDING OWNER CONFIRMATION — the values marked below are proposals that stand
 * in for the client's bracketed placeholders. Replace once confirmed in writing:
 *   - LEGAL_ENTITY (registered company name)
 *   - COMPANY_PHONE, COMPANY_ADDRESS (currently blank; blank fields are hidden)
 *   - PROCESSING_DAYS, STANDARD_DELIVERY_DAYS, EXPRESS_DELIVERY_DAYS
 *   - RETURN_WINDOW_DAYS
 */
export const LEGAL_ENTITY = "Terps Nation";
export const COMPANY_TRADING_NAME = "Terps";
export const COMPANY_PHONE = "";
export const COMPANY_ADDRESS = "";
export const WEBSITE_URL = "https://terps2.carbonmediasolutions.com";
export const CURRENCY = "South African Rand (ZAR)";
export const GOVERNING_LAW = "South Africa";

export const PRIVACY_EMAIL = SALES_EMAIL;
export const SUPPORT_EMAIL = ORDERS_EMAIL;
export const SHIPPING_EMAIL = ORDERS_EMAIL;
export const REFUNDS_EMAIL = ORDERS_EMAIL;

export const EFFECTIVE_DATE = "14 September 2026";
export const LAST_UPDATED = "14 September 2026";

export const PROCESSING_DAYS = "1–2";
export const STANDARD_DELIVERY_DAYS = "3–5";
export const EXPRESS_DELIVERY_DAYS = "1–2";
export const RETURN_WINDOW_DAYS = "7 days";
