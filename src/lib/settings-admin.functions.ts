import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ALL_SETTING_KEYS,
  IMAGE_SLOTS,
  business,
  deliveryConfig,
  legalReadiness,
  missingBusinessFields,
  missingImageSlots,
  missingShippingDecisions,
  vatStatus,
  type SettingsMap,
} from "@/lib/settings";

/** Admin gate + service-role client, loaded inside handlers only. */
async function admin(userId: string | undefined) {
  const [{ requireAdmin }, { supabaseAdmin }] = await Promise.all([
    import("@/lib/admin-auth.server"),
    import("@/integrations/supabase/client.server"),
  ]);
  await requireAdmin(userId);
  return supabaseAdmin;
}

/* ---------------------------------------------------------------- settings */

export const adminGetSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SettingsMap> => {
    const db = await admin(context.userId);
    const { data, error } = await db.from("app_config").select("key,value");
    if (error) throw new Error(error.message);
    const map: SettingsMap = {};
    for (const row of data ?? []) map[row.key] = row.value;
    return map;
  });

/**
 * Saves owner-supplied settings. Only known keys are accepted, and an empty
 * value deletes the row so the field goes back to "not supplied" rather than
 * pretending to be confirmed.
 */
export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        entries: z
          .array(z.object({ key: z.string().max(120), value: z.string().max(2000) }))
          .min(1)
          .max(60),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    const allowed = new Set(ALL_SETTING_KEYS);
    const rejected = data.entries.filter((e) => !allowed.has(e.key)).map((e) => e.key);
    if (rejected.length) return { ok: false as const, error: `Unknown setting: ${rejected[0]}` };

    const now = new Date().toISOString();
    const upserts = data.entries
      .filter((e) => e.value.trim() !== "")
      .map((e) => ({ key: e.key, value: e.value.trim(), updated_at: now }));
    const deletes = data.entries.filter((e) => e.value.trim() === "").map((e) => e.key);

    if (upserts.length) {
      const { error } = await db.from("app_config").upsert(upserts, { onConflict: "key" });
      if (error) throw new Error(error.message);
    }
    if (deletes.length) {
      const { error } = await db.from("app_config").delete().in("key", deletes);
      if (error) throw new Error(error.message);
    }
    return { ok: true as const, saved: upserts.length, cleared: deletes.length };
  });

/* ----------------------------------------------------------- content image */

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SLOT_KEYS = new Set<string>(IMAGE_SLOTS.map((s) => s.key));

/** Upload a site image (hero, stockist, box, social) into a settings slot. */
export const adminUploadContentImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        slot: z.string().max(80),
        contentType: z.string().max(80),
        dataBase64: z.string().min(16).max(12_000_000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    if (!SLOT_KEYS.has(data.slot)) return { ok: false as const, error: "Unknown image slot." };
    const ext = IMAGE_TYPES[data.contentType];
    if (!ext) return { ok: false as const, error: "Use a JPG, PNG, WebP or AVIF image." };

    const bytes = Buffer.from(data.dataBase64, "base64");
    if (bytes.byteLength === 0) return { ok: false as const, error: "That file appears to be empty." };
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return { ok: false as const, error: "Images must be 8 MB or smaller." };
    }

    const path = `site/${data.slot.replace(/[^a-z0-9_]/gi, "-")}/${Date.now()}.${ext}`;
    const { error: upErr } = await db.storage
      .from("product-images")
      .upload(path, bytes, { contentType: data.contentType, upsert: true });
    if (upErr) throw new Error(upErr.message);

    const url = `/api/public/product-image/${path}`;
    const { error } = await db
      .from("app_config")
      .upsert({ key: data.slot, value: url, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const, url };
  });

export const adminClearContentImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slot: z.string().max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin(context.userId);
    if (!SLOT_KEYS.has(data.slot)) return { ok: false as const, error: "Unknown image slot." };
    const { error } = await db.from("app_config").delete().eq("key", data.slot);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* ------------------------------------------------------- production status */

