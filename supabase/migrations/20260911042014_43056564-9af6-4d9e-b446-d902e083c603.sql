-- Roles ---------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('admin', 'staff');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists user_roles_own_read on public.user_roles;
create policy user_roles_own_read on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.is_approved_stockist(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.wholesale_accounts
    where user_id = _user_id and approval_status = 'approved'
  )
$$;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
revoke all on function public.is_approved_stockist(uuid) from public, anon;
grant execute on function public.is_approved_stockist(uuid) to authenticated, service_role;

-- Wholesale product configuration --------------------------------------
create table if not exists public.wholesale_products (
  id uuid primary key default gen_random_uuid(),
  strain_id uuid not null unique references public.strains(id) on delete cascade,
  units_per_box integer not null default 20 check (units_per_box > 0),
  wholesale_active boolean not null default true,
  minimum_boxes integer not null default 1 check (minimum_boxes >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.wholesale_products to authenticated;
grant all on public.wholesale_products to service_role;

alter table public.wholesale_products enable row level security;

drop policy if exists wholesale_products_entitled_read on public.wholesale_products;
create policy wholesale_products_entitled_read on public.wholesale_products
  for select to authenticated
  using (
    public.is_approved_stockist(auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

drop trigger if exists touch_wholesale_products on public.wholesale_products;
create trigger touch_wholesale_products before update on public.wholesale_products
  for each row execute function public.touch_updated_at();

-- Tiered wholesale pricing ---------------------------------------------
create extension if not exists btree_gist;

create table if not exists public.wholesale_price_tiers (
  id uuid primary key default gen_random_uuid(),
  strain_id uuid not null references public.strains(id) on delete cascade,
  min_boxes integer not null check (min_boxes >= 1),
  max_boxes integer,
  price_per_box_zar numeric(10,2) not null check (price_per_box_zar > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wholesale_tier_range_valid check (max_boxes is null or max_boxes >= min_boxes),
  constraint wholesale_tier_no_overlap exclude using gist (
    strain_id with =,
    int4range(min_boxes, coalesce(max_boxes, 2147483646) + 1) with &&
  )
);

grant select on public.wholesale_price_tiers to authenticated;
grant all on public.wholesale_price_tiers to service_role;

alter table public.wholesale_price_tiers enable row level security;

drop policy if exists wholesale_tiers_entitled_read on public.wholesale_price_tiers;
create policy wholesale_tiers_entitled_read on public.wholesale_price_tiers
  for select to authenticated
  using (
    public.is_approved_stockist(auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

drop trigger if exists touch_wholesale_price_tiers on public.wholesale_price_tiers;
create trigger touch_wholesale_price_tiers before update on public.wholesale_price_tiers
  for each row execute function public.touch_updated_at();

-- Gap / coverage validation: tiers for a strain must start at 1 and be contiguous.
create or replace function public.validate_wholesale_tiers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid := coalesce(new.strain_id, old.strain_id);
  expected integer := 1;
  r record;
  open_ended integer := 0;
begin
  for r in
    select min_boxes, max_boxes from public.wholesale_price_tiers
    where strain_id = sid order by min_boxes
  loop
    if r.min_boxes <> expected then
      raise exception 'Wholesale tiers for strain % must be contiguous starting at 1 (gap before % boxes)', sid, r.min_boxes;
    end if;
    if r.max_boxes is null then
      open_ended := open_ended + 1;
      expected := null;
    else
      expected := r.max_boxes + 1;
    end if;
  end loop;

  if expected is not null and open_ended = 0 then
    -- there is at least one tier but no open-ended top tier
    if exists (select 1 from public.wholesale_price_tiers where strain_id = sid) then
      raise exception 'Wholesale tiers for strain % need an open-ended top tier (max_boxes null)', sid;
    end if;
  end if;

  return null;
end;
$$;

drop trigger if exists validate_wholesale_tiers_trg on public.wholesale_price_tiers;
create constraint trigger validate_wholesale_tiers_trg
  after insert or update or delete on public.wholesale_price_tiers
  deferrable initially deferred
  for each row execute function public.validate_wholesale_tiers();

-- Server-authoritative tier resolution ---------------------------------
create or replace function public.resolve_wholesale_price(_strain_id uuid, _boxes integer)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select t.price_per_box_zar
  from public.wholesale_price_tiers t
  where t.strain_id = _strain_id
    and _boxes >= t.min_boxes
    and (t.max_boxes is null or _boxes <= t.max_boxes)
  limit 1
$$;

revoke all on function public.resolve_wholesale_price(uuid, integer) from public, anon;
grant execute on function public.resolve_wholesale_price(uuid, integer) to service_role;
