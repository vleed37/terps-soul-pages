# Roadmap

## Wholesale portal — Phase 1 (shipped)
- [x] Migrations: policies, approved default, nullable volume, lock trigger, welcome-email trigger via net.http_post
- [x] Server fns: instant approval; optional VAT, registration number, monthly volume, trading name
- [x] Copy sweep, header entry point, delivery-only retail checkout, shared VAT/delivery constants

## Pre-publish pass (current)
- [x] Security-lint migration audit: revoked-EXECUTE functions vs rpc call sites, column defaults, RLS expressions
- [x] Loud email failures: shared `src/lib/email.server.ts`, welcome route returns 202 `{sent:false,reason:"missing_api_key"}`
- [x] Order notifications: internal "New order" to SALES_EMAIL (retail + wholesale, with email + BobPay ref) and wholesale confirmation to the stockist
- [x] Idempotency guard confirmed on both webhook branches (no duplicate stock decrement, no duplicate email)
- [ ] Verification: retail flows anon + signed-in, wholesale end-to-end, suspension block, R80/free-over-R500, 375/390px
- [ ] Add RESEND_API_KEY once terpnation.co.za is verified in Resend, then confirm the welcome email delivers
