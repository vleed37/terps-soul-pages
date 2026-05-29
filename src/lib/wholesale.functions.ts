import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BusinessTypeEnum = z.enum(["dispensary", "lounge", "specialty_retailer", "other"]);
const VolumeEnum = z.enum(["under_50", "50_to_200", "200_to_500", "500_plus"]);

const ApplicationSchema = z.object({
  business_name: z.string().trim().min(1).max(200),
  trading_as: z.string().trim().max(200).optional().or(z.literal("")),
  vat_number: z.string().trim().max(40).optional().or(z.literal("")),
  cipc_registration_number: z.string().trim().max(40).optional().or(z.literal("")),
  business_type: BusinessTypeEnum,
  estimated_monthly_volume: VolumeEnum,
  primary_contact_name: z.string().trim().min(1).max(120),
  primary_contact_email: z.string().trim().toLowerCase().email().max(255),
  primary_contact_phone: z.string().trim().min(6).max(30),
  business_address_line_1: z.string().trim().min(1).max(200),
  business_address_line_2: z.string().trim().max(200).optional().or(z.literal("")),
  business_city: z.string().trim().min(1).max(120),
  business_province: z.string().trim().min(1).max(60),
  business_postal_code: z.string().trim().max(20).optional().or(z.literal("")),
  business_country: z.string().trim().max(60).default("South Africa"),
});

export const createWholesaleAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ApplicationSchema.parse(d))
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    const { data: existing } = await supabaseAdmin
      .from("wholesale_accounts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) {
      return { ok: false as const, error: "An application already exists for this account." };
    }

    const insertRow = {
      user_id: userId,
      business_name: data.business_name,
      trading_as: data.trading_as || null,
      vat_number: data.vat_number || null,
      cipc_registration_number: data.cipc_registration_number || null,
      business_type: data.business_type,
      estimated_monthly_volume: data.estimated_monthly_volume,
      primary_contact_name: data.primary_contact_name,
      primary_contact_email: data.primary_contact_email,
      primary_contact_phone: data.primary_contact_phone,
      business_address_line_1: data.business_address_line_1,
      business_address_line_2: data.business_address_line_2 || null,
      business_city: data.business_city,
      business_province: data.business_province,
      business_postal_code: data.business_postal_code || null,
      business_country: data.business_country || "South Africa",
      approval_status: "pending" as const,
    };

    const { error } = await supabaseAdmin.from("wholesale_accounts").insert(insertRow);
    if (error) throw new Error(error.message);

    // Notify admin — graceful no-op if not configured.
    await maybeNotifyAdmin(data);
    return { ok: true as const };
  });

async function maybeNotifyAdmin(data: z.infer<typeof ApplicationSchema>) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.WHOLESALE_ADMIN_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || "Terps <orders@terpnation.co.za>";
  if (!apiKey || !adminEmail) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: adminEmail,
        subject: `Terps — New stockist application: ${data.business_name}`,
        html: `<div style="font-family:'Manrope',sans-serif;padding:24px;background:#0d0d0d;color:#f5f0e0;">
          <h2 style="font-family:'Fraunces',serif;color:#c9a84c;">New stockist application</h2>
          <p><strong>${data.business_name}</strong> (${data.business_type})</p>
          <p>Contact: ${data.primary_contact_name} · ${data.primary_contact_email} · ${data.primary_contact_phone}</p>
          <p>${data.business_city}, ${data.business_province}</p>
          <p>Monthly volume: ${data.estimated_monthly_volume}</p>
          <p>Review in Supabase Studio (wholesale_accounts).</p>
        </div>`,
      }),
    });
  } catch (e) {
    console.warn("[wholesale] admin notification failed", e);
  }
}

export const getMyWholesaleAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("wholesale_accounts")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const UpdateAccountSchema = z.object({
  primary_contact_name: z.string().trim().min(1).max(120),
  primary_contact_email: z.string().trim().toLowerCase().email().max(255),
  primary_contact_phone: z.string().trim().min(6).max(30),
  business_address_line_1: z.string().trim().min(1).max(200),
  business_address_line_2: z.string().trim().max(200).optional().or(z.literal("")),
  business_city: z.string().trim().min(1).max(120),
  business_province: z.string().trim().min(1).max(60),
  business_postal_code: z.string().trim().max(20).optional().or(z.literal("")),
});

