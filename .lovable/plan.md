
# Terps — Phase 2 Build Plan

Large scope. I'll group into 5 milestones so you can approve all or stop after any one. Each milestone is independently shippable.

---

## Milestone A — Finish what was planned (Cart sync, Checkout↔Account, /shop)

**A1. Cart sync on login**
- New table `carts` already exists; add `cart_items` columns proper (strain_id, qty, unit_price_snapshot). Use existing tables.
- `src/lib/cart-sync.functions.ts` → `mergeCart({items})` server fn (auth-protected). Upserts a `carts` row keyed on `customer_id`, merges items by summing qty, caps at `strains.stock_quantity`, returns merged list.
- `src/lib/cart-sync.ts` browser glue called from the existing `onAuthStateChange` listener in `__root.tsx` on `SIGNED_IN`. Posts local Zustand cart, rehydrates from server result. On `SIGNED_OUT`, preserve local cart.

**A2. Checkout ↔ Account**
- Edit `src/routes/checkout.tsx`:
  - Unauthenticated → gold banner "Have an account? Sign in for faster checkout →" linking `/account/login?redirect=/checkout`.
  - Authenticated → loader prefetches `getMyCustomer` + `listMyAddresses`; prefill contact + show saved-address dropdown with "+ Add new" option.
  - "Save this address" checkbox triggers `createAddress` on success.
- `initiateBobpayPayment`: add optional auth — new lightweight middleware `attachSupabaseAuthOptional` (does NOT reject on missing token). Read `context.userId` if present, set `customer_id` on the inserted order. Falls back to guest behavior otherwise.

**A3. Real /shop page**
- Replace `src/routes/shop.tsx` placeholder with full catalog grid (reuse `StrainCard`), wired to `listStrains`. Header link works immediately.
- This page becomes the foundation for B1 (search/filter).

---

## Milestone B — Catalog upgrades (Search/Filter, Reviews, Wishlist, Related, Restock UX)

**B1. Search & filter on /shop**
- Client-side filter UI (URL-state via `useSearch`): text search (name/tagline), `effect_category` chips, THC% range slider, in-stock toggle, price sort. Use existing strain fields. No new tables.

**B2. Restock "Notify me" UI**
- On PDP when `stock_quantity === 0`: inline email capture → `requestRestock` server fn → inserts into existing `restock_notifications`.
- Cron job (`pg_cron` + `pg_net` → `/api/public/process-restock-notifications`) runs every 6h: finds unnotified rows where stock > 0, sends email via Resend, marks `notified=true`. Requires email infra (see Milestone E).

**B3. Product reviews**
- New tables: `reviews` (id, strain_id, customer_id, rating 1-5, title, body, status enum approved/pending/hidden, created_at). RLS: public read approved; insert by authenticated customers who have a paid order containing the strain; update own pending only.
- PDP: average rating + review list + "Write a review" CTA (auth-gated).
- Display average on `StrainCard` and `/shop` filter "min rating".

**B4. Wishlist / favorites**
- New table: `wishlists` (customer_id, strain_id, created_at), PK composite. RLS owner-only.
- Heart icon on `StrainCard` + PDP; unauth → redirects to login w/ intent.
- `/account/wishlist` route under `_authenticated`.

**B5. Related products + cart upsell**
- "You may also like" on PDP: same `effect_category`, exclude current, top 3 by `display_order`. Pure server fn, no schema.
- CartDrawer footer: 1-2 small "Add to your order" cards (best-sellers / on-sale).

---

## Milestone C — Commerce mechanics (Stock holds, Promo codes, Shipping zones, VAT)

**C1. Stock reservation on order create**
- Add `stock_reserved` column to `strains` (default 0) OR an `order_holds` table (preferred — auditable). Choose `order_holds (order_id, strain_id, qty, expires_at)`.
- `initiateBobpayPayment`: in a single SQL transaction (SECURITY DEFINER RPC `reserve_stock_for_order`) verify `stock - SUM(active_holds) >= requested_qty` and insert holds with `expires_at = now() + 30 min`.
- Webhook on successful payment → convert hold to actual stock decrement (existing `decrement_stock` RPC), delete the hold row.
- Webhook on failed payment → delete holds.
- `pg_cron` every 5min sweeps expired holds (deletes + marks order `cancelled`).
- Update product availability reads to subtract active holds from displayed stock.

**C2. Discount / promo codes**
- New tables:
  - `promo_codes` (code unique, description, kind enum: percent/fixed/free_shipping, value numeric, min_subtotal, max_uses, used_count, starts_at, expires_at, is_active).
  - `order_promo_redemptions` (order_id, promo_code_id, amount_applied).
