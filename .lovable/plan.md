# Wholesale portal — Phase 1 changes

Instant sign-up (no approval step), optional VAT/registration numbers, header entry point, delivery-only retail checkout, one place for VAT and wholesale delivery fee, plus two loose ends from the homepage change.

## Findings from the current system

- Only one `wholesale_accounts` row exists: **Carbon Media Solutions** (vincit@carbonmediasolutions.com), status `approved`, VAT and registration numbers empty. **There are no `pending` rows, so no data cleanup is needed.**
- `vat_number` and `cipc_registration_number` are already nullable in the database — no schema change required, only validation/UI copy.
- Currently required in the application: business name, business type, estimated monthly volume, contact name, contact email, contact phone, address line 1, city, province (plus email + password on step 1). Optional today: trading name, VAT number, registration number, address line 2, postal code.
- Email confirmation: auto-confirm was switched **on** earlier in this project, so new stockists get a session immediately and no confirmation step is needed. The plan re-asserts that setting explicitly (signup enabled, anonymous users off, leaked-password protection on) so it cannot silently drift, and the welcome email therefore contains no "confirm your address" line. The login page keeps a graceful message if a user is ever unconfirmed.

## A. Instant sign-up

`src/lib/wholesale.functions.ts`
- Insert new accounts with `approval_status: "approved"` and `approved_at: now()` using the admin client (unchanged pattern, so direct API access stays locked).
- `listWholesaleStrains` / `createWholesaleOrder` keep requiring `approved`, so a hand-suspended account is still blocked from catalogue and ordering.
- `updateMyWholesaleAccount` field whitelist unchanged (contact name/email/phone + delivery address). Business identity stays locked.
- VAT and registration numbers become `.optional()` in the application schema; trading name becomes required (per the brief) alongside contact and address fields.

`src/routes/wholesale.dashboard.tsx`
- Status screen keeps handling `rejected` / `suspended`; remove the `pending` branch and all "under review / 48 hours" wording.

`src/components/brand/UpdateAccountModal.tsx`
- "Business identity is locked once approved" → "Business identity is locked. Contact us if any of these change."

### Migration 1 — policies

```sql
-- Direct-API inserts no longer need to claim 'pending'; the server function
-- (admin client) is the only creator, so keep the anon/authenticated path narrow.
DROP POLICY IF EXISTS "wholesale_accounts_own_insert" ON public.wholesale_accounts;
CREATE POLICY "wholesale_accounts_own_insert"
  ON public.wholesale_accounts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Owners may edit their own row regardless of status; status itself is not
-- editable from the client because updates go through the server function's
-- whitelist, and this policy forbids changing approval_status.
DROP POLICY IF EXISTS "wholesale_accounts_own_update_pending" ON public.wholesale_accounts;
CREATE POLICY "wholesale_accounts_own_update"
  ON public.wholesale_accounts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.wholesale_accounts_lock_status()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
begin
  if auth.role() = 'authenticated' and new.approval_status is distinct from old.approval_status then
    new.approval_status := old.approval_status;
  end if;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS lock_wholesale_status ON public.wholesale_accounts;
CREATE TRIGGER lock_wholesale_status
  BEFORE UPDATE ON public.wholesale_accounts
  FOR EACH ROW EXECUTE FUNCTION public.wholesale_accounts_lock_status();
```

### Migration 2 — welcome email on INSERT and on transition to approved

```sql
CREATE OR REPLACE FUNCTION public.notify_wholesale_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
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
    webhook_url := 'https://project--77dbbbc2-96d2-4989-b854-9425b6231f32.lovable.app/api/public/wholesale-approval-email';

    select value into webhook_secret
    from public.app_secrets
    where key = 'wholesale_approval_webhook_secret';

    perform extensions.http_post(
      url := webhook_url,
      body := jsonb_build_object('account_id', new.id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Webhook-Secret', coalesce(webhook_secret, '')
      )
    );
  end if;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS trigger_wholesale_approval ON public.wholesale_accounts;
CREATE TRIGGER trigger_wholesale_approval
  AFTER INSERT OR UPDATE ON public.wholesale_accounts
  FOR EACH ROW EXECUTE FUNCTION public.notify_wholesale_approval();
```

