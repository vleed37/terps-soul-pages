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
