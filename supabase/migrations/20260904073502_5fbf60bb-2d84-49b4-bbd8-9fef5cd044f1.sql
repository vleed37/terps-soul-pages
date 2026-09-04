REVOKE EXECUTE ON FUNCTION public.generate_wholesale_order_number() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_wholesale_approval() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.wholesale_accounts_lock_fields() FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.touch_orders_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_orders_updated_at() FROM anon, authenticated, public;