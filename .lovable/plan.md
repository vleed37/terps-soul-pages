# Pre-publish: lint audit, verification sweep, loud email failures

Three parts: (1) prove the extra security migration broke nothing and re-test the retail paths, (2) run the verification items still outstanding from the wholesale plan, (3) make a missing email key loud instead of silent and document every send site.

## 1. The unplanned security migration — audit and re-test

The second migration only revoked `EXECUTE` from `anon`, `authenticated`, `public` on six functions and pinned `search_path` on two trigger functions. No signatures, bodies (beyond search_path), grants to `service_role`, tables, or policies changed.

Functions whose EXECUTE was revoked:
- `generate_wholesale_order_number()`
- `handle_new_user()`
- `notify_wholesale_approval()`
- `wholesale_accounts_lock_fields()`
- `touch_updated_at()`
- `touch_orders_updated_at()`

Already verified by read-only queries before this plan:
- (b) No table in `public` has any of these (or `generate_order_number` / `decrement_stock`) as a column DEFAULT — the `information_schema.columns` scan returns zero rows.
- (c) No RLS policy in `public` references them — the `pg_policies` scan of `qual` + `with_check` returns zero rows.
- (a) Codebase search finds only three `.rpc()` call sites, all on the **admin** client (`service_role`, which kept its grants): `generate_order_number` (`src/lib/checkout.functions.ts`), `generate_wholesale_order_number` (`src/lib/wholesale.functions.ts`), `decrement_stock` (`src/routes/api/public/bobpay-webhook.ts`). None of the six revoked functions is called via `supabase.rpc()` from client code or from a server function using the user's client. The four trigger functions are invoked by triggers as table owner, and `handle_new_user` runs on `auth.users` insert as SECURITY DEFINER.

Then re-run in a headless browser, twice — once as an anonymous visitor, once signed in as a retail customer — reporting PASS/FAIL and any console/network error for each:
- Drop Alerts subscribe (homepage) — insert into `subscribers`.
- Find closest stockist modal — result list renders.
- Add to cart → `/checkout` → submit → BobPay redirect URL reached.

Signed-up account creation goes through the normal retail register flow so the `handle_new_user` trigger is exercised too.

## 2. Outstanding verification items

Run and report each:

- **a. Wholesale end-to-end** — sign in as the seeded stockist (`vincit@carbonmediasolutions.com`) → catalogue shows box price and minimum boxes per strain → add to cart → checkout → BobPay redirect.
- **b. Suspension** — set that account to `suspended` (SQL editor role, so the lock trigger does not revert it) → confirm the catalogue query and order creation are both rejected → restore to `approved` and confirm access returns.
- **c. Retail fee** — checkout offers delivery only; a cart under R500 charges R80, a cart at/above R500 charges R0. Both cases tested with real carts and the totals read off the page.
- **d. Responsive** — 375px and 390px on `/wholesale`, `/wholesale/login`, `/wholesale/dashboard`, `/checkout`: no horizontal overflow, all primary CTAs reachable.

Also reported: whether the welcome email actually delivered once `RESEND_API_KEY` exists, plus the `net._http_response` row for it. Without the key the route returns "not sent" (see part 3) rather than appearing to succeed.

## 3. Loud email failures + send-site inventory

Every send site gets the same treatment: when `RESEND_API_KEY` is absent, log a single clear warning naming the email type and the recipient, and surface the outcome to the caller instead of pretending success.

- `src/routes/api/public/wholesale-approval-email.ts` — returns HTTP **202** with `{"sent": false, "reason": "missing_api_key"}` instead of `"ok"`. Successful send returns `{"sent": true}`. A provider failure keeps returning 500 so pg_net records it.
- `src/lib/wholesale.functions.ts` (admin notification) and `src/routes/api/public/bobpay-webhook.ts` (order confirmation) — same warning shape; the webhook still returns 200 to BobPay because payment capture must not be retried over an email problem, but the missing-key reason is logged and included in its JSON response.
- Warning format: `[email] SKIPPED <type> to <recipient> — RESEND_API_KEY not set`. A provider error logs `[email] FAILED <type> to <recipient> — <status> <body>`.

