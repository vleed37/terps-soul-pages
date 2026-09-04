DROP POLICY IF EXISTS "wholesale_accounts_own_insert" ON public.wholesale_accounts;
DROP POLICY IF EXISTS "wholesale_accounts_own_update_pending" ON public.wholesale_accounts;

ALTER TABLE public.wholesale_accounts
  ALTER COLUMN approval_status SET DEFAULT 'approved';

ALTER TABLE public.wholesale_accounts
  ALTER COLUMN estimated_monthly_volume DROP NOT NULL;

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
    select value into webhook_url from public.app_secrets where key = 'wholesale_approval_webhook_url';
    select value into webhook_secret from public.app_secrets where key = 'wholesale_approval_webhook_secret';

    if webhook_url is null then
      raise warning '[wholesale] webhook url not configured; skipping welcome email';
      return new;
    end if;

    begin
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