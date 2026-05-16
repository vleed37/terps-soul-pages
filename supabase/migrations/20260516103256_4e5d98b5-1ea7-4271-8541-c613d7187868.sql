
revoke execute on function public.generate_order_number() from public, anon, authenticated;
revoke execute on function public.decrement_stock(uuid, int) from public, anon, authenticated;
