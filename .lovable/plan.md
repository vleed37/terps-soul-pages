# Wholesale “Build a mixed box”

## Confirmed pricing basis

Current protected pricing is identical across every active strain within each product line:

| Product line | Units/box | Minimum | 1–2 boxes | 3–5 | 6–9 | 10+ |
|---|---:|---:|---:|---:|---:|---:|
| Pre-rolls | 20 | 1 | R1,600 | R1,500 | R1,400 | R1,350 |
| Caviar Stix | 20 | 1 | R2,200 | R2,100 | R2,000 | R1,950 |

A mixed box can therefore use its product line’s existing tier ladder without weighted pricing. The server will still verify that every active strain in the chosen line has the same box size, minimum, and tier ladder. If those settings ever diverge, mixed-box ordering will fail closed until the line is made consistent; single-strain ordering will continue normally.

## Data model decision

Use an additive `box_composition jsonb` snapshot on `wholesale_order_items`, not a child table.

- A mixed box is assembled uniquely by the stockist, so there is no reusable box definition to normalize.
- The composition belongs to the immutable order line and is best stored with the historical price/name snapshot already held there.
- A database trigger will validate every JSON component against real active strains and protected wholesale configuration, enforce one product line, reject duplicate/invalid strains, enforce positive whole units, enforce exactly `box_quantity_per_unit`, and replace names with canonical database names.
- Existing single-strain rows remain unchanged and readable.
- A service-role-only atomic payment function will parse the snapshot and decrement each strain by `units per box × boxes ordered`.

Composition shape:

```json
[
  { "strain_id": "uuid", "strain_name": "Blue Dream", "units": 8 },
  { "strain_id": "uuid", "strain_name": "Mango Sapphire", "units": 12 }
]
```

`units` means units of that strain **per box**. Ordering three identical mixed boxes decrements 24 and 36 units respectively.

## Full SQL migration

```sql
-- Additive mixed-box order snapshots. Existing single-strain rows remain valid.
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
        and product_line in ('pre_roll', 'caviar_stix')
        and jsonb_typeof(box_composition) = 'array'
        and jsonb_array_length(box_composition) >= 1
      )
    );

comment on column public.wholesale_order_items.box_composition is
  'Immutable mixed-box composition per box: [{strain_id, strain_name, units}]. Names are canonicalized by trigger.';

create index wholesale_order_items_composition_gin
  on public.wholesale_order_items using gin (box_composition)
  where item_type = 'mixed_box';

-- Validate and canonicalize every mixed composition at the database boundary.
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

    if component_units < 1 then
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

    if not found then
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
    raise exception 'Mixed-box total_units does not match box size × boxes ordered';
  end if;

  new.box_composition := canonical;
  return new;
end;
$$;

revoke all on function public.validate_wholesale_order_item_composition()
  from public, anon, authenticated;
grant execute on function public.validate_wholesale_order_item_composition()
  to service_role;

drop trigger if exists validate_wholesale_order_item_composition_trg
  on public.wholesale_order_items;
create trigger validate_wholesale_order_item_composition_trg
  before insert or update of item_type, product_line, box_composition,
    box_quantity_per_unit, boxes_ordered, total_units
  on public.wholesale_order_items
  for each row execute function public.validate_wholesale_order_item_composition();

-- Atomically claim a paid wholesale webhook and decrement every affected strain.
-- Row locking makes duplicate/replayed paid webhooks return false with no stock/email side effects.
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

  if not found then
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
```

No new table grants or RLS policies are needed because this extends the existing protected order-item table. Its existing owner-read policy remains unchanged. The two trigger/payment functions are inaccessible to anonymous and authenticated clients; only the trusted server can execute the payment function.

## File-by-file implementation

### `src/lib/store/wholesale-cart.ts`
- Convert cart lines to a backward-compatible discriminated union: `single_strain` or `mixed_box`.
- Give mixed boxes a stable composition-derived cart key, product line, per-box composition, box size, minimum, line tier ladder, and box count.
- Keep existing single-strain methods and behavior.
- Version the persisted cart and migrate existing saved lines to `single_strain`, preventing stale-cart failures after release.
- Keep all cart pricing display-only; the server remains authoritative.

### `src/lib/types.ts`
- Add mixed-box composition and cart/catalog/order union types.
- Extend `WholesaleOrderItem` with nullable `strain_id`, `item_type`, `product_line`, and typed `box_composition`.

### `src/lib/wholesale.functions.ts`
- Group the protected catalog by product line and expose mixed-box eligibility only when active strains share identical `units_per_box`, `minimum_boxes`, and full tier ladders.
- Expand checkout input to a discriminated union:
  - existing `{ kind: "single_strain", strainId, boxes }`
  - mixed `{ kind: "mixed_box", productLine, boxes, composition: [{ strainId, units }] }`
