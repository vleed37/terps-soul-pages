# Wave 3 — Wholesale Dashboard (Phase 1)

Build the full B2B side of Terps: verified stockist signup, admin-gated approval, login with status enforcement, wholesale catalog with box pricing, stockist dashboard, order history, and BobPay-powered direct ordering. Approval itself stays manual in Supabase Studio.

## Scope reminder
In: schema, public Stockist Program landing, 3-step apply, login with status gating, dashboard, catalog, cart, checkout (BobPay reuse), orders + detail, RLS, approval email trigger, BobPay webhook dual-routing, nav awareness.
Out: tiered loyalty, consignment/invoicing, leaderboard, admin UI.

## Part A — Database (one migration)

Create three tables + extend `strains`:

1. `wholesale_accounts` (business identity, contact, address, approval workflow). One per `auth.users.id`. Indexes on `approval_status`, `user_id`. `updated_at` trigger.
2. Extend `strains` with `box_quantity` (default 20), `wholesale_box_price_zar`, `wholesale_minimum_boxes` (default 1), `wholesale_available` (default true). Seed all `product_line = 'pre_roll'` with R1600/box; Green Crack confirmed.
3. `wholesale_orders` (order_number `TRP-W-YYYYMM-NNNN`, totals, payment + fulfillment status, shipping JSON, BobPay txn id, notes).
4. `wholesale_order_items` (snapshot strain name, box qty, boxes ordered, total units, prices).

GRANTs: `authenticated` for select/insert/update on accounts and orders/items; `service_role` ALL on all three (webhook + admin functions). No `anon` grants — all gated by `auth.uid()`.

RLS:
- `wholesale_accounts`: user can read/insert own; update only while `pending`. Admin (`raw_user_meta_data->>'role' = 'admin'`) full.
- `wholesale_orders`: user reads own; insert only if their account is `approved`. Admin full.
- `wholesale_order_items`: user reads via parent order ownership. Admin full.

