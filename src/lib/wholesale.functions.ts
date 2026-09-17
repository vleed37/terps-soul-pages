import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SALES_EMAIL, WHOLESALE_DELIVERY_FEE, vatOn } from "@/lib/brand";
import { resolveTierPrice } from "@/lib/wholesale-pricing";

const BusinessTypeEnum = z.enum(["dispensary", "lounge", "specialty_retailer", "other"]);
const VolumeEnum = z.enum(["under_50", "50_to_200", "200_to_500", "500_plus"]);

const ApplicationSchema = z.object({
  // Company name is optional (Sept 2026 decision). Falls back to the contact name.
  business_name: z.string().trim().max(200).optional().or(z.literal("")),
  trading_as: z.string().trim().max(200).optional().or(z.literal("")),
  vat_number: z.string().trim().max(40).optional().or(z.literal("")),
  cipc_registration_number: z.string().trim().max(40).optional().or(z.literal("")),
  business_type: BusinessTypeEnum,
  estimated_monthly_volume: VolumeEnum.optional().or(z.literal("")),
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
      business_name: data.business_name || data.primary_contact_name,
      trading_as: data.trading_as || null,
      vat_number: data.vat_number || null,
      cipc_registration_number: data.cipc_registration_number || null,
      business_type: data.business_type,
      estimated_monthly_volume: data.estimated_monthly_volume || null,
      primary_contact_name: data.primary_contact_name,
      primary_contact_email: data.primary_contact_email,
      primary_contact_phone: data.primary_contact_phone,
      business_address_line_1: data.business_address_line_1,
      business_address_line_2: data.business_address_line_2 || null,
      business_city: data.business_city,
      business_province: data.business_province,
      business_postal_code: data.business_postal_code || null,
      business_country: data.business_country || "South Africa",
      approval_status: "approved" as const,
      approved_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin.from("wholesale_accounts").insert(insertRow);
    if (error) throw new Error(error.message);

    // Notify admin — graceful no-op if not configured.
    await maybeNotifyAdmin(data);
    return { ok: true as const };
  });

async function maybeNotifyAdmin(data: z.infer<typeof ApplicationSchema>) {
  const { sendEmail } = await import("@/lib/email.server");
  const adminEmail = process.env.WHOLESALE_ADMIN_EMAIL || SALES_EMAIL;
  await sendEmail({
    type: "internal-new-stockist",
    to: adminEmail,
    subject: `Terps — New stockist signed up: ${data.business_name || data.primary_contact_name}`,
    html: `<div style="font-family:'Manrope',sans-serif;padding:24px;background:#0d0d0d;color:#f5f0e0;">
      <h2 style="font-family:'Fraunces',serif;color:#c9a84c;">New stockist signed up</h2>
      <p><strong>${data.business_name || data.primary_contact_name}</strong> (${data.business_type})</p>
      <p>Contact: ${data.primary_contact_name} · ${data.primary_contact_email} · ${data.primary_contact_phone}</p>
      <p>${data.business_city}, ${data.business_province}</p>
      <p>Monthly volume: ${data.estimated_monthly_volume || "—"}</p>
    </div>`,
  });
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

const PublicListingSchema = z.object({
  map_listing_opt_in: z.boolean(),
  public_store_name: z.string().trim().max(200).optional().or(z.literal("")),
  public_address: z.string().trim().max(200).optional().or(z.literal("")),
  public_city: z.string().trim().max(120).optional().or(z.literal("")),
  public_province: z.string().trim().max(60).optional().or(z.literal("")),
  public_phone: z.string().trim().max(30).optional().or(z.literal("")),
});

/**
 * Stockist-controlled public map listing. Opting in is not enough: the finder
 * only shows the shop once the public details are complete AND the account has
 * a paid wholesale order. Coordinates only affect map/distance capability.
 *
 * Coordinates are NEVER accepted from the client — they are derived server-side
 * from the submitted address, and only when the address actually changed.
 */
export const updateMyPublicListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PublicListingSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: existing } = await supabaseAdmin
      .from("wholesale_accounts")
      .select("public_address,public_city,public_province,public_latitude,public_longitude")
      .eq("user_id", context.userId)
      .maybeSingle();

    const { addressKey, geocodeAddress } = await import("@/lib/geocode.server");
    const nextKey = addressKey([data.public_address, data.public_city, data.public_province]);
    const prevKey = addressKey([
      existing?.public_address,
      existing?.public_city,
      existing?.public_province,
    ]);
    const hasCoords =
      existing?.public_latitude != null && existing?.public_longitude != null;

    const patch: {
      map_listing_opt_in: boolean;
      public_store_name: string | null;
      public_address: string | null;
      public_city: string | null;
      public_province: string | null;
      public_phone: string | null;
      public_latitude?: number | null;
      public_longitude?: number | null;
      public_geocode_status?: string | null;
      public_geocoded_at?: string | null;
    } = {
      map_listing_opt_in: data.map_listing_opt_in,
      public_store_name: data.public_store_name || null,
      public_address: data.public_address || null,
      public_city: data.public_city || null,
      public_province: data.public_province || null,
      public_phone: data.public_phone || null,
    };

    let geocode: "skipped" | "ok" | "failed" | "unconfigured" = "skipped";
    if (!nextKey) {
      // Address cleared — drop stale coordinates.
      patch.public_latitude = null;
      patch.public_longitude = null;
    } else if (nextKey !== prevKey || !hasCoords) {
      const result = await geocodeAddress({
        address: data.public_address,
        city: data.public_city,
        province: data.public_province,
      });
      if (result.status === "ok") {
        patch.public_latitude = result.latitude;
        patch.public_longitude = result.longitude;
        geocode = "ok";
      } else if (result.status === "unconfigured") {
        // No provider configured — keep any existing coordinates untouched.
        geocode = "unconfigured";
      } else if (nextKey !== prevKey) {
        // Address genuinely changed but could not be resolved: stale pin removed,
        // the listing itself still saves normally.
        patch.public_latitude = null;
        patch.public_longitude = null;
        geocode = "failed";
      } else {
        geocode = "failed";
      }
    }

    if (geocode !== "skipped") {
      patch.public_geocode_status = geocode;
      patch.public_geocoded_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("wholesale_accounts")
      .update(patch)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const, geocode };
  });

