# Roadmap

## Done — Phase 1 wholesale/email closeout
- Security lint migration: EXECUTE revoked on 6 internal functions (all trigger/internal-only; none called via rpc(), none a column DEFAULT, none referenced in an RLS policy).
- Loud email handling via `src/lib/email.server.ts` — every send logs type + recipient; missing key returns `{sent:false,reason:"missing_api_key"}`.
- Welcome (stockist) email route returns 200/202/500 JSON as specified.
- Order notifications on BobPay webhook: retail + wholesale customer confirmation and internal "New order" to SALES_EMAIL (incl. email + payment ref/txn).
- Idempotency: duplicate paid webhook returns `{ok:true,duplicate:true}`, no stock change, no email (retail + wholesale). Paid-update failures now surface instead of silently breaking the guard.
- Retail checkout persists `delivery_method: "standard"` (DB constraint), delivery only, R80 / free ≥ R500.
- QA: anonymous + signed-in retail flows, wholesale E2E, suspension block, 375/390px sweep — all pass.

## Outstanding (needs config, not code)
- `RESEND_API_KEY` not set — no email actually leaves the app until it is added.
- `BOBPAY_MERCHANT_ID` not set — checkout returns "Payments not yet configured" instead of a redirect.

## Known minor issue
- Stockist finder dialog lacks a `DialogTitle` (Radix a11y console warning).

## Phase 1 remediation (tiered wholesale pricing) — done
- Retail prices corrected: pre-rolls R160, Caviar Stix R210.
- Protected tiered box pricing live (20 units/box); tiers verified at boxes 1,2,3,5,6,9,10,11 for both families.
- Wholesale prices readable only by approved stockists/admins (RLS + anon grants revoked); checkout totals recomputed server-side.
- Legal placeholder banners removed; notify-me is idempotent.
- Admin strain editor now edits retail price, stock, active flag and wholesale tiers.

### Open (needs user)
- Old unused columns on strains (wholesale_box_price_zar, wholesale_minimum_boxes, wholesale_available, box_quantity) still exist — dropping them needs approval.
- Missing env config: BOBPAY_* and RESEND_API_KEY — live payments and email sending remain unverified.
- Legal page wording still awaits client/legal review.

## Phase 1 verification pass (2026-09-13)
Evidence-based suite run against localhost preview with PHASE1TEST fixtures; all fixtures deleted by ID and baseline counts restored.
Fixes made during the pass:
- Account sub-pages (`/account/orders|addresses|settings`) rendered the overview instead of the child page — renamed to index routes.
- Unknown product slugs returned HTTP 200 — now throw notFound() (404).
- Account deletion now detaches orders and preserves buyer details before removing the auth user.
- Catalog copy no longer says "excluding VAT" while VAT is disabled; wholesale step copy no longer mentions approval waits.
Still blocked by external input: BobPay credentials (live handoff), Resend API key + sending domain (delivery), real stockist data, VAT confirmation, wholesale delivery fee confirmation (R250 configured, pending owner sign-off), courier info, legal copy approval.

## Terpene page + product page redesign, reviews, joints-sold counter (2026-09-15)
- Terpene library: "Understanding terpenes." with neutral Aroma/Flavour/Composition cards, original generated ingredient art (8 terpenes), real filtered strain links. No health/potency claims.
- Product page order: breadcrumbs → gallery → name → summary → rating → buy → details → reviews → stockist.
- Verified-buyer reviews: moderated (pending by default), purchase verification, one per buyer per product, HTML stripped, rate limited, reports private, approved-only aggregates. Legal clauses added to privacy/terms.
- "Terps joints sold" counter: paid retail + wholesale units only, baseline 0, replay-safe, hidden at zero.
- 3D model viewers removed from product cards (static imagery) — GLTF texture warnings gone; console clean at 390/768/1440.
- Verified: typecheck clean, build OK, all key routes 200 with no overflow, add-to-cart works, notify-me on out-of-stock captures email (fixture deleted, stock restored), wholesale pricing tables still return 401 to anonymous callers.

### Open (needs user)
- Security-linter warnings on the intentionally public aggregate SECURITY DEFINER functions still need a final security review before launch.
