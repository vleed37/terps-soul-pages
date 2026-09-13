# Phase 1 — Verification & Evidence Pass

You asked for a report, not more building. Producing that report honestly requires running the tests first — several of them create data (test fixtures, webhook calls, account actions), which I cannot do in plan mode. Approving this plan lets me run the whole suite and return the report with evidence.

I will not report any item as PASS without a captured result (query output, HTTP status, screenshot, or log line).

## Commercial confirmation to record

- Wholesale delivery fee confirmed at R250 per order — recorded in the single commercial settings file as confirmed (removing the "awaiting confirmation" note for this value only).
- VAT stays disabled. Retail R80 / free over R500 stays marked unconfirmed.

## Test execution plan

Environment: current preview build. I will capture the preview URL and the exact build the tests ran against, and state plainly if no separate deployed preview version identifier exists.

Browser journeys (real clicks, screenshots at 390px, 768px and 1440px):
- Age gate: confirm, reload, 30-day persistence, Exit behaviour.
- First-visit prompt: appears after age confirmation and cookie acceptance, exact two actions, does not reappear on repeat visit.
- Newsletter: invalid email rejected, valid accepted, same email twice does not duplicate (verified in the database).
- Notify Me on an out-of-stock item using a clearly labelled test fixture strain: display, stored row, duplicate suppressed. Fixture removed afterwards.
- Product galleries on each product page.
- Retail cart persistence across reload and navigation.
- Guest checkout and signed-in checkout up to the payment handoff only.
- Registration, verification fixture, login, logout, password reset request, magic-link path.
- Protected route redirect returning to the originally requested page.
- Addresses: create, edit, delete.
- Marketing opt-in and opt-out.
- Account deletion / anonymisation, confirming order records survive.
- Guest-order claiming with a verified matching email, and a non-matching email rejected.
- Wholesale: immediate access after signup, dedicated wholesale cart, box quantities, minimum-order enforcement, wholesale checkout to handoff.
- Stockist map listing in three states: opted out, opted in but incomplete, fully eligible with a paid order.
- Every internal Phase 1 route visited and checked for 404 / error boundary.

Security and payment tests (safe fixtures, no live charges):
- Wholesale tier prices unreadable by anonymous and by a retail-only signed-in user.
- Cross-account reads rejected on customer, order, address and wholesale tables.
- Webhook with an invalid signature rejected.
- Webhook replay: second identical paid event returns success, creates no second order, sends no second email, does not decrement stock again.
- Failed and cancelled payment fixtures leave stock unchanged.
- One successful payment fixture produces exactly one order and exactly one stock decrement (stock counted before and after).
- Browser bundles and network responses scanned for any secret value; BobPay and email keys confirmed absent.

## Report format returned

1. Preview URL and tested build.
2. Files changed.
3. Migrations applied.
4. Tables and RLS policies changed.
5. PASS / FAIL / BLOCKED matrix over every Phase 1 requirement.
6. Evidence line per PASS.
7. Remaining external blockers.
8. Final conclusion in your exact required sentence form.

Anything depending on payment credentials, email sending credentials, real stockist data, VAT confirmation, courier details or legal sign-off is reported BLOCKED, with the underlying implementation still tested via fixtures.

## Technical notes

- Test data is created under clearly labelled fixture names and removed at the end; no production rows are deleted and no database reset occurs.
- Webhook tests target the preview endpoint with locally generated signatures; no third-party payment call is made.
- Credentials are never printed; anything needed goes through the project secret manager.
- No Phase 2 work: no admin dashboard, campaigns, exports, loyalty or reviews.