/** Whether this stockist currently qualifies to appear on the public map. */
export const getMyListingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: acct } = await supabaseAdmin
      .from("wholesale_accounts")
      .select("id,map_listing_opt_in,public_store_name,public_address,public_phone")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!acct) return { optedIn: false, detailsComplete: false, hasPaidOrder: false, listed: false };
    const detailsComplete = Boolean(
      acct.public_store_name?.trim() && acct.public_address?.trim() && acct.public_phone?.trim(),
    );
    const { count } = await supabaseAdmin
      .from("wholesale_orders")
      .select("id", { count: "exact", head: true })
      .eq("wholesale_account_id", acct.id)
      .eq("payment_status", "paid");
    const hasPaidOrder = (count ?? 0) > 0;
    const optedIn = Boolean(acct.map_listing_opt_in);
    return { optedIn, detailsComplete, hasPaidOrder, listed: optedIn && detailsComplete && hasPaidOrder };
  });

async function assertApprovedStockist(userId: string) {
  const { data: acct } = await supabaseAdmin
    .from("wholesale_accounts")
    .select("approval_status")
    .eq("user_id", userId)
    .maybeSingle();
  if (!acct || acct.approval_status !== "approved") {
    throw new Response("Forbidden", { status: 403 });
  }
}

type TierRow = { strain_id: string; min_boxes: number; max_boxes: number | null; price_per_box_zar: number };