Approval-notification trigger: a Postgres trigger that, on `approval_status` transition `pending → approved`, calls a TanStack server route via `net.http_post` (or — simpler given this stack — we'll skip pg_net and instead poll inside an `adminApproveWholesaleAccount` server fn later in Phase 2; for Phase 1 we wire a `send-wholesale-approval-email` server route at `/api/public/wholesale-approval-email` protected by a shared secret header, and let the trigger POST to it with that secret). Email via Resend if `RESEND_API_KEY` is set; no-op + log otherwise (matches existing bobpay-webhook pattern).

Admin notification on new application: handled in the apply server fn (not a trigger) — sends to a fixed admin email pulled from `WHOLESALE_ADMIN_EMAIL` env. Graceful no-op if unset.

## Part B — `/wholesale` public landing (rewrite)

Replace existing `src/routes/wholesale.tsx` placeholder.

- **Hero** wrapped in `.tone-dark`: sage `✦ STOCKIST PROGRAM` label, Fraunces XL title "Become a Terps stockist.", cream italic subhead, two CTAs: primary `APPLY TO STOCK` (scrolls to `#apply`), ghost cream `STOCKIST LOGIN` → `/wholesale/login`.
- **Benefits** (cream, 3 cards): Wholesale Pricing, Early Access, Brand Support — sage stroke icons, Fraunces header, Manrope body.
- **How it works** wrapped in `.tone-sage`: 3-step indicator (Apply / Approve / Stock).
- **Inquiry form** at `#apply` (cream) — see Part C.
- **Already a stockist** footer card (cream) → `/wholesale/login`.

## Part C — Application form (inline on `/wholesale#apply`)

Inline 3-step form on the landing page (no separate route — better UX flow from CTA to form).

- Step 1: business identity (name, trading as, type, VAT, CIPC, monthly volume).
- Step 2: contact + address.
- Step 3: email/password + 2 consent checkboxes.
- Zod validation per step; Back on 2/3; progress label `Step X of 3 · Label`.
- Submit flow (server fn `submitWholesaleApplication`):
  1. `supabase.auth.signUp` from client with `account_type: 'wholesale'` metadata.
  2. Then call server fn `createWholesaleAccount` (uses `requireSupabaseAuth`, inserts row with `approval_status: 'pending'`).
  3. Server fn also sends admin notification email (Resend, optional).
  4. Show success screen: sage label "✦ APPLICATION RECEIVED", Fraunces "Thanks. We're reviewing.", body, back link.

Note on Supabase auto-confirm: per project rules we don't enable auto-confirm. Stockists must verify email before login works — which is fine and aligns with the manual-approval flow.

## Part D — Approval workflow

- Phase 1: admin edits row in Supabase Studio, sets `approval_status='approved'`, `approved_at=now()`, `approved_by=<their uid>`.
- DB trigger `notify_wholesale_approval` POSTs to `/api/public/wholesale-approval-email` with a shared secret header. Route validates secret, fetches account, sends Resend email with link to `/wholesale/login`.
- Requires Supabase `pg_net` extension. If not enabled, plan migration enables it.
- New secret needed: `WHOLESALE_APPROVAL_WEBHOOK_SECRET` (we'll request via add_secret in build mode). Optional: `WHOLESALE_ADMIN_EMAIL`.

## Part E — `/wholesale/login`

Cream page, sage label `✦ STOCKIST PORTAL`, Fraunces "Welcome back.", email/password form.

Login handler:
1. `signInWithPassword`.
2. Read `wholesale_accounts` for user.
3. If missing → sign out + "Not registered as stockist".
4. If `pending` / `rejected` / `suspended` → sign out + status-specific message (rejection includes `rejection_reason`).
5. If `approved` → navigate to `/wholesale/dashboard`.

Footer links: forgot password (reuses existing `/account/forgot-password` flow), apply link.

## Part F — Route guard

Add pathless layout `src/routes/_wholesale.tsx` (or `_authenticated.wholesale.tsx` style — we'll use a dedicated `_wholesaleAuth.tsx` layout to avoid coupling with retail account guard).

`beforeLoad`: synchronous context check + child `beforeLoad` that calls `supabase.auth.getUser()` and a server fn `getMyWholesaleAccount` (requireSupabaseAuth). If no account or status ≠ approved → redirect `/wholesale/login`.

All portal routes live under this layout: dashboard, catalog, orders, orders/$id, checkout.

## Part G — Catalog `/wholesale/dashboard/catalog`

Server fn `listWholesaleStrains` (requireSupabaseAuth + verifies approved) returns active strains with wholesale fields where `wholesale_available = true`.

Wholesale strain card: image, name, strain type pill, sage "BOX PRICING" label, `R{box_price}/BOX`, "{box_qty} units · R{unit_price}/unit", min order note, box stepper (+/−), `ADD TO ORDER` GoldButton dark.

New client store `useWholesaleCart` (Zustand, mirror of existing retail cart pattern in `src/lib/store/cart.ts`) — separate to avoid mixing units/boxes with retail cart.

## Part H — Cart drawer + Dashboard

**Dashboard** `/wholesale/dashboard`:
- Header with business name.
- 4 metric cards: orders placed, last order, active since, status pill.
- Two CTAs: Browse Catalog, View Orders.
- Recent orders (last 5) table.
- Account info block + "Update details" modal (server fn `updateWholesaleAccount` — only allows safe contact/address fields; business identity locked once approved).
- Support footer link.

**Cart drawer**: separate `WholesaleCartDrawer` component, opens on add. Lines, subtotal, flat R250 shipping (placeholder), VAT 15% applied always (Phase 1), total, CTA to checkout.

## Part I — Checkout `/wholesale/dashboard/checkout`

3 steps: Review (lines + editable shipping pre-filled from account + notes) → Payment (reuse BobPay integration from retail `src/routes/checkout.tsx` — extract a shared `BobPayPayment` component if reasonable, else inline duplicate) → Confirmation.

Server fn `createWholesaleOrder`:
- Validates cart against current `strains.wholesale_box_price_zar` (no client-trusted prices).
- Generates order number `TRP-W-YYYYMM-NNNN` via a new `wholesale_order_number_seq` or function `generate_wholesale_order_number`.
- Inserts `wholesale_orders` + `wholesale_order_items`.
- Returns order id + BobPay reference for the payment widget.

## Part J — Orders pages

`/wholesale/dashboard/orders`: filter (status), sort, table with order #, date, items count, total, payment + fulfillment pills, tracking link.

`/wholesale/dashboard/orders/$id`: full breakdown — line items snapshot, totals, shipping, tracking, BobPay txn id, support link.

Server fns: `listMyWholesaleOrders`, `getMyWholesaleOrder(id)` (both requireSupabaseAuth, scoped by `user_id`).

## Part K — BobPay webhook dual-routing

Update `src/routes/api/public/bobpay-webhook.ts`:
- Existing logic finds order by `order_number` in `orders`. Extend: if not found, look up in `wholesale_orders` by `order_number`.
- On paid: update appropriate table's `payment_status='paid'`, `paid_at=now()`, `bobpay_transaction_id`. For wholesale, also set `fulfillment_status='preparing'`.
- Wholesale orders skip retail stock-decrement RPC (stock managed differently for boxes — out of scope Phase 1).
- Send confirmation email to wholesale primary contact via Resend.

## Part L — Nav awareness

`src/components/layout/Header.tsx`:
- If user is authenticated AND has approved wholesale account: when path starts with `/wholesale/dashboard`, show portal nav (Dashboard / Catalog / Orders / Sign out).
- When on retail routes, show subtle cream banner above header: "Signed in as {business_name} — Go to stockist portal →" linking to dashboard.

Account context fetched via new `useWholesaleAccount` hook backed by server fn (cached).

## Technical details

**New files**
- Migration: `supabase/migrations/<ts>_wholesale.sql` (all schema + RLS + seeds + trigger + pg_net).
- Server fns: `src/lib/wholesale.functions.ts` (apply, getMyAccount, updateMyAccount, listStrains, createOrder, listOrders, getOrder).
- Public route: `src/routes/api/public/wholesale-approval-email.ts` (Resend, shared-secret guarded).
- Routes: rewrite `src/routes/wholesale.tsx`; new `src/routes/wholesale.login.tsx`, `src/routes/wholesale.dashboard.tsx` (layout), `src/routes/wholesale.dashboard.index.tsx`, `.catalog.tsx`, `.orders.tsx`, `.orders.$id.tsx`, `.checkout.tsx`.
- Components: `WholesaleHero`, `WholesaleBenefits`, `WholesaleHowItWorks`, `WholesaleApplyForm`, `WholesaleStrainCard`, `WholesaleCartDrawer`, `WholesaleBanner`, `WholesalePortalNav`.
- Stores: `src/lib/store/wholesale-cart.ts`.
- Types extend `src/lib/types.ts` with `WholesaleAccount`, `WholesaleOrder`, `WholesaleOrderItem` + strain wholesale fields.

**Secrets to request (in build mode via add_secret)**
- `WHOLESALE_APPROVAL_WEBHOOK_SECRET` (required for trigger → email route).
- `WHOLESALE_ADMIN_EMAIL` (optional, for new-application notifications).
- Reuses existing `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.

**Risks / decisions to confirm**
1. `pg_net` extension availability — migration enables it; if blocked we'll fall back to client-side notification on approval status read.
2. Inline 3-step form on `/wholesale` (single route) vs separate `/wholesale/apply` — plan uses inline per UX continuity from hero CTA. Easy to split later.
3. BobPay payment widget reuse — we'll refactor minimally; if the retail checkout uses inline-only state, we duplicate rather than risk regressing retail.
4. Email verification — Supabase default requires confirmation. Plan keeps it on (matches project rule). Approval email + verification email are separate; UX copy on apply success will mention both.

## Order of operations
1. Migration (Part A + approval trigger + pg_net).
2. Types + server fns (Parts C/E/F/G/I/J skeletons).
3. Public landing rewrite (Part B) + inline apply form (Part C).
4. Login + guard (Parts E/F).
5. Dashboard + account modal (Part H).
6. Catalog + cart drawer (Parts G/H).
7. Checkout + createOrder (Part I).
8. Orders list + detail (Part J).
9. BobPay webhook extension (Part K).
10. Header nav awareness + banner (Part L).
11. Approval email route + trigger wiring (Part D).
12. Manual QA pass: RLS isolation between two test stockists, full flow apply → approve → login → order → webhook → orders list, retail regression check, mobile pass at 375px.
