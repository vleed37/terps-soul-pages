import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AddressInput = z.object({
  label: z.string().max(60).optional().nullable(),
  full_name: z.string().min(1).max(120),
  phone: z.string().min(4).max(30).optional().nullable(),
  street_address: z.string().min(1).max(200),
  unit: z.string().max(60).optional().nullable(),
  suburb: z.string().min(1).max(120),
  city: z.string().min(1).max(120),
  province: z.string().min(1).max(60),
  postal_code: z.string().max(12).optional().nullable(),
  country: z.string().max(60).optional().nullable(),
  is_default: z.boolean().optional(),
});

export const getMyCustomer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("customers")
      .select("id, full_name, phone, birthdate, customer_type, marketing_opt_in")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const UpdateCustomer = z.object({
  full_name: z.string().min(1).max(120).optional(),
  phone: z.string().max(30).optional().nullable(),
  birthdate: z.string().optional().nullable(),
  marketing_opt_in: z.boolean().optional(),
});

export const updateMyCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateCustomer.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("customers")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, order_number, status, payment_status, total, delivery_method, created_at")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (orders ?? []).map((o) => o.id);
    if (ids.length === 0) return [];
    const { data: items, error: iErr } = await supabase
      .from("order_items")
      .select("order_id, strain_slug, strain_name, quantity, line_total")
      .in("order_id", ids);
    if (iErr) throw new Error(iErr.message);
    const byOrder = new Map<string, typeof items>();
    for (const it of items ?? []) {
      const arr = byOrder.get(it.order_id!) ?? [];
      arr.push(it);
      byOrder.set(it.order_id!, arr);
    }
    return (orders ?? []).map((o) => ({ ...o, items: byOrder.get(o.id) ?? [] }));
  });

export const getMyOrderDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ orderNumber: z.string().min(1).max(40) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", userId)
      .eq("order_number", data.orderNumber)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;
    const { data: items } = await supabase
      .from("order_items")
      .select("strain_id, strain_slug, strain_name, quantity, unit_price, line_total")
      .eq("order_id", order.id);
    return { ...order, items: items ?? [] };
  });

export const listMyAddresses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("customer_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AddressInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("customer_id", userId);
    }
    const { data: row, error } = await supabase
      .from("addresses")
      .insert({ ...data, customer_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid() }).merge(AddressInput.partial()).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...patch } = data;
    if (patch.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("customer_id", userId);
    }
    const { error } = await supabase.from("addresses").update(patch).eq("id", id).eq("customer_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("addresses").delete().eq("id", data.id).eq("customer_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setDefaultAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("addresses").update({ is_default: false }).eq("customer_id", userId);
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", data.id)
      .eq("customer_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