- For mixed boxes, reload every strain and protected setting server-side; reject cross-line, inactive, unknown, duplicate, non-integer, under/over-filled, mismatched-config, and below-minimum submissions.
- Resolve the line tier from protected server data using the number of identical mixed boxes ordered. Never accept prices, names, box size, or minimums from the browser.
- Insert one `wholesale_order_items` row for the mixed box with the canonical JSON snapshot; retain the current row shape for every single-strain box.
- Return composition in order details; continue counting each mixed box once in order-list totals.

### `src/components/brand/MixedBoxBuilder.tsx` (new)
- One focused builder reused for Pre-rolls and Caviar Stix.
- Show the line name, current product imagery, one stepper per eligible strain, and a live `14 / 20 units` counter.
- Disable “Add to cart” unless total units equals exactly 20; steppers cannot push the total above 20.
- Reset after adding; announce total/errors accessibly; preserve restrained existing motion and reduced-motion behavior.
- The builder allows any valid allocation, including all units assigned to one strain; the existing single-strain cards remain the faster standard-box route.

### `src/routes/wholesale.dashboard.catalog.tsx`
- Add one “Build a mixed box” entry for each eligible product line above/alongside the unchanged single-strain product cards.
- Use current product photography until box photographs arrive.
- Preserve private pricing and existing single-strain quantity/add behavior.

### `src/components/brand/WholesaleCartDrawer.tsx`
- Render a mixed box as one cart line with product line, boxes, box price, and indented per-box composition.
- Quantity controls repeat the saved composition; removal uses the cart key rather than `strainId`.
- Leave single-strain rows visually and functionally unchanged.

### `src/routes/wholesale.dashboard.checkout.tsx`
- Submit the discriminated cart payload without client prices.
- Show mixed-box composition in the order summary.
- Preserve address, delivery fee, VAT-disabled behavior, and BobPay handoff.

### `src/routes/wholesale.dashboard.orders.$id.tsx`
- Render historical single-strain rows as today.
- Render mixed rows as one box line with the complete per-box composition beneath it.

### `src/routes/api/public/bobpay-webhook.ts`
- Replace the wholesale paid update with `process_paid_wholesale_order`.
- If it returns `false`, return `200 { ok: true, duplicate: true }`; do not decrement or email.
- On first payment, decrement stock for both existing single-strain items and every mixed component, then send emails once.
- Update stockist and internal “New order” rows so mixed boxes list product line, box count, and exact composition. Existing single-strain email rows stay unchanged.
- Preserve failed/cancelled handling and the rule that email failures never cause BobPay retries.

### Generated backend types
- Refresh generated database types after the migration; do not hand-edit generated integration files.

## Verification and evidence

1. **Pricing/config:** prove all line members still have identical protected ladders; verify boundary prices at 1, 2, 3, 5, 6, 9, 10, and 11 boxes for both lines.
2. **Builder rules:** build one valid 20-unit pre-roll box and one valid 20-unit Caviar box; prove 19/20 and 21/20 cannot be added; prove a cross-line/tampered payload is rejected server-side.
3. **Cart:** prove each mixed box is one line with composition; quantity changes repeat the composition; old persisted single-strain carts migrate cleanly.
4. **Checkout:** take each mixed line through address confirmation and BobPay initiation. Use test mode/local signed fixtures only; if BobPay test credentials remain absent, mark the external redirect BLOCKED while proving the validated initiation payload and order persistence.
5. **Orders/emails:** verify mixed composition in checkout, order history, stockist confirmation, and internal New order HTML.
6. **Stock/idempotency:** on uniquely labelled fixture strains, prove each component decrements by `units × boxes`; replay the signed paid webhook and prove HTTP 200, no second decrement, and no second email. Restore fixture stock and delete only exact fixture IDs.
7. **Regression:** order a standard single-strain box through the same path and prove pricing, history, email, stock decrement, and duplicate handling still work.
8. **Security:** verify anonymous and ordinary retail users cannot read wholesale pricing/order composition; approved stockists can read only their own order items; direct execution of the paid-order function is denied.
9. **Quality:** typecheck, preview build, console/runtime/network checks, and responsive catalogue/cart/checkout/order-detail QA at 390px, 768px, and 1440px.

## Scope boundaries

No retail, public stockist, approval, VAT, delivery-fee, tier-value, BobPay credential, production payment, or Phase 2 admin changes. No box photographs are invented; current product images remain until supplied photography arrives.
