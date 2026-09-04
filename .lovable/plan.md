# Wholesale portal — Phase 1 changes

Instant sign-up (no approval step), optional VAT/registration/volume fields, header entry point, delivery-only retail checkout, one place for VAT and wholesale delivery fee, plus two loose ends from the homepage change.

## Findings (verified before planning)

- Only one `wholesale_accounts` row exists: **Carbon Media Solutions** (vincit@carbonmediasolutions.com), status `approved`, VAT and registration numbers empty. **No `pending` rows, so no data cleanup is needed.**
- `vat_number` and `cipc_registration_number` are already nullable. `estimated_monthly_volume` is `NOT NULL`, so making it optional needs a migration.
- **The current email trigger is broken.** `notify_wholesale_approval()` calls `extensions.http_post`, and the only HTTP function in this database is `net.http_post` (pg_net, installed in schema `net`) — that is the asynchronous, after-commit pg_net call. The rewrite uses `net.http_post`.
- Both `createWholesaleAccount` and `updateMyWholesaleAccount` already use the **admin client**, so no client-side INSERT/UPDATE policies are needed.
- Email confirmation: auto-confirm is **on** for this project, so a new stockist gets a session immediately. The plan re-asserts that setting (signup enabled, anonymous users off, leaked-password protection on) so it cannot drift; the welcome email therefore has no "confirm your address" line, and the login page keeps a graceful message for an unconfirmed user.
- Currently required in the application: business name, business type, estimated monthly volume, contact name, contact email, contact phone, address line 1, city, province. Optional: trading name, VAT, registration number, address line 2, postal code.

## Migration 1 — policies, default, lock trigger

```sql
-- All writes go through server functions using the admin client, so remove
-- the client write paths entirely. SELECT own-row policy stays.
DROP POLICY IF EXISTS "wholesale_accounts_own_insert" ON public.wholesale_accounts;
DROP POLICY IF EXISTS "wholesale_accounts_own_update_pending" ON public.wholesale_accounts;

-- Manual inserts now match the new flow.
ALTER TABLE public.wholesale_accounts
  ALTER COLUMN approval_status SET DEFAULT 'approved';

-- Monthly volume becomes optional.
ALTER TABLE public.wholesale_accounts
  ALTER COLUMN estimated_monthly_volume DROP NOT NULL;

-- Belt-and-braces: a client JWT caller can never move status or ownership.
-- Only 'authenticated'/'anon' are locked, so SQL editor and dashboard edits
-- (where auth.role() is NULL) can still suspend an account by hand.
CREATE OR REPLACE FUNCTION public.wholesale_accounts_lock_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
begin
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    new.approval_status := old.approval_status;
    new.user_id := old.user_id;
  end if;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS lock_wholesale_fields ON public.wholesale_accounts;
CREATE TRIGGER lock_wholesale_fields
  BEFORE UPDATE ON public.wholesale_accounts
  FOR EACH ROW EXECUTE FUNCTION public.wholesale_accounts_lock_fields();
```

## Migration 2 — welcome email trigger

Webhook URL stored in `public.app_secrets` under key `wholesale_approval_webhook_url`, exact value:

`https://terps2.carbonmediasolutions.com/api/public/wholesale-approval-email`

Checked: `public.app_secrets` has `updated_at timestamptz not null default now()` and a primary key on `key`, so the `ON CONFLICT (key)` upsert below is valid as written.

```sql
INSERT INTO public.app_secrets (key, value)
VALUES ('wholesale_approval_webhook_url',
        'https://terps2.carbonmediasolutions.com/api/public/wholesale-approval-email')
ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = now();

CREATE OR REPLACE FUNCTION public.notify_wholesale_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'net'
AS $$
declare
  webhook_url text;
  webhook_secret text;
  should_send boolean := false;
begin
  if tg_op = 'INSERT' then
    should_send := new.approval_status = 'approved';
  else
    should_send := old.approval_status is distinct from new.approval_status
                   and new.approval_status = 'approved';
  end if;

  if should_send then
    select value into webhook_url   from public.app_secrets where key = 'wholesale_approval_webhook_url';
    select value into webhook_secret from public.app_secrets where key = 'wholesale_approval_webhook_secret';

    if webhook_url is null then
      raise warning '[wholesale] webhook url not configured; skipping welcome email';
      return new;
    end if;

    begin
      -- pg_net: asynchronous, request is sent after commit.
      perform net.http_post(
        url := webhook_url,
        body := jsonb_build_object('account_id', new.id),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'X-Webhook-Secret', coalesce(webhook_secret, '')
        ),
        timeout_milliseconds := 15000
      );
    exception when others then
      raise warning '[wholesale] welcome email dispatch failed: %', sqlerrm;
    end;
  end if;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS trigger_wholesale_approval ON public.wholesale_accounts;
CREATE TRIGGER trigger_wholesale_approval
  AFTER INSERT OR UPDATE ON public.wholesale_accounts
  FOR EACH ROW EXECUTE FUNCTION public.notify_wholesale_approval();
```