export type ReadyState = "ready" | "incomplete" | "needs_config" | "needs_client" | "needs_legal";

export interface ReadinessItem {
  label: string;
  state: ReadyState;
  detail: string;
}
export interface ReadinessGroup {
  group: string;
  items: ReadinessItem[];
}

/**
 * Real production-readiness state. Every line is derived from configuration,
 * data or environment — nothing is optimistically marked ready.
 */
export const adminReadiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReadinessGroup[]> => {
    const db = await admin(context.userId);

    const [cfgRes, strainsRes, wholesaleRes, tiersRes, stockistsRes, accountsRes, adminsRes, ordersRes] =
      await Promise.all([
        db.from("app_config").select("key,value"),
        db
          .from("strains")
          .select("id,slug,name,product_line,is_active,is_archived,stock_quantity,product_image_url"),
        db.from("wholesale_products").select("strain_id,wholesale_active,units_per_box,minimum_boxes"),
        db.from("wholesale_price_tiers").select("strain_id,min_boxes,max_boxes,price_per_box_zar"),
        db.from("stockists").select("id,name,is_active,latitude,longitude"),
        db
          .from("wholesale_accounts")
          .select("id,approval_status,map_listing_opt_in,public_latitude,public_longitude"),
        db.from("user_roles").select("user_id").eq("role", "admin"),
        db.from("wholesale_orders").select("wholesale_account_id,payment_status").eq("payment_status", "paid"),
      ]);

    const s: SettingsMap = {};
    for (const row of cfgRes.data ?? []) s[row.key] = row.value;

    const strains = strainsRes.data ?? [];
    const live = strains.filter((x) => x.is_active && !x.is_archived);
    const withImage = live.filter((x) => !!x.product_image_url);
    const caviar = live.filter((x) => x.product_line === "caviar_stix");
    const caviarWithImage = caviar.filter((x) => !!x.product_image_url);
    const wholesale = wholesaleRes.data ?? [];
    const tiers = tiersRes.data ?? [];
    const stockists = stockistsRes.data ?? [];
    const accounts = accountsRes.data ?? [];
    const paidAccountIds = new Set((ordersRes.data ?? []).map((o) => o.wholesale_account_id));

    const env = (name: string) => !!process.env[name];
    const bizFields = missingBusinessFields(s);
    const legal = legalReadiness(s);
    const ship = deliveryConfig(s);
    const b = business(s);
    const shipMissing = missingShippingDecisions(s);
    const imgMissing = missingImageSlots(s);
    const img = (key: string) => !!s[key];

    const yes = (label: string, detail: string): ReadinessItem => ({ label, state: "ready", detail });
    const cfg = (label: string, detail: string): ReadinessItem => ({ label, state: "needs_config", detail });
    const client = (label: string, detail: string): ReadinessItem => ({ label, state: "needs_client", detail });
    const partial = (label: string, detail: string): ReadinessItem => ({ label, state: "incomplete", detail });

    return [
      {
        group: "Infrastructure",
        items: [
          env("BOBPAY_MERCHANT_ID") && env("BOBPAY_API_KEY") && env("BOBPAY_API_URL")
            ? yes("Payment configured", "BobPay merchant credentials present.")
            : cfg("Payment configured", "BobPay merchant ID, API key and API URL are not all set."),
          env("BOBPAY_WEBHOOK_SECRET")
            ? partial(
                "Secure webhook configured",
                "A webhook secret is set and signature verification is active; unsigned calls are rejected. Confirm the stored value is BobPay's live secret and not the development placeholder.",
              )
            : cfg("Secure webhook configured", "Webhook secret missing — payment callbacks are refused (fails closed)."),
          cfg(
            "Paid-amount verification",
            "BobPay's confirmation currently reports only reference, transaction ID and status. Ask BobPay for the documented paid amount and currency fields (and where they appear in the signed payload) so the amount paid can be checked against the order total before an order is marked paid.",
          ),
          env("RESEND_API_KEY")
            ? yes("Transactional email configured", "Sending key present.")
            : cfg("Transactional email configured", "No email sending key — order and registration emails are skipped."),
          (adminsRes.data ?? []).length > 0
            ? yes("Admin account configured", `${(adminsRes.data ?? []).length} manager account(s).`)
            : cfg("Admin account configured", "No admin account is set up."),
        ],
      },
      {
        group: "Products",
        items: [
          live.length > 0
            ? yes("Active products", `${live.length} live product(s).`)
            : cfg("Active products", "No live products."),
          withImage.length === live.length && live.length > 0
            ? yes("Product images complete", "Every live product has its own photo.")
            : client(
                "Product images complete",
                `${live.length - withImage.length} of ${live.length} live products still need final photography.`,
              ),
          wholesale.filter((w) => w.wholesale_active).length >= live.length && live.length > 0
            ? yes("Wholesale configuration complete", "Every live product has trade box settings.")
            : partial(
                "Wholesale configuration complete",
                `${wholesale.filter((w) => w.wholesale_active).length} of ${live.length} live products are wholesale-active.`,
              ),
          tiers.length > 0 && tiers.every((t) => Number(t.price_per_box_zar) > 0)
            ? yes("Wholesale pricing valid", `${tiers.length} price tiers, all priced.`)
            : cfg("Wholesale pricing valid", "Trade price tiers are missing or unpriced."),
          live.every((x) => (x.stock_quantity ?? 0) > 0)
            ? yes("Stock configured", "All live products have stock on hand.")
            : partial(
                "Stock configured",
                `${live.filter((x) => (x.stock_quantity ?? 0) <= 0).length} live product(s) at zero stock.`,
              ),
        ],
      },
      {
        group: "Stockists",
        items: [
          stockists.filter((x) => x.is_active).length > 0
            ? yes("Real stockists loaded", `${stockists.filter((x) => x.is_active).length} active location(s).`)
            : client("Real stockists loaded", "No real stockist locations supplied yet."),
          stockists.filter((x) => x.is_active).length === 0
            ? yes("Placeholder stockists inactive", `${stockists.length} placeholder record(s) remain deactivated.`)
            : partial("Placeholder stockists inactive", "Confirm every active location is a real store."),
          env("GEOCODING_API_KEY") || (env("LOVABLE_API_KEY") && env("GOOGLE_MAPS_API_KEY"))
            ? yes("Geocoding configured", "Addresses convert to map pins automatically.")
            : cfg("Geocoding configured", "No mapping credential — pins must be positioned manually."),
          stockists.some((x) => x.is_active) ||
          accounts.some(
            (a) => a.approval_status === "approved" && a.map_listing_opt_in && paidAccountIds.has(a.id),
          )
            ? yes("Public finder ready", "The finder has at least one genuine public listing.")
            : client("Public finder ready", "Finder honestly shows an empty state until real stores are listed."),
        ],
      },
      {
        group: "Shipping",
        items: [
          ship.confirmed
            ? yes("Delivery pricing confirmed", "Owner has signed off the delivery model.")
            : client("Delivery pricing confirmed", "Rates in use are proposals and are not advertised publicly."),
          ship.retailFee > 0 || ship.freeEnabled
            ? (ship.confirmed ? yes : client)("Retail delivery configured", `Retail fee R${ship.retailFee}.`)
            : cfg("Retail delivery configured", "No retail delivery fee set."),
          ship.wholesaleFee > 0
            ? (ship.confirmed ? yes : client)("Wholesale delivery configured", `Trade fee R${ship.wholesaleFee}.`)
            : cfg("Wholesale delivery configured", "No wholesale delivery fee set."),
          ship.courier
            ? yes("Courier / provider confirmed", ship.courier)
            : client("Courier / provider confirmed", "No courier chosen; checkout stays provider-agnostic."),
          b.standardDeliveryEstimate && b.processingTime && ship.confirmed
            ? yes("Delivery estimates confirmed", `${b.processingTime} · ${b.standardDeliveryEstimate}`)
            : client(
                "Delivery estimates confirmed",
                shipMissing.length ? shipMissing.join("; ") : "Estimates await sign-off.",
              ),
        ],
      },
      {
        group: "Legal & business",
        items: [
          b.legalEntityName
            ? yes("Legal entity supplied", b.legalEntityName)
            : client("Legal entity supplied", "Registered entity name outstanding."),
          b.registrationNumber
            ? yes("Registration details supplied", b.registrationNumber)
            : client("Registration details supplied", "Company registration number outstanding."),
          vatStatus(s) === "tbc"
            ? client("VAT status confirmed", "VAT registration status still to be confirmed.")
            : yes(
                "VAT status confirmed",
                vatStatus(s) === "registered"
                  ? `VAT registered${b.vatNumber ? ` · ${b.vatNumber}` : " (number outstanding)"}`
                  : "Not VAT registered — no VAT is added.",
              ),
          b.address
            ? yes("Business address supplied", b.address)
            : client("Business address supplied", "Registered address outstanding."),
          b.phone && b.privacyEmail && b.shippingEmail && b.refundEmail
            ? yes("Contact details supplied", "Phone and policy inboxes in place.")
            : client("Contact details supplied", "Phone or policy contact addresses outstanding."),
          b.returnNotificationPeriod
            ? yes("Returns period supplied", b.returnNotificationPeriod)
            : client("Returns period supplied", "Returns notification window outstanding."),
          legal.fieldsComplete
            ? yes("Legal fields complete", "Every required legal/business field is supplied.")
            : client("Legal fields complete", `${bizFields.length} field(s) outstanding: ${bizFields.join("; ")}`),
          legal.reviewApproved
            ? yes("Legal review approved", "Recorded as reviewed and approved.")
            : { label: "Legal review approved", state: "needs_legal" as ReadyState, detail: "No legal sign-off recorded. Policies show a draft notice." },
        ],
      },
      {
        group: "Content & imagery",
        items: [
          img("image.home_hero")
            ? yes("Homepage hero final", "Final hero supplied.")
            : client("Homepage hero final", "Temporary hero still in use."),
          img("image.home_stockist")
            ? yes("Stockist imagery final", "Final stockist visual supplied.")
            : client("Stockist imagery final", "Client asked for a more professional retail image."),
          withImage.length === live.length && live.length > 0
            ? yes("Product photography complete", "All products photographed.")
            : client(
                "Product photography complete",
                `Still needed: ${live.filter((x) => !x.product_image_url).map((x) => x.name).join(", ") || "—"}`,
              ),
          caviar.length > 0 && caviarWithImage.length === caviar.length
            ? yes("Caviar photography complete", "Each Caviar Stick SKU has its own photo.")
            : client(
                "Caviar photography complete",
                `Still needed: ${caviar.filter((x) => !x.product_image_url).map((x) => x.name).join(", ") || "—"}`,
              ),
          img("image.box_pre_roll") &&
          img("image.box_caviar") &&
          img("image.variety_box_pre_roll") &&
          img("image.variety_box_caviar")
            ? yes("Box photography complete", "Full-box and variety-box shots supplied.")
            : client(
                "Box photography complete",
                [
                  !img("image.box_pre_roll") && "Infused Pre-Roll full box",
                  !img("image.box_caviar") && "Caviar Sticks full box",
                  !img("image.variety_box_pre_roll") && "Infused Pre-Roll variety box",
                  !img("image.variety_box_caviar") && "Caviar Sticks variety box",
                ]
                  .filter(Boolean)
                  .join(", "),
              ),
          img("image.og_default")
            ? yes("Social sharing image complete", "Branded share image supplied.")
            : client("Social sharing image complete", "Using the generic fallback share image."),
        ],
      },
      {
        group: "Outstanding image slots",
        items:
          imgMissing.length === 0
            ? [yes("All image slots supplied", "Nothing outstanding.")]
            : imgMissing.map((label) => client(label, "Awaiting final photography.")),
      },
    ];
  });