/** Server-only: protected wholesale config + tier ladder per strain. */
async function loadWholesaleCatalog(strainIds?: string[]) {
  let productQuery = supabaseAdmin
    .from("wholesale_products")
    .select("strain_id,units_per_box,minimum_boxes,wholesale_active")
    .eq("wholesale_active", true);
  if (strainIds?.length) productQuery = productQuery.in("strain_id", strainIds);
  const { data: products, error: pErr } = await productQuery;
  if (pErr) throw new Error(pErr.message);

  const ids = (products ?? []).map((p) => p.strain_id);
  if (!ids.length) return { products: [], tiersByStrain: new Map<string, TierRow[]>(), strainsById: new Map() };

  const [{ data: tiers, error: tErr }, { data: strains, error: sErr }] = await Promise.all([
    supabaseAdmin
      .from("wholesale_price_tiers")
      .select("strain_id,min_boxes,max_boxes,price_per_box_zar")
      .in("strain_id", ids),
    supabaseAdmin
      .from("strains")
      .select(
        "id,slug,name,tagline,strain_type,product_line,product_image_url,accent_color_primary,weight_grams,price_zar,is_active,display_order",
      )
      .in("id", ids),
  ]);
  if (tErr) throw new Error(tErr.message);
  if (sErr) throw new Error(sErr.message);

  const tiersByStrain = new Map<string, TierRow[]>();
  for (const t of (tiers ?? []) as TierRow[]) {
    const list = tiersByStrain.get(t.strain_id) ?? [];
    list.push({ ...t, price_per_box_zar: Number(t.price_per_box_zar) });
    tiersByStrain.set(t.strain_id, list);
  }
  const strainsById = new Map((strains ?? []).map((s) => [s.id, s]));
  return { products: products ?? [], tiersByStrain, strainsById };
}

export const listWholesaleStrains = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertApprovedStockist(context.userId);

    const { products, tiersByStrain, strainsById } = await loadWholesaleCatalog();
    const rows = products
      .map((p) => {
        const s = strainsById.get(p.strain_id);
        const tiers = tiersByStrain.get(p.strain_id) ?? [];
        if (!s || !s.is_active || tiers.length === 0) return null;
        return {
          id: s.id,
          slug: s.slug,
          name: s.name,
          tagline: s.tagline,
          strain_type: s.strain_type,
          product_line: s.product_line,
          product_image_url: s.product_image_url,
          accent_color_primary: s.accent_color_primary,
          weight_grams: s.weight_grams,
          units_per_box: p.units_per_box,
          minimum_boxes: p.minimum_boxes ?? 1,
          rrp_zar: Number(s.price_zar),
          tiers: tiers
            .map((t) => ({ min_boxes: t.min_boxes, max_boxes: t.max_boxes, price_per_box_zar: t.price_per_box_zar }))
            .sort((a, b) => a.min_boxes - b.min_boxes),
          display_order: s.display_order ?? 0,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => a.display_order - b.display_order)
      .map(({ display_order: _d, ...rest }) => rest);

    return rows as unknown as import("./types").WholesaleStrain[];
  });

const CartLineSchema = z.object({
  strainId: z.string().uuid(),
  boxes: z.number().int().min(1).max(500),
});

/**
 * A variety box: several strains from ONE product line making up exactly one
 * full box. Composition is validated server-side; the browser is never trusted.
 */
const MixedBoxSchema = z.object({
  productLine: z.enum(["pre_roll", "caviar_stix"]),
  boxes: z.number().int().min(1).max(500),
  composition: z
    .array(
      z.object({
        strainId: z.string().uuid(),
        units: z.number().int().min(1).max(500),
      }),
    )
    .min(2)
    .max(20),
});

