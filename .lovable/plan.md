# TERPS Phase-1 Remediation Pass

Ten targeted fixes from the QA audit. No redesign, no Phase-2 features, existing visual system preserved.

## Confirmations before any migration runs

- Wholesale pricing becomes **tiered per box**, not a single box price.
- The official prices below **replace** the old R1,600 / blank values.
- Every box contains **20 units**.
- Wholesale line totals and order totals are **calculated server-side only**.
- Anonymous visitors and ordinary retail users **cannot read** wholesale pricing data at all.
- All eight box boundaries (1, 2, 3, 5, 6, 9, 10, 11) will be tested for both products.
- The destructive column drop happens **last**, only after everything reads the new structure.

## 1. Wholesale pricing security + tiered model (critical)

Wholesale prices currently sit in the same publicly readable product row as retail prices, so anyone can read them through the public data API. Row-level rules cannot protect single columns, so protected pricing moves into its own structures.

**Wholesale product configuration** (one row per product): product reference, units per box (20), wholesale active flag.

**Wholesale price tiers** (several rows per product): product reference, min boxes, max boxes (blank = open ended), price per box. Database rules prevent overlapping tiers, prevent gaps, and require every active wholesale product to have a tier starting at 1 box.

Authoritative values inserted:

| Infused Pre-Roll | boxes | price/box |
| --- | --- | --- |
| | 1–2 | R1,600 |
| | 3–5 | R1,500 |
| | 6–9 | R1,400 |
| | 10+ | R1,350 |

| Caviar Stix | boxes | price/box |
| --- | --- | --- |
| | 1–2 | R2,200 |
| | 3–5 | R2,100 |
| | 6–9 | R2,000 |
| | 10+ | R1,950 |

Access rules on both new tables: no anonymous read at all; signed-in read only when the user has an approved stockist account or the admin role; only admins may change them.

An admin role table (`user_roles` + `has_role` helper) is added, since the rule above and Priority 9 both need it.

**Sequencing** — no shortcuts:

1. Create the two protected structures and the role table.
2. Insert the new authoritative tiers and units-per-box of 20.
3. Move the wholesale catalogue read onto the protected structures (signed-in stockist context, never the public key).
4. Rewrite wholesale cart logic so it holds quantities and displays server-resolved prices only.
5. Rewrite checkout/order/payment totals to resolve the tier server-side.
6. Update wholesale UI (catalogue, cart, checkout, order views).
7. Verify protected access and every tier calculation.
8. Confirm nothing still references the old wholesale columns.
9. Only then drop the obsolete columns from the product table (this step asks for your approval).

**Price calculation** — the tier is chosen by the number of boxes ordered for that product, and the whole quantity is priced at that tier. Expected results, tested at every boundary:

- Pre-Roll: 1 = 1,600 · 2 = 3,200 · 3 = 4,500 · 5 = 7,500 · 6 = 8,400 · 9 = 12,600 · 10 = 13,500 · 11 = 14,850
- Caviar Stix: 1 = 2,200 · 2 = 4,400 · 3 = 6,300 · 5 = 10,500 · 6 = 12,000 · 9 = 18,000 · 10 = 19,500 · 11 = 21,450

**Checkout security** — every wholesale order: verify sign-in, verify stockist entitlement, read the product, read requested box counts, resolve the tier server-side, compute price per box and totals server-side, create the order, hand that authoritative amount to BobPay. Tampering tests: request 1 box at the 10+ rate, submit an altered price per box, altered discount, altered final amount — each must be ignored or rejected.

**Wholesale UI** — signed-in stockists see the full tier ladder per product ("1–2 boxes — R1,600 / box", etc.), 20 units per box, and RRP guidance (Pre-Roll R160–R180, Caviar Stix R210–R235). Retail visitors see none of it.

## 2. Retail pricing

- Infused Pre-Roll 0.75g: R180 → **R160** per unit (RRP range R160–R180).
- Caviar Stix 0.75g: R350 → **R210** per unit (RRP range R210–R235).
- Global sweep for hard-coded price strings in copy, product cards, teasers and structured data.


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

Using the existing admin editor and the new role table, admin-only:

- Product list with inline edit for retail price, stock quantity, active/featured flags, plus existing copy/image fields.
- Wholesale management: units per box, wholesale availability, and the wholesale price tiers.
- Nothing beyond this — no orders, CRM, coupons or exports.


## 10. Visual and copy regression check

- Confirm no return of "Craft. Built slowly. Built once.", quote banners, "4 drops / 4 flavours", "1 standard", "Batch 04 Active", "Limited First Batch", Follow Terps / Stay Close filler.
- Terminology: "Infused Pre-Roll" and "Caviar Stix" everywhere (artwork's "Caviar stick" is not used on the site).
- Product distinction preserved: Infused Pre-Roll = premium indoor flower with extracts, crumble and hash. Caviar Stix = the enhanced version with the exterior live resin/rosin plus hash treatment. No live-rosin coating language on the standard pre-roll.
- Strain Library and stockist locator verified, not rebuilt; only real defects fixed. No THC percentages shown.
- Re-run the 390 / 768 / 1280 route sweep to confirm no overflow, no console errors, all routes healthy.

## Technical notes

- Migrations, in order: role enum/table + `has_role()`; protected wholesale config and tier tables with grants, stockist/admin-only read and admin-only write, plus non-overlap/no-gap constraints; insert of the authoritative tiers; retail price updates; and finally the drop of the obsolete wholesale columns from the product table (destructive — separate, approval-gated step).
- Server functions touched: wholesale catalogue and checkout (entitlement-scoped reads, server-resolved tier pricing), admin catalogue/wholesale management, notify-me and newsletter send paths, BobPay webhook branches.
- Frontend touched: header nav, wholesale signup copy, wholesale catalogue/cart/checkout tier display, legal page layout, admin product list, retail price strings.


## Final report

Sections 1–12 as requested: changes made, four-way security test results, retail and wholesale flow pass/fail/blocked, per-email status, legal readiness, responsive regression, remaining client input, remaining Vincit configuration, Phase 2, completion percentages, recommendation.