`src/routes/api/public/wholesale-approval-email.ts`
- Rewrite the body as a welcome, not an approval: account is ready, "Sign in to your portal" button, one line that ordering is by the box with minimums shown in the catalogue, `SALES_EMAIL` for questions. Timing-safe secret check unchanged.

## B. Copy — no review, no waiting

`src/routes/wholesale.index.tsx`
- Three steps become **01 Sign up → 02 Log in → 03 Order**; the "Approve / usually within 48 hours" step and the "Approval typically within 48 hours" line are removed.
- CTAs: "Apply Now" → "Sign up", section heading "Tell us about your store." kept.
- A logged-in user who already has a stockist account sees a **"Go to your stockist portal"** panel (link to `/wholesale/dashboard`) instead of the form.
- VAT and registration inputs labelled "optional".

Also swept for review/approval/waiting wording: `wholesale.dashboard.tsx`, `wholesale.dashboard.index.tsx` (Status card kept), `wholesale.login.tsx`, the welcome email.

## C. Header entry point

`src/components/layout/Header.tsx`
- Add one nav item after "Our Story", styled exactly like the existing links (desktop `meta-xs underline-grow`, mobile display-size link): **Become a stockist → /wholesale**, or **Stockist portal → /wholesale/dashboard** when `useWholesaleAccount()` returns an account. Renders the visitor variant while loading, so no flicker of the wrong label on SSR.

## D. Delivery only (retail)

`src/routes/checkout.tsx` — remove the "Collect from Stockist" radio and its branch; delivery is the only method.
`src/lib/checkout.functions.ts` — `deliveryMethod` narrows to `z.literal("delivery")`; fee always `subtotal >= 500 ? 0 : 80`; `collect_stockist_id` always null. Column stays in place.
`src/routes/order.$orderNumber.tsx` — drop the collection branch in the delivery block.
`src/routes/legal.shipping.tsx` — remove the "Collection at a Stockist" section.
Also sweep order-confirmation email copy for pickup/collection wording.

## E. One place for VAT and wholesale delivery fee

`src/lib/brand.ts` — add `export const VAT_RATE = 0.15;` and `export const WHOLESALE_DELIVERY_FEE = 250;`.
`src/lib/wholesale.functions.ts` — delete local `VAT_RATE` / `SHIPPING_FLAT`, import from brand.
`src/lib/store/wholesale-cart.ts` — re-export `WHOLESALE_VAT_RATE` / `WHOLESALE_SHIPPING` from the brand constants so existing imports keep working with a single source of truth.

## F. Loose ends

10. Audit every email template that embeds the wordmark (approval/welcome email, order confirmation in `checkout.functions.ts`, and the approval route) and set an explicit rendered `height` matching the pre-trim visual size — the trimmed PNGs otherwise render smaller. Report which templates actually embed a logo (current welcome email uses a text label only).
11. Sign in as the seeded stockist in a headless browser and measure the gap between the 64px scrolled header and the first sticky/top element on `/wholesale/dashboard`, `/wholesale/dashboard/catalog`, cart drawer, `/wholesale/dashboard/checkout`, `/wholesale/dashboard/orders`; report each measurement and fix any gap/overlap.

## Verification

- Fresh sign-up → session → account created `approved` → welcome email fires (trigger log/Resend response) → login → catalogue shows box prices and minimums → order reaches the BobPay step, no manual step.
- Manually set the test account to `suspended` and confirm catalogue and ordering are blocked, then restore to `approved`.
- Retail checkout offers delivery only; fee R80, free over R500.
- Typecheck + build, 375/390px pass, no console errors.

## One open decision

Trading name is currently optional in both form and schema. The brief lists it as required, so the plan makes it required — say the word if it should stay optional.