- Server fn `validatePromo(code, subtotal)` returns discount preview.
- CartDrawer + Checkout: "Promo code" input → applies discount line. `initiateBobpayPayment` re-validates server-side, writes to `orders.discount` and creates redemption row, increments `used_count`.

**C3. Shipping zones & rates**
- New table `shipping_zones` (id, name, provinces text[], rate_zar, free_threshold, est_days_min, est_days_max, is_active).
- Seed with: Western Cape (R60, free>500, 1-2d), Gauteng (R90, free>600, 2-3d), Other (R120, free>800, 3-5d).
- Server fn `quoteShipping(province, subtotal)`; checkout re-quotes on province change. `delivery_fee` becomes dynamic.
- Order detail/order confirmation surfaces estimated delivery window.

**C4. VAT (South Africa, 15%)**
- All `price_zar` are VAT-inclusive (industry standard ZA retail). Just split for display.
- Show on cart/checkout/order: "Subtotal incl. VAT" + "(VAT 15% included: R{vat})". Persist `vat_amount` on `orders` for the invoice.

---

## Milestone D — Admin dashboard + Order operations (Refunds, Cancellations, Invoice PDF, Tracking)

**D1. Admin role + dashboard**
- `app_role` enum (`admin`, `staff`, `customer`), `user_roles` table with `has_role(user_id, role)` SECURITY DEFINER fn (per security rules — separate table, not on profiles).
- Layout `src/routes/_admin.tsx` gates on `has_role(uid, 'admin' OR 'staff')`.
- Pages:
  - `/admin` overview (today's orders, revenue, low stock).
  - `/admin/orders` list with filters by status/payment/date, search by number/email.
  - `/admin/orders/$id` detail with state transitions (paid → preparing → dispatched → delivered), add tracking number + URL, internal notes, send email triggers.
  - `/admin/strains` list with quick stock + price edit.
  - `/admin/promo-codes` CRUD.
  - `/admin/stockists` CRUD.

**D2. Refunds & cancellations**
- New table `refunds` (order_id, amount, reason, processed_by, bobpay_refund_id, status, created_at).
- Server fn `cancelOrder(orderId)` — only if unpaid OR paid<24h & not dispatched. Releases holds, calls BobPay refund if paid.
- Server fn `refundOrder(orderId, amount, reason)` — admin only; partial or full; BobPay refund API call; updates order.payment_status.
- Customer-facing: "Cancel order" button on order detail when eligible.

**D3. Invoice PDF**
- `@react-pdf/renderer` generated on demand server-side (works in Workers via `pdfkit` or `pdf-lib` — verify; fall back to HTML→PDF via Browserless if needed).
- Server fn `getInvoicePdf(orderNumber)` returns base64; auth gated to owning customer OR admin.
- Replace "Coming soon" badge with real download button.

**D4. Tracking URL**
- Already in schema. Just surface "Track shipment" button on order detail when `tracking_url` is set. Admin enters via D1.

---

## Milestone E — Production hygiene (email infra, sender domain, secrets)

- Configure email infrastructure (`setup_email_infra`) once user provides a sender domain.
- Scaffold branded auth email templates (confirm, reset, magic link).
- Scaffold transactional templates (order confirmation, payment received, order dispatched, refund processed, restock notification).
- Prompt for missing secrets: `BOBPAY_*`, `PUBLIC_SITE_URL`, `RESEND_*` (or use Lovable Emails).

---

## Technical Notes

- **Stack:** all server logic via `createServerFn` (auth-middleware or admin client). `/api/public/*` routes only for BobPay webhook & cron callbacks. No edge functions.
- **RLS:** every new table gets RLS with `customer_id = auth.uid()` policies; admin tables read via `has_role()`.
- **Migrations:** one migration per milestone (A: cart_items refinement; B: reviews, wishlists; C: order_holds, promo_codes, shipping_zones; D: app_role, user_roles, refunds).
- **Pricing source of truth:** still server-validated in `initiateBobpayPayment` — promo + shipping + VAT all re-computed there, never trusted from client.
- **Stock semantics:** displayed stock = `stock_quantity - SUM(active holds)`. Centralize via a view `strains_available`.
- **PDF library:** test `pdf-lib` first (pure JS, Workers-compatible). If insufficient, route through external service.

---

## Suggested order & rough sizing

| Milestone | Scope | Why now |
|---|---|---|
| **A** | Cart sync, checkout-account, real /shop | Smallest, finishes promised work, immediate UX win |
| **C** | Holds, promo, shipping, VAT | Required before serious traffic — prevents overselling, enables marketing |
| **D** | Admin + refunds + invoice | Required to operate the business daily |
| **B** | Reviews, wishlist, search, related | Conversion uplift |
| **E** | Email infra | Bundle when you give me a sender domain |

```text
Approve "all" or name milestones (e.g. "A and C only").
I'll execute one milestone per response so you can review between each.
```

