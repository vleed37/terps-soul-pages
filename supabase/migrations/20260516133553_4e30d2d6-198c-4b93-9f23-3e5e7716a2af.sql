
-- Cart sync schema hardening for Milestone A1
-- carts: one cart per customer
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

-- Ensure single cart per customer
create unique index if not exists carts_customer_unique on public.carts(customer_id) where customer_id is not null;
-- Ensure one row per strain per cart for upsert
create unique index if not exists cart_items_cart_strain_unique on public.cart_items(cart_id, strain_id);

-- RLS: customers can manage only their own cart
drop policy if exists carts_own_all on public.carts;
create policy carts_own_all on public.carts
  for all
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

drop policy if exists cart_items_own_all on public.cart_items;
create policy cart_items_own_all on public.cart_items
  for all
  using (exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.customer_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.customer_id = auth.uid()));