export const updateMyWholesaleAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateAccountSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("wholesale_accounts")
      .update({
        primary_contact_name: data.primary_contact_name,
        primary_contact_email: data.primary_contact_email,
        primary_contact_phone: data.primary_contact_phone,
        business_address_line_1: data.business_address_line_1,
        business_address_line_2: data.business_address_line_2 || null,
        business_city: data.business_city,
        business_province: data.business_province,
        business_postal_code: data.business_postal_code || null,
      })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listWholesaleStrains = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Verify approved
    const { data: acct } = await supabaseAdmin
      .from("wholesale_accounts")
      .select("approval_status")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!acct || acct.approval_status !== "approved") {
      throw new Response("Forbidden", { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from("strains")
      .select(
        "id,slug,name,tagline,strain_type,product_line,product_image_url,accent_color_primary,box_quantity,wholesale_box_price_zar,wholesale_minimum_boxes,wholesale_available,weight_grams",
      )
      .eq("is_active", true)
      .eq("wholesale_available", true)
      .not("wholesale_box_price_zar", "is", null)
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as import("./types").WholesaleStrain[];
  });

const CartLineSchema = z.object({
  strainId: z.string().uuid(),
  boxes: z.number().int().min(1).max(500),
});

const CreateOrderSchema = z.object({
  items: z.array(CartLineSchema).min(1).max(50),
  shipping_address: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional().nullable(),
    city: z.string().min(1).max(120),
    province: z.string().min(1).max(60),
    postal_code: z.string().max(20).optional().nullable(),
    country: z.string().max(60).default("South Africa"),
  }),
  customer_notes: z.string().max(1000).optional().nullable(),
});

const SHIPPING_FLAT = 250;
const VAT_RATE = 0.15;

