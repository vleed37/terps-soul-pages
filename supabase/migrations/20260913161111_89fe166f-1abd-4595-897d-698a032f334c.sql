-- Additive, reversible: stockist public map listing opt-in fields.
ALTER TABLE public.wholesale_accounts
  ADD COLUMN IF NOT EXISTS map_listing_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_store_name text,
  ADD COLUMN IF NOT EXISTS public_address text,
  ADD COLUMN IF NOT EXISTS public_city text,
  ADD COLUMN IF NOT EXISTS public_province text,
  ADD COLUMN IF NOT EXISTS public_phone text,
  ADD COLUMN IF NOT EXISTS public_latitude numeric,
  ADD COLUMN IF NOT EXISTS public_longitude numeric;

COMMENT ON COLUMN public.wholesale_accounts.map_listing_opt_in IS
  'Stockist asked to appear on the public map. Listing also requires complete public details and at least one paid wholesale order.';

-- Eligibility: opted in + complete public details + at least one paid wholesale order.
CREATE OR REPLACE FUNCTION public.wholesale_map_listing_eligible(_account_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.wholesale_accounts a
    where a.id = _account_id
      and a.map_listing_opt_in
      and coalesce(nullif(btrim(a.public_store_name), ''), null) is not null
      and coalesce(nullif(btrim(a.public_address), ''), null) is not null
      and coalesce(nullif(btrim(a.public_phone), ''), null) is not null
      and exists (
        select 1 from public.wholesale_orders o
        where o.wholesale_account_id = a.id
          and o.payment_status = 'paid'
      )
  )
$$;

-- Internal/server use only: never callable by browser clients.
REVOKE ALL ON FUNCTION public.wholesale_map_listing_eligible(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.wholesale_map_listing_eligible(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wholesale_map_listing_eligible(uuid) TO service_role;