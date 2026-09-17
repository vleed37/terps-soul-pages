import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Internal management server functions.
 *
 * Every handler calls `requireAdmin` (database `user_roles` + `has_role`) before
 * touching data. The service-role client is only loaded inside handlers, so it
 * never reaches the browser bundle.
 */
async function admin(userId: string | undefined) {
  const [{ requireAdmin }, { supabaseAdmin }] = await Promise.all([
    import("@/lib/admin-auth.server"),
    import("@/integrations/supabase/client.server"),
  ]);
  await requireAdmin(userId);
  return supabaseAdmin;
}

/* ------------------------------------------------------------------ access */

/** Whether the signed-in user is an admin. Used by the /admin route gate. */
export const adminWhoAmI = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: data === true, userId: context.userId };
  });

export const adminListAdmins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin(context.userId);
    const { data: roles } = await db
      .from("user_roles")
      .select("id,user_id,role,created_at")
      .eq("role", "admin");
    const out: Array<{ id: string; user_id: string; email: string | null; created_at: string }> = [];
    for (const r of roles ?? []) {
      const { data: u } = await db.auth.admin.getUserById(r.user_id);
      out.push({ id: r.id, user_id: r.user_id, email: u?.user?.email ?? null, created_at: r.created_at });
    }
    return out;
  });

export const adminGrantAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const target = data.email.trim().toLowerCase();
    const { data: list, error } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw new Error(error.message);
    const user = list.users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (!user) {
      return { ok: false as const, error: "No account exists with that email. Ask them to sign up first." };
    }
    const { error: iErr } = await db
      .from("user_roles")
      .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
    if (iErr) throw new Error(iErr.message);
    return { ok: true as const };
  });

export const adminRevokeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    if (data.user_id === context.userId) {
      return { ok: false as const, error: "You cannot remove your own admin access." };
    }
    const { count } = await db
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) return { ok: false as const, error: "At least one admin must remain." };
    const { error } = await db.from("user_roles").delete().eq("user_id", data.user_id).eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* --------------------------------------------------------------- dashboard */

export const adminDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin(context.userId);
    const count = async (
      table: string,
      build: (q: any) => any = (q) => q,
    ): Promise<number> => {
      const { count: c } = await build(db.from(table as never).select("id", { count: "exact", head: true }));
      return c ?? 0;
    };

    const [
      activeStrains,
      archivedStrains,
      wholesaleProducts,
      activeAccounts,
      suspendedAccounts,
      retailOrders,
      wholesaleOrders,
      retailAwaiting,
      wholesaleAwaiting,
      pendingReviews,
      curatedStockists,
    ] = await Promise.all([
      count("strains", (q) => q.eq("is_active", true).eq("is_archived", false)),
      count("strains", (q) => q.eq("is_archived", true)),
      count("wholesale_products", (q) => q.eq("wholesale_active", true)),
      count("wholesale_accounts", (q) => q.eq("approval_status", "approved")),
      count("wholesale_accounts", (q) => q.eq("approval_status", "suspended")),
      count("orders"),
      count("wholesale_orders"),
      count("orders", (q) => q.in("status", ["paid", "fulfilling"])),
      count("wholesale_orders", (q) => q.in("fulfillment_status", ["pending", "preparing"]).eq("payment_status", "paid")),
      count("product_reviews", (q) => q.eq("status", "pending")),
      count("stockists", (q) => q.eq("is_active", true)),
    ]);

    // Publicly listed stockist accounts: opted in, complete, with a paid order.
    const { data: optedIn } = await db
      .from("wholesale_accounts")
      .select("id")
      .eq("approval_status", "approved")
      .eq("map_listing_opt_in", true)
      .not("public_store_name", "is", null)
      .not("public_address", "is", null)
      .not("public_phone", "is", null);
    let publiclyListedAccounts = 0;
    if ((optedIn ?? []).length > 0) {
      const { data: paid } = await db
        .from("wholesale_orders")
        .select("wholesale_account_id")
        .eq("payment_status", "paid")
        .in("wholesale_account_id", (optedIn ?? []).map((a) => a.id));
      publiclyListedAccounts = new Set((paid ?? []).map((p) => p.wholesale_account_id)).size;
    }

    return {
      activeStrains,
      archivedStrains,
      wholesaleProducts,
      activeAccounts,
      suspendedAccounts,
      retailOrders,
      wholesaleOrders,
      awaitingFulfilment: retailAwaiting + wholesaleAwaiting,
      pendingReviews,
      curatedStockists,
      publiclyListedAccounts,
    };
  });