### Where the site sends email (for Resend domain setup)

| Type | Trigger | From address | Template lives in |
| --- | --- | --- | --- |
| Stockist welcome | New `wholesale_accounts` row set to `approved` → DB trigger → `net.http_post` → public route | `RESEND_FROM_EMAIL`, default `Terps <orders@terpnation.co.za>` | `src/routes/api/public/wholesale-approval-email.ts` |
| New-stockist internal notice | Stockist sign-up, sent to `WHOLESALE_ADMIN_EMAIL` (falls back to `SALES_EMAIL`) | same | `src/lib/wholesale.functions.ts` |
| Retail order confirmation | BobPay webhook marks a retail order paid | same | `src/routes/api/public/bobpay-webhook.ts` |
| Wholesale order confirmation (new, part 4) | BobPay webhook marks a wholesale order paid | same | `src/routes/api/public/bobpay-webhook.ts` |
| Internal "New order" notice (new, part 4) | Either order type marked paid, sent to `SALES_EMAIL` | same | `src/routes/api/public/bobpay-webhook.ts` |

Supabase Auth also sends sign-up/password-reset mail; that uses the built-in auth mailer, not Resend.

Note: `SALES_EMAIL` is `sales@terpnation.co.za` and the default from-address is `orders@terpnation.co.za`, so `terpnation.co.za` is the domain to verify in Resend. Once verified, set `RESEND_API_KEY` (and optionally `RESEND_FROM_EMAIL`) as project secrets.

## 4. Order notifications

**Current behaviour (verified):** a paid **wholesale** order sends nothing at all — the wholesale branch of `src/routes/api/public/bobpay-webhook.ts` updates `payment_status`/`fulfillment_status` and returns `ok`, with no email to the stockist and none to Terps. A paid **retail** order sends only the customer confirmation; Terps receives nothing.

Add to the webhook, for both order types once payment is confirmed:

- **a. Internal "New order" to `SALES_EMAIL`** — subject `New [retail|wholesale] order #<number> — <name>`. Body: order number, retail/wholesale, customer or stockist name, **their email address**, phone, line items with quantities (boxes and total units for wholesale, units for retail), delivery address, total paid, and the **BobPay payment reference / transaction id** so Terps can reply and reconcile without opening the database.
- **b. Wholesale confirmation to the stockist** — mirrors the retail confirmation (order number, thank-you line, box line items, total), sent to the account's `primary_contact_email`.

Both go through the same loud-failure helper as part 3. The webhook always returns 200 to BobPay regardless of email outcome — payment capture must never be retried over an email problem — and logs each email's outcome.

**Idempotency (verified present today):** both branches already short-circuit a repeat delivery — the retail branch returns `ok` when `order.payment_status === "paid"` before any update, stock decrement or email, and the wholesale branch does the same on `wholesale_orders.payment_status`. The new email sends go **after** those guards, so a duplicate webhook sends nothing and never re-runs `decrement_stock`. The report will state that the guard already existed rather than being added; if the reads during build show otherwise, the guard is added before the sends.


## Technical notes

- A small server-only helper (`src/lib/email.server.ts`) becomes the single outbound path: it logs `[email] SENT|SKIPPED|FAILED <type> to <recipient>` and returns `{ sent, reason }`. All four existing send sites plus the two new ones use it, so the loud behaviour is defined once.
- No new migration is needed for parts 1, 3 and 4. Part 2b uses two temporary SQL updates on one row and restores it.
- The single remaining lint finding (`RLS Enabled No Policy` on `public.app_secrets`) stays intentional: the table is read only by the SECURITY DEFINER trigger, and adding any client policy would expose the webhook secret.
- Files edited: new `src/lib/email.server.ts`, plus `src/routes/api/public/wholesale-approval-email.ts`, `src/routes/api/public/bobpay-webhook.ts`, `src/lib/wholesale.functions.ts`, and `roadmap.md`.
- Closes with typecheck, build, the final send-site table, and the full PASS/FAIL report for parts 1 and 2.

