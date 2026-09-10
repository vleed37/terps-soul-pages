# TERPS Phase-1 Remediation Pass

Ten targeted fixes from the QA audit. No redesign, no Phase-2 features, existing visual system preserved.

## 1. Wholesale pricing security (critical)

Wholesale box prices sit in the same publicly readable `strains` row as retail prices, so anyone can read them through the public data API. Row-level rules cannot protect single columns, so the protected pricing moves out.

- New table `strain_wholesale_pricing` (one row per strain): box price, box quantity, minimum boxes, availability flag.
- Copy existing values across, then remove those columns from `strains`.
- No public read access at all: read rights granted only to signed-in users, and the read rule additionally requires either an approved stockist account or an admin role. Anonymous visitors get nothing.
- Add a proper admin role table (`user_roles` + `has_role` helper) since one is needed for the admin side of that rule and for Priority 9.
- Wholesale catalogue/checkout functions read pricing as the signed-in stockist, not with the public key. Retail pages never request these fields.
- Verification: four live tests (anonymous, retail user, approved stockist, admin) reported in the QA section.

## 2. Retail pricing

- Infused Pre-Rolls: R180 → **R160**. Caviar Stix: R350 → **R210** (database).
- Global sweep for any hard-coded 180/350/price strings in copy, product cards, teasers, structured data and legal/shipping thresholds; wholesale box pricing untouched.

## 3. Wholesale signup journey

Instant access stays. Adjust only copy and prominence:

- "Become a Stockist" prominent in the main navigation (desktop and mobile).
- First-visit popup verified: two paths — "Sign up for wholesale pricing" and "Continue shopping".
- Registration stays short; no store-description field, VAT stays optional.
- Post-registration copy rewritten so nothing implies waiting. Any "48 hours" line only ever refers to Terps reaching out if extra info is needed. Verification wording used only if the account flow actually requires it.

## 4. Email readiness

- Review each send path (stockist signup, order confirmation, internal new-order notice, notify-me, newsletter, password reset) for correct sender identity, reply-to and graceful failure when unconfigured.
- Global sweep of Terps Nation / terpsnation / terpnation spelling in user-facing text and addresses.
- Notify-me and newsletter get their missing send paths wired so they work the moment the mail key is added.
- No credentials invented; outstanding values listed at the end.

## 5. BobPay readiness

- Verify order/reference generation, callback handling, success/fail/cancel branches, duplicate-callback safety, and that payment status can only be set by the callback — never by the browser.
- Add explicit handling for failed and cancelled returns on the confirmation page, which reads status from the order record only.
- No real charge; required configuration listed at the end.

## 6. Legal pages

- Remove the visible "This is a placeholder" banner from all five legal pages.
- Keep and properly format the substantive content already present; where a section is genuinely thin, it is written as plain readable policy text and flagged in the report as awaiting client/legal sign-off — no staging labels left on screen.

## 7. Delivery only

- Confirm checkout offers courier delivery only and remove any residual collection option or copy.

## 8. Notify me

- Confirm storage, add duplicate protection (one record per email/product), clear success feedback, correct product association, and a working send path once mail is configured.

## 9. Lightweight catalogue management

Using the existing admin strain editor and the new role table:

- A simple admin list of products with inline edit for retail price, stock quantity and active/featured flags, plus the existing copy/image fields.
- Access restricted server-side to admin role holders. Nothing beyond this — no orders, CRM, coupons or exports.

## 10. Visual and copy regression check

- Confirm no return of "Craft. Built slowly. Built once.", quote banners, "4 drops / 4 flavours", "1 standard", "Batch 04 Active", "Limited First Batch", Follow Terps / Stay Close filler.
- "Caviar Stix" spelling consistent; live-rosin language only on Caviar Stix, never on Infused Pre-Rolls.
- Strain Library and stockist locator verified, not rebuilt; only real defects fixed. No THC percentages shown.
- Re-run the 390 / 768 / 1280 route sweep to confirm no overflow, no console errors, all routes healthy.

## Technical notes

- Migrations: new `strain_wholesale_pricing` table with grants and stockist/admin-only select; `app_role` enum, `user_roles` table and `security definer has_role()`; retail price updates; drop of the wholesale price columns from `strains` (destructive — will ask for confirmation).
- Server functions touched: wholesale catalogue/checkout (auth-scoped pricing reads), admin catalogue update, notify-me and newsletter send paths, BobPay webhook branches.
- Frontend touched: header nav, wholesale signup copy, legal page layout, admin product list, price strings.

## Final report

Sections 1–12 as requested: changes made, four-way security test results, retail and wholesale flow pass/fail/blocked, per-email status, legal readiness, responsive regression, remaining client input, remaining Vincit configuration, Phase 2, completion percentages, recommendation.
