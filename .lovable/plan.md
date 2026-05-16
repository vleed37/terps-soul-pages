
# Terps Prompt 2 — Cart, Checkout & BobPay

Builds cart state, drawer UI, checkout, BobPay payment flow, order confirmation, and branded confirmation emails on top of the existing design system. Uses **TanStack server functions** + a public server route for the webhook (not Supabase Edge Functions).

## 1. Assets

- Copy 4 new uploads (`Blue.jpg`, `Cookie2.jpg`, `Green2.png`, `Mangoi2.jpg`) into `src/assets/` and append their URLs to each strain's `gallery_image_urls` via a small data migration. Existing hero/product images remain in place.

## 2. Database (one migration)

New tables: `carts`, `cart_items`, `orders`, `order_items`. Sequence + `generate_order_number()` returning `TRP-2026-XXXX`. `decrement_stock(strain_id, qty)` SECURITY DEFINER function. Indexes on `orders.status`, `order_number`, `bobpay_transaction_id`. RLS:

- `orders` / `order_items`: public INSERT (server fn uses service-role anyway); SELECT only by `order_number` via dedicated server fn — no broad public read.
- `carts` / `cart_items`: not used by client in this prompt (Zustand+localStorage handles cart). RLS enabled, no public policies; tables remain for Prompt 3 (logged-in persistence).

## 3. Cart state

`bun add zustand` and create `src/lib/store/cart.ts` per the prompt's spec: Zustand + persist (localStorage `terps-cart`), `addItem` auto-opens drawer for 3s, `itemCount`, `subtotal`. SSR-safe (guard `localStorage`).

## 4. Cart drawer

`src/components/cart/CartDrawer.tsx` mounted in `__root.tsx`. 480px right-slide on desktop (cubic-bezier 500ms), bottom-sheet on mobile, backdrop blur fade 300ms. Header / empty state / item rows (80px thumb with accent gradient, name in Fraunces, tagline italic, remove ghost link, QuantityStepper reused from Prompt 1) / sticky footer with subtotal, delivery placeholder, total, "PROCEED TO CHECKOUT" gold CTA (4px radius).

Cart icon + count badge added to `Header.tsx` with pulse animation on increment.

## 5. Replace placeholder Add-to-Cart

Swap `cart-toast.ts` calls in `StrainCard`, `/strain/$slug`, and home featured cards with `useCart().addItem(...)`. Stock-aware: "SOLD OUT" disabled state, "Only X left" briefly when exceeding stock. Brief 1.0→1.1→1.0 image scale animation on click.

## 6. Checkout route `/checkout`

`src/routes/checkout.tsx`. Single page, 60/40 grid desktop, stacked + sticky bottom bar on mobile. Six sections per spec (Contact, Delivery Address, Delivery Method, Payment, Notes, Terms) as refined cards with Meta XS section labels. Sign-in/account-create shown as disabled "Coming soon". Provinces dropdown (9 SA provinces). Delivery radio cards with gold border when selected; "Collect from stockist" expands to a stockists dropdown (fetched via existing `stockists.functions`). React Hook Form + Zod validation; "PLACE ORDER" disabled until valid + terms checked. Sticky right-column order summary recomputes total live with delivery selection.

## 7. BobPay (TanStack, not Edge Functions)

`src/lib/checkout.functions.ts`:

- `initiateBobpayPayment` (POST): re-fetches strain prices/stock from DB (never trust client), computes subtotal + delivery (flat: 65 / 120 / 0), generates order number via RPC, inserts `orders` + `order_items` with `supabaseAdmin`, POSTs to `${BOBPAY_API_URL}/payments` with merchant_id, amount-in-cents, ZAR, return_url `${origin}/order/{orderNumber}`, cancel_url `${origin}/checkout?cancelled=true`, webhook_url `${origin}/api/public/bobpay-webhook`. Saves `bobpay_transaction_id` + sets `payment_status='pending'`. Returns `{ orderNumber, redirectUrl }`. On failure marks order failed and throws.
- `getOrderByNumber` (GET, public): returns order + items for the confirmation page (no PII filtering needed — guest fields are what we show).

`src/routes/api/public/bobpay-webhook.ts` server route (bypasses auth):
- POST handler reads raw body, verifies HMAC-SHA256 signature header `x-bobpay-signature` against `BOBPAY_WEBHOOK_SECRET` with `timingSafeEqual`.
- On `paid`/`successful`: update `payment_status='paid'`, `status='fulfilling'`, set `payment_completed_at`, call `decrement_stock` per item, fire Resend email.
- On `failed`/`cancelled`: update statuses accordingly.
- Idempotent (no-op if already `paid`).

## 8. Resend (connector)

I'll trigger `standard_connectors--connect` for Resend after plan approval. Email sent from the webhook via the connector gateway (`https://connector-gateway.lovable.dev/resend/emails`) using `LOVABLE_API_KEY` + `RESEND_API_KEY`. Dark-themed HTML template matching site brand (Fraunces headlines, gold accents, item list, totals, delivery info, CTA back to site). From-address: `orders@<resend verified domain>` — user will confirm domain at connect time.

## 9. Order confirmation `/order/$orderNumber`

`src/routes/order.$orderNumber.tsx`. Loader calls `getOrderByNumber`. Reads `?status` query param for failed/cancelled state. Sections per spec: hero ("Thank you." in Fraunces italic XL with gold radial glow), 4-step status timeline, order summary card, delivery card (with stockist details + Google Maps directions link when collect), "What's next" editorial section, primary "RETURN TO THE COLLECTION" CTA. Failure state shows refined error + "RETURN TO CHECKOUT".

## 10. Secrets

After plan approval I'll request via `add_secret`: `BOBPAY_MERCHANT_ID`, `BOBPAY_API_KEY`, `BOBPAY_API_URL`, `BOBPAY_WEBHOOK_SECRET`. Resend is supplied by the connector link (`RESEND_API_KEY` injected automatically); `RESEND_FROM_EMAIL` added as a secret so it's configurable.

## 11. Animations

Reuse existing tokens. Cart drawer cubic-bezier 500ms slide, 300ms backdrop fade, stagger item add/remove. Add-to-cart product scale 300ms, badge pulse. Checkout section reveal via existing `ScrollReveal`. Order hero text fade 700ms, timeline steps 400ms each.

## Technical notes

- All money math is server-side in cents at the BobPay boundary; stored as numeric ZAR in DB.
- Webhook is idempotent; signature check happens before any DB read.
- `client.server.ts` only imported inside `*.functions.ts` files (per import-graph rules).
- No edits to generated Supabase files, no edits to existing Prompt 1 design tokens.

## Acceptance

Maps 1:1 to the 15 criteria in the prompt, with Edge Functions replaced by TanStack server fn + public server route (same behavior, native to this stack).