export const createWholesaleOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateOrderSchema.parse(d))
  .handler(async ({ data, context }) => {
    const userId = context.userId;

    const { data: acct } = await supabaseAdmin
      .from("wholesale_accounts")
      .select("id,approval_status,business_name,primary_contact_name,primary_contact_email,primary_contact_phone")
      .eq("user_id", userId)
      .maybeSingle();
    if (!acct || acct.approval_status !== "approved") {
      throw new Response("Forbidden", { status: 403 });
    }

    const ids = data.items.map((i) => i.strainId);
    const { data: strains, error: sErr } = await supabaseAdmin
      .from("strains")
      .select("id,name,box_quantity,wholesale_box_price_zar,wholesale_minimum_boxes,wholesale_available,is_active,weight_grams")
      .in("id", ids);
    if (sErr) throw new Error(sErr.message);
    const byId = new Map((strains ?? []).map((s) => [s.id, s]));

    let subtotal = 0;
    const orderItems: Array<{
      strain_id: string;
      strain_name: string;
      box_quantity_per_unit: number;
      boxes_ordered: number;
      total_units: number;
      unit_price_zar: number;
      box_price_zar: number;
      line_total_zar: number;
    }> = [];

    for (const line of data.items) {
      const s = byId.get(line.strainId);
      if (!s || !s.is_active || !s.wholesale_available || s.wholesale_box_price_zar == null) {
        return { ok: false as const, error: `${s?.name ?? "Item"} is not available for wholesale.` };
      }
      const minBoxes = s.wholesale_minimum_boxes ?? 1;
      if (line.boxes < minBoxes) {
        return { ok: false as const, error: `${s.name}: minimum ${minBoxes} box(es).` };
      }
      const boxPrice = Number(s.wholesale_box_price_zar);
      const boxQty = s.box_quantity ?? 20;
      const unitPrice = boxQty > 0 ? boxPrice / boxQty : 0;
      const lineTotal = boxPrice * line.boxes;
      subtotal += lineTotal;
      orderItems.push({
        strain_id: s.id,
        strain_name: s.name,
        box_quantity_per_unit: boxQty,
        boxes_ordered: line.boxes,
        total_units: boxQty * line.boxes,
        unit_price_zar: Number(unitPrice.toFixed(2)),
        box_price_zar: boxPrice,
        line_total_zar: lineTotal,
      });
    }

    const shipping = SHIPPING_FLAT;
    const vat = Number(((subtotal + shipping) * VAT_RATE).toFixed(2));
    const total = Number((subtotal + shipping + vat).toFixed(2));

    const { data: numRow, error: nErr } = await supabaseAdmin.rpc(
      "generate_wholesale_order_number" as never,
    );
    if (nErr || !numRow) throw new Error(nErr?.message || "Failed to generate order number");
    const orderNumber = numRow as unknown as string;

    const { data: order, error: oErr } = await supabaseAdmin
      .from("wholesale_orders")
      .insert({
        order_number: orderNumber,
        wholesale_account_id: acct.id,
        user_id: userId,
        subtotal_zar: subtotal,
        vat_zar: vat,
        shipping_zar: shipping,
        total_zar: total,
        shipping_address: data.shipping_address,
        customer_notes: data.customer_notes ?? null,
        payment_status: "pending",
        fulfillment_status: "pending",
      })
      .select("id, order_number")
      .single();
    if (oErr || !order) throw new Error(oErr?.message || "Failed to create order");

    const { error: iErr } = await supabaseAdmin
      .from("wholesale_order_items")
      .insert(orderItems.map((it) => ({ ...it, wholesale_order_id: order.id })));
    if (iErr) throw new Error(iErr.message);

    // Initiate BobPay if configured
    const merchantId = process.env.BOBPAY_MERCHANT_ID;
    const apiKey = process.env.BOBPAY_API_KEY;
    const apiUrl = process.env.BOBPAY_API_URL;
    if (!merchantId || !apiKey || !apiUrl) {
      return {
        ok: false as const,
        error: "Payments not yet configured. Contact sales@terpnation.co.za to complete this order.",
        orderNumber: order.order_number,
      };
    }

    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "X-Merchant-Id": merchantId,
        },
        body: JSON.stringify({
          merchant_id: merchantId,
          reference: order.order_number,
          amount_cents: Math.round(total * 100),
          currency: "ZAR",
          customer: {
            name: acct.primary_contact_name,
            email: acct.primary_contact_email,
            phone: acct.primary_contact_phone,
          },
          callback_url: `${process.env.PUBLIC_SITE_URL ?? ""}/api/public/bobpay-webhook`,
          return_url: `${process.env.PUBLIC_SITE_URL ?? ""}/wholesale/dashboard/orders/${order.id}`,
        }),
      });
      if (!res.ok) {
        return {
          ok: false as const,
          error: "Payment provider rejected the request. Please try again.",
          orderNumber: order.order_number,
          orderId: order.id,
        };
      }
      const payload = (await res.json()) as { transaction_id?: string; redirect_url?: string };
      await supabaseAdmin
        .from("wholesale_orders")
        .update({ bobpay_transaction_id: payload.transaction_id ?? null })
        .eq("id", order.id);
      return {
        ok: true as const,
        orderNumber: order.order_number,
        orderId: order.id,
        redirectUrl: payload.redirect_url ?? null,
      };
    } catch (e) {
      console.error("BobPay request failed", e);
      return {
        ok: false as const,
        error: "Could not reach payment provider. Please try again.",
        orderNumber: order.order_number,
        orderId: order.id,
      };
    }
  });

export const listMyWholesaleOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("wholesale_orders")
      .select(
        "id,order_number,subtotal_zar,vat_zar,shipping_zar,total_zar,payment_status,fulfillment_status,tracking_number,bobpay_transaction_id,paid_at,created_at,shipping_address,customer_notes",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    // For each order, fetch a lightweight items count
    const ids = (data ?? []).map((o) => o.id);
    let itemsByOrder: Record<string, number> = {};
    if (ids.length) {
      const { data: items } = await supabaseAdmin
        .from("wholesale_order_items")
        .select("wholesale_order_id, boxes_ordered")
        .in("wholesale_order_id", ids);
      itemsByOrder = (items ?? []).reduce<Record<string, number>>((acc, it) => {
        acc[it.wholesale_order_id] = (acc[it.wholesale_order_id] ?? 0) + it.boxes_ordered;
        return acc;
      }, {});
    }
    return (data ?? []).map((o) => ({ ...o, total_boxes: itemsByOrder[o.id] ?? 0 }));
  });

export const getMyWholesaleOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: order, error } = await supabaseAdmin
      .from("wholesale_orders")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;
    const { data: items } = await supabaseAdmin
      .from("wholesale_order_items")
      .select("*")
      .eq("wholesale_order_id", order.id);
    return { ...order, items: items ?? [] };
  });