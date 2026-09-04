# Roadmap

## Wholesale portal — Phase 1 (in progress)
- [ ] Migration 1: drop client insert/update policies, default approval_status = 'approved', estimated_monthly_volume nullable, lock trigger (approval_status + user_id) for authenticated/anon only
- [ ] Migration 2: welcome-email trigger on INSERT/UPDATE via net.http_post (timeout 15000ms), exception-guarded, URL + secret from app_secrets
- [ ] Seed app_secrets: wholesale_approval_webhook_url = https://terps2.carbonmediasolutions.com/api/public/wholesale-approval-email
- [ ] Server fns: instant approval; optional VAT, registration number, monthly volume, trading name
- [ ] Welcome email rewrite (no approval wording); email logo height fix
- [ ] Copy: /wholesale Sign up → Log in → Order; portal shortcut; remove review/waiting wording
- [ ] Dashboard status screens: rejected, suspended, generic inactive fallback
- [ ] Header: Become a stockist / Stockist portal
- [ ] Retail checkout: delivery only, remove collect UI + copy
- [ ] brand.ts: VAT_RATE + WHOLESALE_DELIVERY_FEE single source
- [ ] Verify: REST insert/update rejected with user JWT; wrong-secret signup still creates account; pg_net response rows; preview vs published email wording; dashboard sticky measurements
