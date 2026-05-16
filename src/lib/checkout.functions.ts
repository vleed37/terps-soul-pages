import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CartItemSchema = z.object({
  strainId: z.string().uuid(),
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  priceZar: z.number().nonnegative(),
  weightGrams: z.number().nonnegative(),
  quantity: z.number().int().min(1).max(99),
});

const AddressSchema = z.object({
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().nullable(),
  suburb: z.string().min(1).max(120),
  city: z.string().min(1).max(120),
  province: z.string().min(1).max(60),
  postalCode: z.string().min(3).max(10),
});

const CheckoutInputSchema = z.object({
  items: z.array(CartItemSchema).min(1).max(50),
  contact: z.object({
    fullName: z.string().min(1).max(120),
    email: z.string().email().max(200),
    phone: z.string().min(6).max(20),
  }),
  deliveryMethod: z.enum(["delivery", "collect"]),
  address: AddressSchema.optional().nullable(),
  collectStockistId: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const initiateBobpayPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CheckoutInputSchema.parse(input))
  .handler(async ({ data }) => {
    // Optional auth: if the caller is signed in, attach customer_id to the order.
    let customerId: string | null = null;
    try {
      const req = getRequest();
      const authHeader = req?.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const { data: claims } = await supabaseAdmin.auth.getClaims(token);
        if (claims?.claims?.sub) customerId = claims.claims.sub as string;
      }
    } catch (e) {
      // Non-fatal — proceed as guest.
      console.warn("[checkout] optional auth read failed", e);
    }

    // 1) Re-fetch live strain data and verify stock + price server-side
    const ids = data.items.map((i) => i.strainId);
    const { data: strains, error: sErr } = await supabaseAdmin
      .from("strains")
      .select("id,slug,name,price_zar,stock_quantity,is_active")
      .in("id", ids);
    if (sErr) throw new Error(sErr.message);
    const byId = new Map((strains ?? []).map((s) => [s.id, s]));

    let subtotal = 0;
    const orderItems: Array<{
      strain_id: string;
      strain_slug: string;
      strain_name: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }> = [];

    for (const item of data.items) {
      const s = byId.get(item.strainId);
      if (!s || !s.is_active) {
        return { ok: false as const, error: `${item.name} is no longer available.` };
      }
      if (s.stock_quantity < item.quantity) {
        return { ok: false as const, error: `${s.name}: only ${s.stock_quantity} left.` };
      }
      const unit = Number(s.price_zar);
      const line = unit * item.quantity;
      subtotal += line;
      orderItems.push({
        strain_id: s.id,
        strain_slug: s.slug,
        strain_name: s.name,
        quantity: item.quantity,
        unit_price: unit,
        line_total: line,
      });
    }

    const deliveryFee =
      data.deliveryMethod === "collect" ? 0 : subtotal >= 500 ? 0 : 80;
    const total = subtotal + deliveryFee;

    // 2) Generate order number
    const { data: numRow, error: nErr } = await supabaseAdmin.rpc("generate_order_number");
    if (nErr || !numRow) throw new Error(nErr?.message || "Failed to generate order number");
    const orderNumber = numRow as unknown as string;

    // 3) Insert order
    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        guest_name: data.contact.fullName,
        guest_email: data.contact.email,
        guest_phone: data.contact.phone,
        status: "pending",
        payment_status: "unpaid",
        payment_method: "bobpay",
        subtotal,
        delivery_fee: deliveryFee,
        total,
        delivery_method: data.deliveryMethod,
        delivery_address: data.deliveryMethod === "delivery" ? data.address : null,
        collect_stockist_id: data.deliveryMethod === "collect" ? data.collectStockistId : null,
        notes: data.notes ?? null,
      })
      .select("id, order_number")
      .single();
    if (oErr || !order) throw new Error(oErr?.message || "Failed to create order");

    // 4) Insert order items
    const { error: iErr } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems.map((it) => ({ ...it, order_id: order.id })));
    if (iErr) throw new Error(iErr.message);

    // 5) Initiate BobPay — gracefully degrade if secrets missing
    const merchantId = process.env.BOBPAY_MERCHANT_ID;
    const apiKey = process.env.BOBPAY_API_KEY;
    const apiUrl = process.env.BOBPAY_API_URL;
    if (!merchantId || !apiKey || !apiUrl) {
      return {
        ok: false as const,
        error:
          "Payments are not yet configured. Please contact sales@terpsnation.co.za to complete this order.",
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
            name: data.contact.fullName,
            email: data.contact.email,
            phone: data.contact.phone,
          },
          callback_url: `${process.env.PUBLIC_SITE_URL ?? ""}/api/public/bobpay-webhook`,
          return_url: `${process.env.PUBLIC_SITE_URL ?? ""}/order/${order.order_number}`,
        }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("BobPay error", res.status, txt);
        return {
          ok: false as const,
          error: "Payment provider rejected the request. Please try again.",
          orderNumber: order.order_number,
        };
      }
      const payload = (await res.json()) as {
        transaction_id?: string;
        reference?: string;
        redirect_url?: string;
      };
      await supabaseAdmin
        .from("orders")
        .update({
          bobpay_transaction_id: payload.transaction_id ?? null,
          bobpay_reference: payload.reference ?? order.order_number,
        })
        .eq("id", order.id);
      return {
        ok: true as const,
        orderNumber: order.order_number,
        redirectUrl: payload.redirect_url ?? null,
      };
    } catch (e) {
      console.error("BobPay request failed", e);
      return {
        ok: false as const,
        error: "Could not reach payment provider. Please try again.",
        orderNumber: order.order_number,
      };
    }
  });

export const getOrderByNumber = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ orderNumber: z.string().min(1).max(40) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, status, payment_status, subtotal, delivery_fee, total, delivery_method, delivery_address, collect_stockist_id, notes, guest_name, guest_email, guest_phone, created_at, payment_completed_at",
      )
      .eq("order_number", data.orderNumber)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;

    const { data: items, error: iErr } = await supabaseAdmin
      .from("order_items")
      .select("strain_slug, strain_name, quantity, unit_price, line_total")
      .eq("order_id", order.id);
    if (iErr) throw new Error(iErr.message);

    return { ...order, items: items ?? [] };
  });