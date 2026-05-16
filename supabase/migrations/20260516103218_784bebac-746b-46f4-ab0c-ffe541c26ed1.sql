
-- CARTS (reserved for Prompt 3 logged-in persistence; not used client-side now)
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  session_id text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete cascade,
  strain_id uuid references public.strains(id),
  quantity int not null check (quantity > 0 and quantity <= 100),
  added_at timestamptz default now()
);

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
-- No policies yet; access via service-role server fns in Prompt 3

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid,
  guest_email text,
  guest_phone text,
  guest_name text,
  status text not null default 'pending' check (status in ('pending','paid','fulfilling','shipped','delivered','cancelled','refunded')),
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment_method text default 'bobpay',
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded')),
  bobpay_transaction_id text,
  bobpay_reference text,
  payment_completed_at timestamptz,
  delivery_method text check (delivery_method in ('standard','express','collect_stockist')),
  delivery_address jsonb,
  collect_stockist_id uuid references public.stockists(id),
  tracking_number text,
  tracking_url text,
  estimated_delivery_date date,
  notes text,
  ip_address text,
  user_agent text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  strain_id uuid references public.strains(id),
  strain_name text not null,
  strain_slug text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- No broad SELECT policy: order details are returned only via service-role server fn (getOrderByNumber)
-- Allow public INSERT as defense-in-depth (server fn uses service role anyway)
create policy "orders_public_insert" on public.orders for insert with check (true);
create policy "order_items_public_insert" on public.order_items for insert with check (true);

create index idx_orders_status on public.orders(status);
create index idx_orders_order_number on public.orders(order_number);
create index idx_orders_bobpay_transaction on public.orders(bobpay_transaction_id);
create index idx_order_items_order on public.order_items(order_id);

-- Order number sequence + helper
create sequence if not exists public.order_number_seq start 1;

create or replace function public.generate_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_num int;
begin
  next_num := nextval('public.order_number_seq');
  return 'TRP-2026-' || lpad(next_num::text, 4, '0');
end;
$$;

-- Stock decrement helper
create or replace function public.decrement_stock(p_strain_id uuid, p_qty int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.strains
  set stock_quantity = greatest(stock_quantity - p_qty, 0),
      updated_at = now()
  where id = p_strain_id;
end;
$$;

-- updated_at trigger on orders
create or replace function public.touch_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
before update on public.orders
for each row execute function public.touch_orders_updated_at();