/* ----------------------------------------------------------------- strains */

export const adminCreateStrain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(200),
        slug: z
          .string()
          .trim()
          .min(2)
          .max(120)
          .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
        product_line: z.string().min(1).max(60),
        product_tier: z.string().min(1).max(60).default("core"),
        price_zar: z.number().min(0).max(100000),
        stock_quantity: z.number().int().min(0).max(1000000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const { data: clash } = await db.from("strains").select("id").eq("slug", data.slug).maybeSingle();
    if (clash) return { ok: false as const, error: "That slug is already used by another product." };
    const { data: row, error } = await db
      .from("strains")
      .insert({ ...data, is_active: false })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true as const, id: row.id };
  });

export const adminSetStrainArchived = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), archived: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    // Archiving never deletes: historical order snapshots stay intact.
    const patch = data.archived
      ? { is_archived: true, archived_at: new Date().toISOString(), is_active: false }
      : { is_archived: false, archived_at: null };
    const { error } = await db.from("strains").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

/** Upload/replace a strain's main product photo. Base64 payload, server-validated. */
export const adminUploadStrainImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        contentType: z.string().max(80),
        dataBase64: z.string().min(16).max(9_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const ext = IMAGE_TYPES[data.contentType];
    if (!ext) return { ok: false as const, error: "Use a JPG, PNG, WebP or AVIF image." };

    const bytes = Buffer.from(data.dataBase64, "base64");
    if (bytes.byteLength === 0) return { ok: false as const, error: "That file appears to be empty." };
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return { ok: false as const, error: "Images must be 6 MB or smaller." };
    }

    const { data: strain } = await db.from("strains").select("slug").eq("id", data.id).maybeSingle();
    if (!strain) return { ok: false as const, error: "Product not found." };

    // Safe, generated path — no client-supplied file names.
    const path = `strains/${data.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage
      .from("product-images")
      .upload(path, bytes, { contentType: data.contentType, upsert: true });
    if (upErr) throw new Error(upErr.message);

    const url = `/api/public/product-image/${path}`;
    const { error } = await db.from("strains").update({ product_image_url: url }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const, url };
  });

export const adminRemoveStrainImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const { error } = await db.from("strains").update({ product_image_url: null }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ---------------------------------------------------- strain <-> terpenes */

export const adminGetStrainTerpenes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ strain_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const [{ data: links }, { data: terpenes }] = await Promise.all([
      db
        .from("strain_terpenes")
        .select("terpene_id,prominence,percentage,note")
        .eq("strain_id", data.strain_id)
        .order("prominence", { ascending: true }),
      db.from("terpenes").select("id,name,slug,display_order").order("display_order", { ascending: true }),
    ]);
    return { links: links ?? [], terpenes: terpenes ?? [] };
  });

export const adminSetStrainTerpenes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        strain_id: z.string().uuid(),
        items: z
          .array(
            z.object({
              terpene_id: z.string().uuid(),
              prominence: z.number().int().min(0).max(50).default(0),
              percentage: z.number().min(0).max(100).nullable().default(null),
              note: z.string().max(200).nullable().default(null),
            }),
          )
          .max(20),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const seen = new Set<string>();
    const rows = data.items
      .filter((i) => (seen.has(i.terpene_id) ? false : (seen.add(i.terpene_id), true)))
      .map((i) => ({ ...i, strain_id: data.strain_id }));

    const { error: dErr } = await db.from("strain_terpenes").delete().eq("strain_id", data.strain_id);
    if (dErr) throw new Error(dErr.message);
    if (rows.length > 0) {
      const { error } = await db.from("strain_terpenes").insert(rows);
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

/* ---------------------------------------------------------------- terpenes */

export const adminListTerpenes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin(context.userId);
    const [{ data: terpenes }, { data: links }] = await Promise.all([
      db
        .from("terpenes")
        .select("id,slug,name,tastes_like,short_descriptor,long_description,display_order,found_in_strain_slugs")
        .order("display_order", { ascending: true }),
      db.from("strain_terpenes").select("terpene_id,strain_id"),
    ]);
    const { data: strains } = await db.from("strains").select("id,name,slug");
    const byId = new Map((strains ?? []).map((s) => [s.id, s]));
    const grouped = new Map<string, Array<{ id: string; name: string; slug: string }>>();
    for (const l of links ?? []) {
      const s = byId.get(l.strain_id);
      if (!s) continue;
      const list = grouped.get(l.terpene_id) ?? [];
      list.push(s);
      grouped.set(l.terpene_id, list);
    }
    return (terpenes ?? []).map((t) => ({ ...t, strains: grouped.get(t.id) ?? [] }));
  });

export const adminUpdateTerpene = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(2).max(80).optional(),
        tastes_like: z.string().max(200).nullable().optional(),
        short_descriptor: z.string().max(300).nullable().optional(),
        long_description: z.string().max(4000).nullable().optional(),
        display_order: z.number().int().min(0).max(999).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const { id, ...patch } = data;
    const { error } = await db.from("terpenes").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ------------------------------------------------------------------ orders */

const OrderType = z.enum(["retail", "wholesale"]);

export const adminListOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        type: OrderType.default("wholesale"),
        q: z.string().max(120).optional(),
        payment_status: z.string().max(30).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);

    if (data.type === "retail") {
      let query = db
        .from("orders")
        .select(
          "id,order_number,created_at,total,payment_status,status,guest_name,guest_email,customer_id,delivery_method",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (data.payment_status) query = query.eq("payment_status", data.payment_status);
      if (data.q) query = query.or(`order_number.ilike.%${data.q}%,guest_email.ilike.%${data.q}%`);
      const { data: rows, error } = await query;
      if (error) throw new Error(error.message);
      return (rows ?? []).map((o) => ({
        id: o.id,
        order_number: o.order_number,
        created_at: o.created_at,
        total: Number(o.total),
        payment_status: o.payment_status,
        fulfilment_status: o.status,
        who: o.guest_name ?? o.guest_email ?? "Account customer",
        type: "retail" as const,
      }));
    }

    let query = db
      .from("wholesale_orders")
      .select(
        "id,order_number,created_at,total_zar,payment_status,fulfillment_status,wholesale_account_id",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.payment_status) query = query.eq("payment_status", data.payment_status);
    if (data.q) query = query.ilike("order_number", `%${data.q}%`);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const ids = [...new Set((rows ?? []).map((r) => r.wholesale_account_id))];
    const names = new Map<string, string>();
    if (ids.length > 0) {
      const { data: accts } = await db
        .from("wholesale_accounts")
        .select("id,business_name")
        .in("id", ids);
      for (const a of accts ?? []) names.set(a.id, a.business_name);
    }
    return (rows ?? []).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      created_at: o.created_at,
      total: Number(o.total_zar),
      payment_status: o.payment_status,
      fulfilment_status: o.fulfillment_status,
      who: names.get(o.wholesale_account_id) ?? "Wholesale account",
      type: "wholesale" as const,
    }));
  });

export const adminGetOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ type: OrderType, id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);

    if (data.type === "retail") {
      const { data: order, error } = await db
        .from("orders")
        .select("*")
        .eq("id", data.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!order) return null;
      const { data: items } = await db
        .from("order_items")
        .select("id,strain_name,strain_slug,quantity,unit_price,line_total")
        .eq("order_id", data.id);
      let customer: { full_name: string | null; phone: string | null } | null = null;
      if (order.customer_id) {
        const { data: c } = await db
          .from("customers")
          .select("full_name,phone")
          .eq("id", order.customer_id)
          .maybeSingle();
        customer = c ?? null;
      }
      return { type: "retail" as const, order, items: items ?? [], customer, account: null };
    }

    const { data: order, error } = await db
      .from("wholesale_orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;
    const [{ data: items }, { data: account }] = await Promise.all([
      db
        .from("wholesale_order_items")
        .select(
          "id,strain_name,item_type,product_line,box_quantity_per_unit,boxes_ordered,total_units,unit_price_zar,box_price_zar,line_total_zar,box_composition",
        )
        .eq("wholesale_order_id", data.id),
      db
        .from("wholesale_accounts")
        .select(
          "id,business_name,trading_as,primary_contact_name,primary_contact_email,primary_contact_phone,approval_status",
        )
        .eq("id", order.wholesale_account_id)
        .maybeSingle(),
    ]);
    return {
      type: "wholesale" as const,
      order,
      items: items ?? [],
      account: account ?? null,
      customer: null,
    };
  });

/**
 * Fulfilment and tracking only.
 *
 * Payment status is deliberately NOT settable here — it stays owned by the
 * BobPay webhook, so it cannot be forged through the admin interface, and stock
 * is never decremented from this path (that remains the webhook's idempotent job).
 */
export const adminUpdateFulfilment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        type: OrderType,
        id: z.string().uuid(),
        status: z.enum(["pending", "preparing", "fulfilling", "shipped", "delivered", "cancelled"]),
        tracking_number: z.string().max(120).nullable().optional(),
        tracking_url: z.string().max(400).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const now = new Date().toISOString();

    if (data.type === "wholesale") {
      const status =
        data.status === "fulfilling" ? "preparing" : data.status === "pending" ? "pending" : data.status;
      const patch = {
        fulfillment_status: status,
        ...(data.tracking_number !== undefined ? { tracking_number: data.tracking_number || null } : {}),
        ...(status === "shipped" ? { shipped_at: now } : {}),
        ...(status === "delivered" ? { fulfilled_at: now } : {}),
      };
      const { error } = await db.from("wholesale_orders").update(patch).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    }

    const { data: existing } = await db
      .from("orders")
      .select("payment_status,status")
      .eq("id", data.id)
      .maybeSingle();
    if (!existing) return { ok: false as const, error: "Order not found." };

    const status = data.status === "preparing" ? "fulfilling" : data.status;
    if (status === "pending" && existing.payment_status === "paid") {
      // Never rewrite a paid retail order back to the unpaid lifecycle stage.
      return { ok: false as const, error: "A paid order cannot return to pending." };
    }
    const patch = {
      status,
      ...(data.tracking_number !== undefined ? { tracking_number: data.tracking_number || null } : {}),
      ...(data.tracking_url !== undefined ? { tracking_url: data.tracking_url || null } : {}),
      ...(status === "shipped" ? { shipped_at: now } : {}),
      ...(status === "delivered" ? { fulfilled_at: now } : {}),
    };
    const { error } = await db.from("orders").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ----------------------------------------------------------------- reviews */

export const adminListReviews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ status: z.enum(["pending", "approved", "rejected"]).default("pending") }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const { data: rows, error } = await db
      .from("product_reviews")
      .select("id,rating,body,status,submitted_at,moderated_at,moderation_note,customer_id,strain_id")
      .eq("status", data.status)
      .order("submitted_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    const strainIds = [...new Set((rows ?? []).map((r) => r.strain_id))];
    const customerIds = [...new Set((rows ?? []).map((r) => r.customer_id))];
    const [{ data: strains }, { data: customers }, { data: reports }] = await Promise.all([
      strainIds.length ? db.from("strains").select("id,name,slug").in("id", strainIds) : Promise.resolve({ data: [] as any[] }),
      customerIds.length ? db.from("customers").select("id,full_name").in("id", customerIds) : Promise.resolve({ data: [] as any[] }),
      db.from("review_reports").select("review_id,reason"),
    ]);
    const strainById = new Map((strains ?? []).map((s: any) => [s.id, s]));
    const nameById = new Map((customers ?? []).map((c: any) => [c.id, c.full_name as string | null]));
    const reportsById = new Map<string, string[]>();
    for (const r of reports ?? []) {
      const list = reportsById.get(r.review_id) ?? [];
      list.push(r.reason);
      reportsById.set(r.review_id, list);
    }

    return (rows ?? []).map((r) => {
      const parts = (nameById.get(r.customer_id) ?? "").trim().split(/\s+/).filter(Boolean);
      const masked =
        parts.length === 0
          ? "Verified customer"
          : parts.length === 1
            ? parts[0]!
            : `${parts[0]} ${parts[parts.length - 1]!.charAt(0).toUpperCase()}.`;
      const reasons = reportsById.get(r.id) ?? [];
      return {
        id: r.id,
        rating: r.rating,
        body: r.body,
        status: r.status,
        submitted_at: r.submitted_at,
        moderated_at: r.moderated_at,
        moderation_note: r.moderation_note,
        customer: masked,
        strain: strainById.get(r.strain_id) ?? null,
        report_count: reasons.length,
        report_reasons: reasons.slice(0, 5),
      };
    });
  });

export const adminModerateReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["approved", "rejected", "pending"]),
        note: z.string().max(500).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const { error } = await db
      .from("product_reviews")
      .update({
        status: data.status,
        moderation_note: data.note ?? null,
        moderated_at: new Date().toISOString(),
        moderated_by: context.userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ------------------------------------------------- wholesale accounts */

function eligibility(a: {
  approval_status: string;
  map_listing_opt_in: boolean;
  public_store_name: string | null;
  public_address: string | null;
  public_phone: string | null;
  public_latitude: number | null;
  public_longitude: number | null;
  hasPaidOrder: boolean;
}) {
  if (a.approval_status !== "approved") {
    return { state: "not_eligible" as const, reason: "Account is not active" };
  }
  if (!a.hasPaidOrder) {
    return { state: "not_eligible" as const, reason: "No paid wholesale order yet" };
  }
  const missing = [
    !a.public_store_name && "store name",
    !a.public_address && "address",
    !a.public_phone && "phone",
  ].filter(Boolean) as string[];
  if (missing.length > 0) {
    return { state: "not_eligible" as const, reason: `Public details incomplete (${missing.join(", ")})` };
  }
  if (!a.map_listing_opt_in) return { state: "eligible_not_opted_in" as const, reason: null };
  const geocoded = a.public_latitude != null && a.public_longitude != null;
  return {
    state: geocoded ? ("active" as const) : ("active_no_coordinates" as const),
    reason: geocoded ? null : "Address not geocoded — listed as a text result only",
  };
}

export const adminListWholesaleAccounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ q: z.string().max(120).optional(), status: z.string().max(30).optional() }).parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    let query = db
      .from("wholesale_accounts")
      .select(
        "id,business_name,trading_as,business_city,business_province,primary_contact_name,primary_contact_email,primary_contact_phone,approval_status,created_at,map_listing_opt_in,public_store_name,public_address,public_phone,public_latitude,public_longitude",
      )
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.status) query = query.eq("approval_status", data.status);
    if (data.q)
      query = query.or(
        `business_name.ilike.%${data.q}%,primary_contact_email.ilike.%${data.q}%,business_city.ilike.%${data.q}%`,
      );
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const { data: paid } = await db
      .from("wholesale_orders")
      .select("wholesale_account_id")
      .eq("payment_status", "paid");
    const paidIds = new Set((paid ?? []).map((p) => p.wholesale_account_id));

    return (rows ?? []).map((a) => ({
      ...a,
      hasPaidOrder: paidIds.has(a.id),
      listing: eligibility({ ...a, hasPaidOrder: paidIds.has(a.id) } as any),
    }));
  });

export const adminGetWholesaleAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const { data: account, error } = await db
      .from("wholesale_accounts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!account) return null;
    const { data: orders } = await db
      .from("wholesale_orders")
      .select("id,order_number,created_at,total_zar,payment_status,fulfillment_status")
      .eq("wholesale_account_id", data.id)
      .order("created_at", { ascending: false });
    const hasPaidOrder = (orders ?? []).some((o) => o.payment_status === "paid");
    return {
      account,
      orders: orders ?? [],
      hasPaidOrder,
      listing: eligibility({ ...(account as any), hasPaidOrder }),
    };
  });

/**
 * Suspend or reactivate wholesale access.
 *
 * Suspension flips `approval_status` to `suspended`; every protected wholesale
 * server function already requires `approved`, so protected pricing, the
 * catalogue and ordering stop immediately. Historical orders are untouched.
 */
export const adminSetAccountStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["suspend", "reactivate"]),
        reason: z.string().max(400).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const patch =
      data.action === "suspend"
        ? {
            approval_status: "suspended",
            suspended_at: new Date().toISOString(),
            suspension_reason: data.reason ?? null,
          }
        : {
            approval_status: "approved",
            approved_at: new Date().toISOString(),
            approved_by: context.userId,
            suspended_at: null,
            suspension_reason: null,
          };
    const { error } = await db.from("wholesale_accounts").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminSetAccountNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), internal_notes: z.string().max(4000).nullable() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const { error } = await db
      .from("wholesale_accounts")
      .update({ internal_notes: data.internal_notes })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ------------------------------------------------- curated stockist records */

export const adminListCuratedStockists = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin(context.userId);
    const { data, error } = await db
      .from("stockists")
      .select(
        "id,slug,name,address,unit,suburb,city,province,postal_code,phone,email,website,latitude,longitude,is_active,is_featured",
      )
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const CuratedSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  name: z.string().trim().min(2).max(200),
  address: z.string().trim().min(3).max(300),
  unit: z.string().max(80).nullable().optional(),
  suburb: z.string().max(120).nullable().optional(),
  city: z.string().trim().min(2).max(120),
  province: z.string().trim().min(2).max(120),
  postal_code: z.string().max(20).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  email: z.string().max(200).nullable().optional(),
  website: z.string().max(300).nullable().optional(),
  is_active: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

export const adminUpsertCuratedStockist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CuratedSchema.parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const { id, ...fields } = data;

    // Coordinates are derived server-side from the address; never client-supplied.
    const { addressKey, geocodeAddress } = await import("@/lib/geocode.server");
    let coords: { latitude: number | null; longitude: number | null } | null = null;
    let geocode: "skipped" | "ok" | "failed" | "unconfigured" = "skipped";

    let prevKey = "";
    let hadCoords = false;
    if (id) {
      const { data: prev } = await db
        .from("stockists")
        .select("address,city,province,postal_code,latitude,longitude")
        .eq("id", id)
        .maybeSingle();
      prevKey = addressKey([prev?.address, prev?.city, prev?.province, prev?.postal_code]);
      hadCoords = prev?.latitude != null && prev?.longitude != null;
    }
    const nextKey = addressKey([fields.address, fields.city, fields.province, fields.postal_code]);
    if (nextKey !== prevKey || !hadCoords) {
      const result = await geocodeAddress({
        address: fields.address,
        city: fields.city,
        province: fields.province,
        postalCode: fields.postal_code ?? null,
      });
      if (result.status === "ok") {
        coords = { latitude: result.latitude, longitude: result.longitude };
        geocode = "ok";
      } else if (result.status === "unconfigured") {
        geocode = "unconfigured";
      } else {
        geocode = "failed";
      }
    }

    const payload = { ...fields, ...(coords ?? {}) };
    if (id) {
      const { error } = await db.from("stockists").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const, id, geocode };
    }
    const { data: row, error } = await db.from("stockists").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true as const, id: row.id, geocode };
  });

export const adminSetCuratedStockistActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const { error } = await db.from("stockists").update({ is_active: data.is_active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Admin manual coordinate correction — validated, never taken from a stockist. */
export const adminSetCuratedCoordinates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        latitude: z.number().min(-90).max(90).nullable(),
        longitude: z.number().min(-180).max(180).nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const { error } = await db
      .from("stockists")
      .update({ latitude: data.latitude, longitude: data.longitude })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