## A. Instant sign-up

`src/lib/wholesale.functions.ts`
- Insert with `approval_status: "approved"`, `approved_at: now()`, via the admin client.
- `listWholesaleStrains` / `createWholesaleOrder` keep requiring `approved`, so a hand-suspended account is blocked from catalogue and ordering.
- `updateMyWholesaleAccount` whitelist unchanged (contact name/email/phone + address); stays on the admin client.
- Application schema: `vat_number`, `cipc_registration_number`, `estimated_monthly_volume`, `trading_as` all optional. Required: business name, business type, contact name, contact email, contact phone, address line 1, city, province.
- Display name falls back to business name wherever trading name is shown.

`src/routes/api/public/wholesale-approval-email.ts`
- Rewritten as a welcome, not an approval: account is ready, "Sign in to your portal" button, one line that ordering is by the box with minimums shown in the catalogue, `SALES_EMAIL` for questions. Timing-safe secret check unchanged.

`src/routes/wholesale.dashboard.tsx`
- Keep `rejected` and `suspended` screens; add a generic "your account isn't active — contact us" fallback for any other non-approved status. No review/48-hour wording.

`src/components/brand/UpdateAccountModal.tsx`
- "locked once approved" → "Business identity is locked. Contact us if any of these change."

## B. Copy

`src/routes/wholesale.index.tsx`
- Three steps become **01 Sign up → 02 Log in → 03 Order**; remove the Approve step and "Approval typically within 48 hours".
- "Apply Now" → "Sign up".
- A logged-in user who already has a stockist account sees a **"Go to your stockist portal"** panel linking `/wholesale/dashboard` instead of the form.
- VAT, registration number and monthly volume labelled "optional".

Review/approval/waiting wording also swept from `wholesale.dashboard.tsx`, `wholesale.dashboard.index.tsx` (Status card kept), `wholesale.login.tsx`, and the email.

## C. Header entry point

`src/components/layout/Header.tsx` — one extra nav item in desktop nav and mobile menu, existing styling: **Become a stockist → /wholesale**, or **Stockist portal → /wholesale/dashboard** when `useWholesaleAccount()` returns an account. Visitor variant renders while loading, so no wrong-label flicker.

## D. Delivery only (retail)

- `src/routes/checkout.tsx` — remove the "Collect from Stockist" radio and branch.
- `src/lib/checkout.functions.ts` — `deliveryMethod` narrows to `z.literal("delivery")`; fee always `subtotal >= 500 ? 0 : 80`; `collect_stockist_id` always null. Column stays.
- `src/routes/order.$orderNumber.tsx` — drop the collection branch.
- `src/routes/legal.shipping.tsx` — remove the "Collection at a Stockist" section.
- Sweep order-confirmation email copy for pickup/collection wording.

## E. One place for VAT and wholesale delivery fee

- `src/lib/brand.ts` — `export const VAT_RATE = 0.15;` and `export const WHOLESALE_DELIVERY_FEE = 250;`.
- `src/lib/wholesale.functions.ts` — drop local `VAT_RATE` / `SHIPPING_FLAT`, import from brand.
- `src/lib/store/wholesale-cart.ts` — `WHOLESALE_VAT_RATE` / `WHOLESALE_SHIPPING` re-export the brand constants so existing imports keep working.

## F. Loose ends

10. Audit every email template embedding the wordmark (welcome email, order confirmation in `checkout.functions.ts`) and set an explicit rendered `height` matching the pre-trim visual size; report which templates actually embed a logo.
11. Sign in as the seeded stockist headlessly and measure the gap between the 64px scrolled header and the first top/sticky element on `/wholesale/dashboard`, `/wholesale/dashboard/catalog`, the cart drawer, `/wholesale/dashboard/checkout`, `/wholesale/dashboard/orders`; report each and fix any gap/overlap.

## Verification

- Fresh sign-up → session → row created `approved` → welcome email fires → login → box prices and minimums → order reaches the BobPay step, no manual step.
- With a normal user JWT: direct REST **insert** and **update** on `wholesale_accounts` both rejected.
- Temporarily set a wrong webhook secret, sign up, confirm the account is still created (email failure cannot abort the insert); restore the secret and confirm the welcome email arrives within a minute.
- Report the `net._http_response` rows (status, timing) for each welcome-email request.
- Note on wording: the webhook targets the published domain, so preview sign-ups are served by the currently published route and will arrive with the **old approval wording**. Preview run verifies delivery + account creation; after you publish, one more sign-up confirms the **new welcome wording**. Which version arrived is reported each time.
- Set the test account to `suspended` → catalogue and ordering blocked; restore to `approved`.
- Retail checkout offers delivery only; fee R80, free over R500.
- Typecheck + build, 375/390px pass, no console errors.
