
-- CUSTOMERS
create table if not exists public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  birthdate date,
  customer_type text not null default 'retail' check (customer_type in ('retail','wholesale')),
  marketing_opt_in boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.customers enable row level security;
create policy "customers_own_read" on public.customers for select using (auth.uid() = id);
create policy "customers_own_update" on public.customers for update using (auth.uid() = id);
create policy "customers_own_insert" on public.customers for insert with check (auth.uid() = id);

create trigger touch_customers_updated_at
  before update on public.customers
  for each row execute function public.touch_orders_updated_at();

-- ADDRESSES
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,
  full_name text,
  phone text,
  street_address text not null,
  unit text,
  suburb text,
  city text not null,
  province text not null,
  postal_code text,
  country text default 'South Africa',
  is_default boolean default false,
  created_at timestamptz default now()
);
alter table public.addresses enable row level security;
create policy "addresses_own_select" on public.addresses for select using (auth.uid() = customer_id);
create policy "addresses_own_insert" on public.addresses for insert with check (auth.uid() = customer_id);
create policy "addresses_own_update" on public.addresses for update using (auth.uid() = customer_id);
create policy "addresses_own_delete" on public.addresses for delete using (auth.uid() = customer_id);
create index if not exists idx_addresses_customer on public.addresses(customer_id);

-- New user trigger: create customer + link prior guest orders
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (id, full_name, marketing_opt_in)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, false)
  )
  on conflict (id) do nothing;

  update public.orders
    set customer_id = new.id
    where guest_email = new.email
      and customer_id is null;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Orders: owner-only read for signed-in customers
create policy "orders_own_read" on public.orders for select
  using (auth.uid() is not null and auth.uid() = customer_id);

create policy "order_items_own_read" on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and auth.uid() is not null
        and o.customer_id = auth.uid()
    )
  );
