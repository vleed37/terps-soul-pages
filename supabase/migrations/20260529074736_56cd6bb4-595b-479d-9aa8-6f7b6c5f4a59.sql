-- Private secrets table for DB-side use (triggers calling webhooks)
CREATE TABLE IF NOT EXISTS public.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- No grants to anon/authenticated — unreachable via Data API.
GRANT ALL ON public.app_secrets TO service_role;

ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies. SECURITY DEFINER functions owned by postgres bypass RLS.

-- Seed the wholesale approval webhook secret
INSERT INTO public.app_secrets (key, value)
VALUES ('wholesale_approval_webhook_secret', '5e1251869a29e5fd0e26d11a8f8e7281f959ee41e4bd985f2cc4dd8ed3c91c57')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Rewire trigger function to read the secret from app_secrets
CREATE OR REPLACE FUNCTION public.notify_wholesale_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
declare
  webhook_url text;
  webhook_secret text;
begin
  if old.approval_status is distinct from new.approval_status
     and new.approval_status = 'approved' then

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
$function$;