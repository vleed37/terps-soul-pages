# Wave 3 Closeout

Four scoped changes to finish Wave 3. No schema changes — existing trigger, RLS, and `getMyWholesaleAccount` already in place. One new server function (`updateWholesaleAccount`) and one new server route.

---

## 1. Approval email route

**New file:** `src/routes/api/public/wholesale-approval-email.ts`

Mirrors the defensive shape of `bobpay-webhook.ts`:

- Validates `X-Webhook-Secret` against `process.env.WHOLESALE_APPROVAL_WEBHOOK_SECRET` using `timingSafeEqual`. Missing env → 500; mismatch → 401.
- Parses body `{ account_id: string }` (matches the existing `notify_wholesale_approval` trigger payload — confirmed in `db-functions`).
- Fetches `wholesale_accounts` row via `supabaseAdmin`. 404 if missing. Skips silently (200) if `approval_status !== 'approved'` so re-fires are safe.
- If `RESEND_API_KEY` missing → log + return 200 (matches bobpay pattern).
- Sends Resend email via the gateway helper used in `bobpay-webhook` (same `fetch` pattern, same `from`, `to`, `subject`, `html`).
- 200 on success, 500 on Resend failure so the trigger can retry.

**Email template (inline HTML):**
- Cream `#FAF7F0` body, dark `#1a1a1a` text, max-width 560 centered card.
- Headline in Fraunces with Georgia fallback: `"Welcome, {business_name}."`
- Approval confirmation paragraph + sage-toned button styled `<a>` to `${PUBLIC_SITE_URL}/wholesale/login`.
- Support line referencing `sales@terpnation.co.za` (corrected spelling — see §4).
- Editorial signoff: `"Welcome to the network. — The Terps Team"`.

**Secret request:** call `add_secret` for `WHOLESALE_APPROVAL_WEBHOOK_SECRET` if `fetch_secrets` shows it missing. Note in the chat that the user must also run the `ALTER DATABASE postgres SET app.wholesale_approval_webhook_secret = '<same value>'` GUC. `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `PUBLIC_SITE_URL` are already present from prior waves.

---

## 2. Cross-context header banner

**New component:** `src/components/brand/StockistContextBanner.tsx`

- Uses a new lightweight client hook `useWholesaleAccount()` (created in `src/hooks/useWholesaleAccount.ts`) that wraps `useServerFn(getMyWholesaleAccount)` in a `useQuery` keyed `["wholesale-account-me"]`, gated on `supabase.auth.getSession()` being non-null. Returns `null` when unauthenticated, unapproved, or query errors.
- Renders only when:
  - account exists with `approval_status === 'approved'`, AND
  - `location.pathname` does NOT start with `/wholesale/dashboard`, AND
  - session-level dismiss flag (`sessionStorage["terps:stockist-banner-dismissed"]`) is not set.
- Markup: full-width `<a href="/wholesale/dashboard">` band, `background: var(--bg-elevated)`, 12px vertical padding, centered: business_name in Fraunces medium + rest in Manrope; hover → `var(--sage-muted)`. Right-aligned `<button>` × (stops propagation, sets sessionStorage flag, triggers local state to hide).
- Mobile (≤480px): text collapses to `**{business_name}** → Portal`.

**Mount:** import into `src/routes/__root.tsx` (or the existing site shell layout — verify on read) and render above the existing header, below the dark status band.

---

## 3. Account-update modal

**New server function:** `updateWholesaleAccount` in `src/lib/wholesale.functions.ts`

- `requireSupabaseAuth` middleware.
- Zod whitelist (the ONLY accepted fields):
  - `primary_contact_name`, `primary_contact_email`, `primary_contact_phone`
  - `address_line_1`, `address_line_2`, `city`, `province`, `postal_code`
- `.strict()` schema → unknown keys silently dropped via `.partial().pick(...)` shape (don't error on extras to match the brief).
- Writes via the authenticated client (RLS already restricts to `user_id = auth.uid()`).
- Returns the updated row.

**New component:** `src/components/brand/UpdateAccountModal.tsx`

- Dialog with cream surface, 8px radius.
- Header: sage label `✦ ACCOUNT DETAILS`, Fraunces M `"Your details."`.
- Two sections:
  - **Editable** — react-hook-form pre-filled from current account, the 8 whitelisted fields.
  - **Locked** — read-only display of `business_name`, `trading_as`, `business_type`, `vat_number`, `cipc_registration_number` + small note: *"Business identity is locked once approved. Contact us if any of these change."*
- Footer: ghost `Cancel` + `<GoldButton variant="dark">SAVE CHANGES</GoldButton>`.
- On submit: call server fn → `queryClient.invalidateQueries(["wholesale-account-me"])` and the dashboard's local account query → toast `"✓ Details updated."` → close.

**Wire into dashboard:** in `src/routes/wholesale.dashboard.index.tsx` and/or `wholesale.dashboard.tsx`, replace the existing "Update details" link with a button that opens the modal (local `useState` open flag).

---

## 4. Email typo find/replace

Site-wide replace `terpsnation.co.za` → `terpnation.co.za`. Confirmed occurrences:

- `src/components/layout/Footer.tsx` (CONNECT column, 2× in one line)
- `src/lib/cart-toast.ts`
- `src/lib/checkout.functions.ts`
- `src/lib/wholesale.functions.ts` (RESEND_FROM_EMAIL default + payment-error copy)
- `src/routes/api/public/bobpay-webhook.ts` (RESEND_FROM_EMAIL default)
- `src/routes/wholesale.tsx`
- `src/routes/wholesale.dashboard.tsx` (2×)
- `src/routes/wholesale.dashboard.index.tsx`

Single pass via `sed` across these paths, then re-`rg` to confirm zero hits remain.

---

## Out of scope

No DB migration, no auth changes, no admin UI, no Phase 2 work. QA scenarios in the brief are user-driven — not part of this implementation pass.

## Files touched

**Created:**
- `src/routes/api/public/wholesale-approval-email.ts`
- `src/components/brand/StockistContextBanner.tsx`
- `src/components/brand/UpdateAccountModal.tsx`
- `src/hooks/useWholesaleAccount.ts`

**Edited:**
- `src/lib/wholesale.functions.ts` (add `updateWholesaleAccount`, fix email typo)
- `src/routes/__root.tsx` (mount banner)
- `src/routes/wholesale.dashboard.index.tsx` (wire modal, fix email typo)
- `src/routes/wholesale.dashboard.tsx` (wire modal, fix email typo)
- `src/components/layout/Footer.tsx` (typo)
- `src/lib/cart-toast.ts`, `src/lib/checkout.functions.ts`, `src/routes/wholesale.tsx`, `src/routes/api/public/bobpay-webhook.ts` (typo)
- `src/routeTree.gen.ts` (regenerated for new api route — auto by Vite plugin, but add stub entry if needed)
