
# Terps Prompt 2 — Revised (secrets deferred)

Same scope as the approved plan, but no secrets are requested now. BobPay + Resend code is written and reads from `process.env.*` at request time — it throws a clean "Payments not yet configured" error until you add the secrets later via the Lovable secrets manager. The rest of the flow (cart, drawer, checkout UI, order schema, confirmation page) works fully without any secrets.

## Build order

1. Cart store (`src/lib/store/cart.ts`) — Zustand + localStorage, SSR-safe.
2. Cart drawer (`src/components/cart/CartDrawer.tsx`) + cart icon/badge in `Header.tsx`. Mounted in `__root.tsx`.
3. Replace `cartLaunchingSoon` calls in `StrainCard`, `/strain/$slug`, home featured with real `addItem`. Stock-aware states.
4. `/checkout` route — full form, RHF + Zod, sticky order summary, stockist picker for collect.
5. `src/lib/checkout.functions.ts` — `initiateBobpayPayment` + `getOrderByNumber`. Runtime env check returns a clean error if `BOBPAY_*` missing.
6. `src/routes/api/public/bobpay-webhook.ts` — HMAC-verified webhook, idempotent, decrements stock, fires Resend email (no-op + log if `RESEND_API_KEY` missing).
7. `/order/$orderNumber` confirmation page — hero, status timeline, summary, delivery, failure state.
8. Branded HTML email template (dark theme, Fraunces, gold accents).

## Deferred until you add secrets

- `BOBPAY_MERCHANT_ID`, `BOBPAY_API_KEY`, `BOBPAY_API_URL`, `BOBPAY_WEBHOOK_SECRET` — needed to actually initiate payment + verify webhooks.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — needed to actually send the confirmation email.

I'll surface a one-line "Add secrets" instruction at the end so you can wire them when ready. Until then, the "PLACE ORDER" button will return a friendly error from the server fn.

Everything else from the previously approved plan (DB migration is already applied, gallery images already inserted) stays the same.
