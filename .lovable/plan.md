# Phase 1 — Audit, Complete, Verify (revised with your corrections)

I cannot edit code yet: the session is still in plan mode, so every file edit is blocked. Approving this plan switches me to build mode and I will implement it immediately, end to end, then report evidence in your requested format.

## Verified findings (checked in the code and the live database)

- Six placeholder stockists are active and publicly visible, all with fake `555` phone numbers.
- Retail R80 / free-over-R500 is hard-coded inside the checkout server code, not in the settings file.
- Wholesale totals currently add 15% VAT unconditionally.
- No payment credentials and no email key are stored, so live payment and email delivery cannot be verified.
- Unsupported claims still present: a "MAY HELP WITH" panel on product pages, a "Lab Verified" badge, "Live rosin. Lab verified." in the site description, a blanket "Live rosin" line on every cart item, "Terps operates within South African law for adult-use cannabis" on the disclaimer, "We work with curated dispensaries across SA" on the stockist page, and a dead "Download Invoice · Coming Soon" button.
- Wholesale accounts have no map-listing fields, so the map eligibility rule does not exist.
- No guest-order claiming on registration; stockist search has no alias matching (so "JHB" finds nothing).

## What I will implement

1. **VAT fails safe.** One settings file holds retail delivery, free-delivery threshold, wholesale delivery and VAT. VAT collection is switched OFF and no VAT is added to any total until registration is confirmed in writing. All four values are marked as launch blockers in the code.
2. **Full claim sweep** across code, database content and the rendered pages for: MAY HELP WITH, depression, anxiety, stress, fatigue, LAB VERIFIED, Live rosin, adult-use, within South African law, curated dispensaries, Coming Soon, Download Invoice, batch, THC, CBD. "Live rosin" stays only in accurate Caviar Stix copy. Medical, laboratory and legality claims are removed, including the stored strain data behind them.
3. **Placeholder stockists deactivated, not deleted**, plus an honest empty state on the finder with "Become a stockist" and contact actions, and the neutral retailer line you specified.
4. **Stockist map opt-in** (additive migration): opt-in flag, public store name, public address, public phone, listing state. Public listing requires opt-in AND complete public details AND at least one wholesale order with verified paid status. Public map queries return only approved public fields — never signup, VAT, account or delivery data.
5. **Alias stockist search** (JHB/Jozi → Johannesburg, CPT → Cape Town, PTA/Tshwane → Pretoria, Durbs → Durban, province abbreviations), keeping existing filters, geolocation, nearest-first sort and marker linkage.
6. **Secure guest-order claiming** on registration/sign-in using the verified session email only.
7. **Email and payment readiness**: all eight Phase 1 messages wired with sender name Terps and reply-to sales@terpsnation.co.za, loud failure logging without leaking secrets, and abuse limits on signup, reset, newsletter and notify-me. Live delivery is marked BLOCKED where credentials or domain verification are missing.
8. **Legal wording** softened, delivery-only wording consistent, privacy page accurate about services used, legal links at checkout, every legal page marked as awaiting owner/legal review.
9. **Security audit and full acceptance suite**: RLS on every user-facing table, cross-account read attempts, anonymous and retail attempts on wholesale pricing, invalid webhook signature rejection, webhook replay idempotency, one order and one stock decrement per successful payment, no decrement on failure or cancellation, no secrets in browser bundles.
10. **Verification of existing features rather than assumption**: age-gate persistence, first-visit prompt after age confirmation, cart persistence, guest and signed-in checkout, registration/verification/reset/magic link, address CRUD, marketing opt-in/out, account deletion and anonymisation, instant stockist registration, protected pricing, box quantity and minimum order enforcement, dedicated wholesale cart, newsletter dedupe, notify-me dedupe against a clearly labelled out-of-stock test fixture, galleries, and layouts at 390px, 768px and 1440px.

## Technical notes

- Migrations are additive and reversible: new nullable columns on `wholesale_accounts`, a listing-eligibility helper, and a data update setting the placeholder stockists inactive. No drops, no resets, no deletions.
- Fee and VAT constants live in `src/lib/brand.ts`; the retail and wholesale server functions import them so totals stay server-authoritative.
- Public stockist reads keep the existing narrow column projection; new public map fields join it only when eligible.
- BobPay is tested in test mode with fixtures only; no real charge. The full BobPay journey is reported BLOCKED BY CREDENTIALS until credentials exist.
- No Phase 2 work: no admin dashboard, discount engine, shipping calculator, exports, loyalty, chatbot, reviews, restock sending or behavioural campaigns.

## Launch blockers (owner inputs)

Payment credentials and BobPay approval for the merchant entity and final domain; email sending domain verification and key; real stockist data; VAT registration confirmation; confirmation of R80/R500 retail and R250 wholesale delivery; courier details; final legal sign-off; approved photography for any remaining stock imagery.
