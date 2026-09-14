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

## Done — Retail product detail relayout
- Simplified every retail product page to product photography, concise product copy, purchase controls, stockist access, and Caviar-only infusion components.
- Renamed Girl Scout Cookie display name without changing its slug, updated the shop heading, centralized retail delivery constants, and enforced HTML revalidation.
- Verified all seven products at 375px/390px, typecheck, build, cart state, stockist modal, response caching, and zero console errors.
- Added accessible titles to the stockist and restock dialogs.

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

## Wholesale mixed boxes (in progress)
- Build a mixed box per product line (pre_roll, caviar_stix), exactly 20 units, one line only.
- Additive box_composition snapshot on wholesale_order_items + DB validation trigger.
- Server-authoritative line tier pricing shared by single-strain and mixed boxes.
- Atomic paid-webhook stock decrement per strain incl. mixed composition, replay-safe.
- Report: product_line values, tier rule, stock caps, prior webhook decrement gap, rejection tests.
