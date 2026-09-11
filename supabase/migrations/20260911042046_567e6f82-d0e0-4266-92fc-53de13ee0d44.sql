revoke all on function public.resolve_wholesale_price(uuid, integer) from public, anon, authenticated;
grant execute on function public.resolve_wholesale_price(uuid, integer) to service_role;

revoke all on function public.validate_wholesale_tiers() from public, anon, authenticated;
grant execute on function public.validate_wholesale_tiers() to service_role;
