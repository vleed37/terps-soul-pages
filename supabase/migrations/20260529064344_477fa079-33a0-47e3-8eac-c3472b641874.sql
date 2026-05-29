
-- Enable pg_net for outbound HTTP from triggers
create extension if not exists pg_net with schema extensions;

-- Shared updated_at touch function (reuse if exists, else create)
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- wholesale_accounts
-- ============================================================
create table if not exists public.wholesale_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  business_name text not null,
  trading_as text,
  vat_number text,
  cipc_registration_number text,
  business_type text not null check (business_type in ('dispensary','lounge','specialty_retailer','other')),
  estimated_monthly_volume text not null check (estimated_monthly_volume in ('under_50','50_to_200','200_to_500','500_plus')),
  primary_contact_name text not null,
  primary_contact_email text not null,
  primary_contact_phone text not null,
  business_address_line_1 text not null,
  business_address_line_2 text,
  business_city text not null,
  business_province text not null,
  business_postal_code text,
  business_country text not null default 'South Africa',
  approval_status text not null default 'pending'
    check (approval_status in ('pending','approved','rejected','suspended')),
  approved_at timestamptz,
  approved_by uuid,
  rejection_reason text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wholesale_accounts_status on public.wholesale_accounts(approval_status);
create index if not exists idx_wholesale_accounts_user on public.wholesale_accounts(user_id);

grant select, insert, update on public.wholesale_accounts to authenticated;
grant all on public.wholesale_accounts to service_role;

alter table public.wholesale_accounts enable row level security;

create policy "wholesale_accounts_own_read"
  on public.wholesale_accounts for select to authenticated
  using (auth.uid() = user_id);

create policy "wholesale_accounts_own_insert"
  on public.wholesale_accounts for insert to authenticated
  with check (auth.uid() = user_id and approval_status = 'pending');

create policy "wholesale_accounts_own_update_pending"
  on public.wholesale_accounts for update to authenticated
  using (auth.uid() = user_id and approval_status = 'pending')
  with check (auth.uid() = user_id);

create trigger set_updated_at_wholesale_accounts
  before update on public.wholesale_accounts
  for each row execute function public.touch_updated_at();

-- ============================================================
-- strains: wholesale fields
-- ============================================================
alter table public.strains
  add column if not exists box_quantity integer default 20,
  add column if not exists wholesale_box_price_zar numeric(10,2),
  add column if not exists wholesale_minimum_boxes integer default 1,
  add column if not exists wholesale_available boolean default true;

update public.strains
   set box_quantity = 20,
       wholesale_box_price_zar = 1600.00,
       wholesale_minimum_boxes = 1
 where product_line = 'pre_roll'
   and wholesale_box_price_zar is null;

-- ============================================================
-- wholesale_orders + items
-- ============================================================
create sequence if not exists public.wholesale_order_number_seq;

create or replace function public.generate_wholesale_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_num int;
begin
  next_num := nextval('public.wholesale_order_number_seq');
  return 'TRP-W-' || to_char(now(), 'YYYYMM') || '-' || lpad(next_num::text, 4, '0');
end;
$$;

create table if not exists public.wholesale_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  wholesale_account_id uuid not null references public.wholesale_accounts(id) on delete restrict,
  user_id uuid not null,
  subtotal_zar numeric(10,2) not null,
  vat_zar numeric(10,2) not null default 0,
  shipping_zar numeric(10,2) not null default 0,
  total_zar numeric(10,2) not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  fulfillment_status text not null default 'pending'
    check (fulfillment_status in ('pending','preparing','shipped','delivered','cancelled')),
  shipping_address jsonb not null,
  customer_notes text,
  admin_notes text,
  tracking_number text,
  bobpay_transaction_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wholesale_orders_account on public.wholesale_orders(wholesale_account_id);
create index if not exists idx_wholesale_orders_user on public.wholesale_orders(user_id);
create index if not exists idx_wholesale_orders_status on public.wholesale_orders(payment_status, fulfillment_status);

grant select on public.wholesale_orders to authenticated;
grant all on public.wholesale_orders to service_role;

alter table public.wholesale_orders enable row level security;

create policy "wholesale_orders_own_read"
  on public.wholesale_orders for select to authenticated
  using (auth.uid() = user_id);

-- Inserts happen via service_role from server fn (validates account approved).
-- We still allow direct user insert if their account is approved, as a backstop:
create policy "wholesale_orders_own_insert_if_approved"
  on public.wholesale_orders for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.wholesale_accounts wa
      where wa.user_id = auth.uid() and wa.approval_status = 'approved'
    )
  );

create trigger set_updated_at_wholesale_orders
  before update on public.wholesale_orders
  for each row execute function public.touch_updated_at();

create table if not exists public.wholesale_order_items (
  id uuid primary key default gen_random_uuid(),
  wholesale_order_id uuid not null references public.wholesale_orders(id) on delete cascade,
  strain_id uuid not null references public.strains(id),
  strain_name text not null,
  box_quantity_per_unit integer not null,
  boxes_ordered integer not null,
  total_units integer not null,
  unit_price_zar numeric(10,2) not null,
  box_price_zar numeric(10,2) not null,
  line_total_zar numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_wholesale_order_items_order on public.wholesale_order_items(wholesale_order_id);

grant select on public.wholesale_order_items to authenticated;
grant all on public.wholesale_order_items to service_role;

alter table public.wholesale_order_items enable row level security;

create policy "wholesale_order_items_own_read"
  on public.wholesale_order_items for select to authenticated
  using (
    exists (
      select 1 from public.wholesale_orders o
      where o.id = wholesale_order_id and o.user_id = auth.uid()
    )
  );

-- ============================================================
-- Approval-email trigger (POST to /api/public/wholesale-approval-email)
-- ============================================================
create or replace function public.notify_wholesale_approval()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  webhook_url text;
  webhook_secret text;
begin
  if old.approval_status is distinct from new.approval_status
     and new.approval_status = 'approved' then
    -- Hardcoded to the project's published URL pattern; can be overridden via GUC if needed.
    webhook_url := current_setting('app.wholesale_approval_webhook_url', true);
    webhook_secret := current_setting('app.wholesale_approval_webhook_secret', true);

    if webhook_url is null or webhook_url = '' then
      webhook_url := 'https://project--77dbbbc2-96d2-4989-b854-9425b6231f32.lovable.app/api/public/wholesale-approval-email';
    end if;

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

drop trigger if exists trigger_wholesale_approval on public.wholesale_accounts;
create trigger trigger_wholesale_approval
  after update of approval_status on public.wholesale_accounts
  for each row execute function public.notify_wholesale_approval();