const CreateOrderSchema = z.object({
  items: z.array(CartLineSchema).max(50).default([]),
  mixedBoxes: z.array(MixedBoxSchema).max(20).default([]),
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


const SHIPPING_FLAT = WHOLESALE_DELIVERY_FEE;

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

    if (data.items.length === 0 && data.mixedBoxes.length === 0) {
      return { ok: false as const, error: "Your cart is empty." };
    }

    const ids = [
      ...data.items.map((i) => i.strainId),
      ...data.mixedBoxes.flatMap((b) => b.composition.map((c) => c.strainId)),
    ];
    const { products, tiersByStrain, strainsById } = await loadWholesaleCatalog(ids);
    const productById = new Map(products.map((p) => [p.strain_id, p]));

    let subtotal = 0;
    const orderItems: Array<{
      strain_id: string | null;
      strain_name: string;
      box_quantity_per_unit: number;
      boxes_ordered: number;
      total_units: number;
      unit_price_zar: number;
      box_price_zar: number;
      line_total_zar: number;
      item_type: "single_strain" | "mixed_box";
      product_line: string | null;
      box_composition: import("@/integrations/supabase/types").Json | null;
    }> = [];

    for (const line of data.items) {
      const s = strainsById.get(line.strainId);
      const p = productById.get(line.strainId);
      const tiers = tiersByStrain.get(line.strainId) ?? [];
      if (!s || !s.is_active || !p || tiers.length === 0) {
        return { ok: false as const, error: `${s?.name ?? "Item"} is not available for wholesale.` };
      }
      const minBoxes = p.minimum_boxes ?? 1;
      if (line.boxes < minBoxes) {
        return { ok: false as const, error: `${s.name}: minimum ${minBoxes} box(es).` };
      }
      // Server-authoritative tier pricing — client-sent prices are never trusted.
      const boxPrice = resolveTierPrice(tiers, line.boxes);
      if (boxPrice <= 0) {
        return { ok: false as const, error: `${s.name}: no wholesale price configured.` };
      }
      const boxQty = p.units_per_box ?? 20;
      const unitPrice = boxQty > 0 ? boxPrice / boxQty : 0;
      const lineTotal = Number((boxPrice * line.boxes).toFixed(2));
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
        item_type: "single_strain",
        product_line: s.product_line ?? null,
        box_composition: null,
      });
    }

    // ---- Variety boxes: one product family per box, exactly one full box ----
    for (const box of data.mixedBoxes) {
      const entries = box.composition;
      const strains = entries.map((e) => strainsById.get(e.strainId));
      if (strains.some((s) => !s || !s.is_active)) {
        return { ok: false as const, error: "A strain in your variety box is unavailable." };
      }
      if (strains.some((s) => s!.product_line !== box.productLine)) {
        return {
          ok: false as const,
          error: "A variety box may only mix strains from the same product family.",
        };
      }
      const prods = entries.map((e) => productById.get(e.strainId));
      if (prods.some((p) => !p)) {
        return { ok: false as const, error: "A strain in your variety box is not sold wholesale." };
      }
      const boxQty = prods[0]!.units_per_box ?? 20;
      if (prods.some((p) => (p!.units_per_box ?? 20) !== boxQty)) {
        return { ok: false as const, error: "Inconsistent box size for this product family." };
      }
      const unitTotal = entries.reduce((a, e) => a + e.units, 0);
      if (unitTotal !== boxQty) {
        return {
          ok: false as const,
          error: `A variety box must contain exactly ${boxQty} units (yours has ${unitTotal}).`,
        };
      }
      const uniqueIds = new Set(entries.map((e) => e.strainId));
      if (uniqueIds.size !== entries.length) {
        return { ok: false as const, error: "Each strain may appear once per variety box." };
      }

      // Price per box = units-weighted tier price of its contents at this box count.
      let boxPrice = 0;
      for (const e of entries) {
        const tiers = tiersByStrain.get(e.strainId) ?? [];
        const per = resolveTierPrice(tiers, box.boxes);
        if (per <= 0) {
          return { ok: false as const, error: "No wholesale price configured for a mixed strain." };
        }
        boxPrice += (per / boxQty) * e.units;
      }
      boxPrice = Number(boxPrice.toFixed(2));
      const lineTotal = Number((boxPrice * box.boxes).toFixed(2));
      subtotal += lineTotal;

      const familyLabel =
        box.productLine === "caviar_stix" ? "Mixed Caviar Stick Box" : "Mixed Infused Pre-Roll Box";

      orderItems.push({
        strain_id: null,
        strain_name: familyLabel,
        box_quantity_per_unit: boxQty,
        boxes_ordered: box.boxes,
        total_units: boxQty * box.boxes,
        unit_price_zar: Number((boxPrice / boxQty).toFixed(2)),
        box_price_zar: boxPrice,
        line_total_zar: lineTotal,
        item_type: "mixed_box",
        product_line: box.productLine,
        // Snapshot: exact composition as ordered, for fulfilment and stock.
        box_composition: entries.map((e) => ({
          strain_id: e.strainId,
          strain_name: strainsById.get(e.strainId)!.name,
          slug: strainsById.get(e.strainId)!.slug,
          units: e.units,
        })),
      });
    }
    subtotal = Number(subtotal.toFixed(2));


    const shipping = SHIPPING_FLAT;
    // VAT fails safe: vatOn() returns 0 until VAT registration is confirmed.
    const vat = vatOn(subtotal + shipping);
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
        error: `Payments not yet configured. Contact ${SALES_EMAIL} to complete this order.`,
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