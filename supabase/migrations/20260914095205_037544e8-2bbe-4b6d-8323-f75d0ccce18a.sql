alter table public.wholesale_order_items
  alter column strain_id drop not null,
  add column item_type text not null default 'single_strain',
  add column product_line text,
  add column box_composition jsonb;

alter table public.wholesale_order_items
  add constraint wholesale_order_items_type_valid
    check (item_type in ('single_strain', 'mixed_box')),
  add constraint wholesale_order_items_shape_valid
    check (
      (
        item_type = 'single_strain'
        and strain_id is not null
        and product_line is null
        and box_composition is null
      )
      or
      (
        item_type = 'mixed_box'
        and strain_id is null
        and product_line = any (array['pre_roll'::text, 'caviar_stix'::text])
        and jsonb_typeof(box_composition) = 'array'
        and jsonb_array_length(box_composition) >= 1
      )
    );

comment on column public.wholesale_order_items.box_composition is
  'Immutable mixed-box composition per box: [{strain_id, strain_name, units}]. Names canonicalized by trigger.';

create index wholesale_order_items_composition_gin
  on public.wholesale_order_items using gin (box_composition)
  where item_type = 'mixed_box';

create or replace function public.validate_wholesale_order_item_composition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  component jsonb;
  component_strain_id uuid;
  component_units integer;
  component_name text;
  component_line text;
  configured_units integer;
  configured_minimum integer;
  unit_sum integer := 0;
  seen_ids uuid[] := array[]::uuid[];
  canonical jsonb := '[]'::jsonb;
begin
  if new.item_type = 'single_strain' then
    return new;
  end if;

  if new.boxes_ordered < 1 then
    raise exception 'A mixed box order must contain at least one box';
  end if;

  for component in select value from jsonb_array_elements(new.box_composition)
  loop
    begin
      component_strain_id := (component ->> 'strain_id')::uuid;
      component_units := (component ->> 'units')::integer;
    exception when others then
      raise exception 'Each mixed-box component needs a valid strain_id and whole-unit quantity';
    end;

    if component_units is null or component_units < 1 then
      raise exception 'Mixed-box component quantities must be positive whole units';
    end if;
    if component_strain_id = any(seen_ids) then
      raise exception 'A strain may appear only once in a mixed-box composition';
    end if;

    select s.name, s.product_line, wp.units_per_box, wp.minimum_boxes
      into component_name, component_line, configured_units, configured_minimum
    from public.strains s
    join public.wholesale_products wp on wp.strain_id = s.id
    where s.id = component_strain_id
      and s.is_active = true
      and wp.wholesale_active = true;

    if component_name is null then
      raise exception 'Mixed-box strain % is not available for wholesale', component_strain_id;
    end if;
    if component_line <> new.product_line then
      raise exception 'Mixed boxes cannot contain products from different product lines';
    end if;
    if configured_units <> new.box_quantity_per_unit then
      raise exception 'All products in a mixed box must use the same box quantity';
    end if;
    if new.boxes_ordered < configured_minimum then
      raise exception 'Mixed box does not meet the configured minimum-box quantity';
    end if;

    unit_sum := unit_sum + component_units;
    seen_ids := array_append(seen_ids, component_strain_id);
    canonical := canonical || jsonb_build_array(jsonb_build_object(
      'strain_id', component_strain_id,
      'strain_name', component_name,
      'units', component_units
    ));
  end loop;

  if unit_sum <> new.box_quantity_per_unit then
    raise exception 'Mixed box must contain exactly % units; received %',
      new.box_quantity_per_unit, unit_sum;
  end if;
  if new.total_units <> new.box_quantity_per_unit * new.boxes_ordered then
    raise exception 'Mixed-box total_units does not match box size multiplied by boxes ordered';
  end if;

  new.box_composition := canonical;
  return new;
end;
$$;

revoke all on function public.validate_wholesale_order_item_composition()
  from public, anon, authenticated;

drop trigger if exists validate_wholesale_order_item_composition_trg
  on public.wholesale_order_items;
create trigger validate_wholesale_order_item_composition_trg
  before insert or update of item_type, product_line, box_composition,
    box_quantity_per_unit, boxes_ordered, total_units
  on public.wholesale_order_items
  for each row execute function public.validate_wholesale_order_item_composition();

create or replace function public.process_paid_wholesale_order(
  _order_id uuid,
  _transaction_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status text;
begin
  select payment_status into current_status
  from public.wholesale_orders
  where id = _order_id
  for update;

  if current_status is null then
    raise exception 'Wholesale order not found';
  end if;
  if current_status = 'paid' then
    return false;
  end if;

  with required_stock as (
    select i.strain_id, sum(i.total_units)::integer as units
    from public.wholesale_order_items i
    where i.wholesale_order_id = _order_id
      and i.item_type = 'single_strain'
      and i.strain_id is not null
    group by i.strain_id

    union all

    select (c ->> 'strain_id')::uuid as strain_id,
           sum(((c ->> 'units')::integer) * i.boxes_ordered)::integer as units
    from public.wholesale_order_items i
    cross join lateral jsonb_array_elements(i.box_composition) c
    where i.wholesale_order_id = _order_id
      and i.item_type = 'mixed_box'
    group by (c ->> 'strain_id')::uuid
  ), totals as (
    select strain_id, sum(units)::integer as units
    from required_stock
    group by strain_id
  )
  update public.strains s
  set stock_quantity = greatest(s.stock_quantity - totals.units, 0),
      updated_at = now()
  from totals
  where s.id = totals.strain_id;

  update public.wholesale_orders
  set payment_status = 'paid',
      fulfillment_status = 'preparing',
      paid_at = now(),
      bobpay_transaction_id = _transaction_id
  where id = _order_id;

  return true;
end;
$$;

revoke all on function public.process_paid_wholesale_order(uuid, text)
  from public, anon, authenticated;
grant execute on function public.process_paid_wholesale_order(uuid, text)
  to service_role;