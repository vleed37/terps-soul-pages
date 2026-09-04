import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SALES_EMAIL } from "@/lib/brand";
export const Route = createFileRoute("/api/public/bobpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.BOBPAY_WEBHOOK_SECRET;
        const body = await request.text();

        if (secret) {
          const sig = request.headers.get("x-bobpay-signature") || "";
          const expected = createHmac("sha256", secret).update(body).digest("hex");
          const a = Buffer.from(sig);
          const b = Buffer.from(expected);
          if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return new Response("Invalid signature", { status: 401 });
          }
        } else {
          console.warn("BOBPAY_WEBHOOK_SECRET not configured — accepting webhook unverified");
        }

        let payload: {
          reference?: string;
          transaction_id?: string;
          status?: string;
          event?: string;
        };
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const reference = payload.reference;
        if (!reference) return new Response("Missing reference", { status: 400 });

        // Try retail orders first
        const { data: order, error } = await supabaseAdmin
          .from("orders")
          .select("id, order_number, payment_status, status")
          .eq("order_number", reference)
          .maybeSingle();
        if (error) return new Response(error.message, { status: 500 });

        if (!order) {
          // Fallback: wholesale order
          const { data: wOrder } = await supabaseAdmin
            .from("wholesale_orders")
            .select("id, order_number, payment_status")
            .eq("order_number", reference)
            .maybeSingle();
          if (!wOrder) return new Response("Order not found", { status: 404 });

          // Idempotency guard — a repeat delivery does nothing at all: no update,
          // no stock movement, no email.
          if (wOrder.payment_status === "paid") {
            return json200({ ok: true, duplicate: true });
          }

          const wStatus = (payload.status || payload.event || "").toLowerCase();
          const wPaid = ["paid", "success", "successful", "completed"].includes(wStatus);
          const wFailed = ["failed", "declined", "cancelled", "canceled"].includes(wStatus);

          if (wPaid) {
            const { error: wUpErr } = await supabaseAdmin
              .from("wholesale_orders")
              .update({
                payment_status: "paid",
                fulfillment_status: "preparing",
                paid_at: new Date().toISOString(),
                bobpay_transaction_id: payload.transaction_id ?? null,
              })
              .eq("id", wOrder.id);
            if (wUpErr) {
              console.error(`[bobpay] failed to mark wholesale order ${wOrder.order_number} paid — ${wUpErr.message}`);
              return new Response(wUpErr.message, { status: 500 });
            }

            const emails = await sendWholesaleOrderEmails(wOrder.id, payload.transaction_id ?? null);
            return json200({ ok: true, emails });
          }


          if (wFailed) {
            await supabaseAdmin
              .from("wholesale_orders")
              .update({ payment_status: "failed" })
              .eq("id", wOrder.id);
          }
          return json200({ ok: true });
        }

        // Idempotency guard — already paid means a duplicate webhook: ack only.
        if (order.payment_status === "paid") {
          return json200({ ok: true, duplicate: true });
        }

        const status = (payload.status || payload.event || "").toLowerCase();
        const isPaid = ["paid", "success", "successful", "completed"].includes(status);
        const isFailed = ["failed", "declined", "cancelled", "canceled"].includes(status);

        if (isPaid) {
          // Must succeed — if it fails the idempotency guard above can never
          // fire and a repeat webhook would double-decrement stock.
          const { error: upErr } = await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "paid",
              // status check constraint: pending | paid | fulfilling | shipped | delivered | cancelled | refunded
              status: "paid",
              payment_completed_at: new Date().toISOString(),
              bobpay_transaction_id: payload.transaction_id ?? null,
            })
            .eq("id", order.id);
          if (upErr) {
            console.error(`[bobpay] failed to mark order ${order.order_number} paid — ${upErr.message}`);
            return new Response(upErr.message, { status: 500 });
          }


          // Decrement stock
          const { data: items } = await supabaseAdmin
            .from("order_items")
            .select("strain_id, quantity")
            .eq("order_id", order.id);
          for (const it of items ?? []) {
            if (it.strain_id) {
              await supabaseAdmin.rpc("decrement_stock", {
                p_strain_id: it.strain_id,
                p_qty: it.quantity,
              });
            }
          }

          const emails = await sendRetailOrderEmails(order.id, payload.transaction_id ?? null);
          return json200({ ok: true, emails });
        }

        if (isFailed) {
          await supabaseAdmin
            .from("orders")
            .update({ payment_status: "failed", status: "cancelled" })
            .eq("id", order.id);
        }

        return json200({ ok: true });
      },
    },
  },
});

/** Always 200 to BobPay — an email problem must never trigger a payment retry. */
function json200(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------- retail

async function sendRetailOrderEmails(orderId: string, transactionId: string | null) {
  const { sendEmail, escapeHtml } = await import("@/lib/email.server");

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select(
      "order_number, guest_name, guest_email, guest_phone, total, delivery_fee, subtotal, delivery_address, bobpay_reference",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { customer: { sent: false, reason: "no_recipient" }, internal: { sent: false, reason: "no_recipient" } };

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("strain_name, quantity, line_total")
    .eq("order_id", orderId);

  const name = order.guest_name ?? "there";
  const rows = (items ?? [])
    .map(
      (it) =>
        `<tr><td style="padding:6px 12px 6px 0;">${escapeHtml(it.strain_name)}</td><td style="padding:6px 0;">× ${it.quantity}</td><td style="padding:6px 0 6px 12px;text-align:right;">R${Number(it.line_total).toFixed(0)}</td></tr>`,
    )
    .join("");

  const customerHtml = `
    <div style="background:#0d0d0d;color:#f5f0e0;font-family:'Manrope',sans-serif;padding:48px 24px;">
      <div style="max-width:560px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;padding:48px;">
        <h1 style="font-family:'Fraunces',serif;font-weight:400;color:#c9a84c;margin:0 0 8px;font-size:32px;">Order Confirmed</h1>
        <p style="color:#a0a0a0;margin:0 0 32px;font-size:14px;">${escapeHtml(order.order_number)}</p>
        <p style="color:#e8e8e8;line-height:1.6;">Thank you, ${escapeHtml(name)}. Your order has been received and payment confirmed. We'll be in touch shortly with delivery details.</p>
        <table style="width:100%;color:#e8e8e8;font-size:14px;margin:24px 0 0;border-collapse:collapse;">${rows}</table>
        <p style="font-family:'Fraunces',serif;color:#c9a84c;font-size:28px;margin:32px 0 0;">R${Number(order.total).toFixed(0)}</p>
      </div>
    </div>`;

  const customer = await sendEmail({
    type: "retail-order-confirmation",
    to: order.guest_email,
    subject: `Terps — Order ${order.order_number} confirmed`,
    html: customerHtml,
  });

  const internal = await sendEmail({
    type: "internal-new-order-retail",
    to: SALES_EMAIL,
    subject: `New retail order #${order.order_number} — ${name}`,
    html: internalHtml({
      kind: "Retail",
      orderNumber: order.order_number,
      name,
      email: order.guest_email ?? "—",
      phone: order.guest_phone ?? "—",
      itemRows: rows,
      address: formatAddress(order.delivery_address),
      total: Number(order.total),
      reference: order.bobpay_reference ?? order.order_number,
      transactionId: transactionId,
      escapeHtml,
    }),
  });

  return { customer, internal };
}

// ------------------------------------------------------------- wholesale

async function sendWholesaleOrderEmails(orderId: string, transactionId: string | null) {
  const { sendEmail, escapeHtml } = await import("@/lib/email.server");

  const { data: order } = await supabaseAdmin
    .from("wholesale_orders")
    .select(
      "order_number, total_zar, subtotal_zar, vat_zar, shipping_zar, shipping_address, wholesale_account_id, bobpay_transaction_id",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) {
    return {
      stockist: { sent: false, reason: "no_recipient" },
      internal: { sent: false, reason: "no_recipient" },
    };
  }

  const { data: acct } = await supabaseAdmin
    .from("wholesale_accounts")
    .select("business_name, trading_as, primary_contact_name, primary_contact_email, primary_contact_phone")
    .eq("id", order.wholesale_account_id)
    .maybeSingle();

  const { data: items } = await supabaseAdmin
    .from("wholesale_order_items")
    .select("strain_name, boxes_ordered, total_units, line_total_zar")
    .eq("wholesale_order_id", orderId);

  const displayName = acct?.trading_as || acct?.business_name || "Stockist";
  const rows = (items ?? [])
    .map(
      (it) =>
        `<tr><td style="padding:6px 12px 6px 0;">${escapeHtml(it.strain_name)}</td><td style="padding:6px 0;">${it.boxes_ordered} box${it.boxes_ordered === 1 ? "" : "es"} (${it.total_units} units)</td><td style="padding:6px 0 6px 12px;text-align:right;">R${Number(it.line_total_zar).toFixed(0)}</td></tr>`,
    )
    .join("");

  const stockistHtml = `
    <div style="background:#0d0d0d;color:#f5f0e0;font-family:'Manrope',sans-serif;padding:48px 24px;">
      <div style="max-width:560px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;padding:48px;">
        <h1 style="font-family:'Fraunces',serif;font-weight:400;color:#c9a84c;margin:0 0 8px;font-size:32px;">Order Confirmed</h1>
        <p style="color:#a0a0a0;margin:0 0 32px;font-size:14px;">${escapeHtml(order.order_number)}</p>
        <p style="color:#e8e8e8;line-height:1.6;">Thank you, ${escapeHtml(displayName)}. Your wholesale order has been received and payment confirmed. We're preparing it now and will send tracking details as soon as it ships.</p>
        <table style="width:100%;color:#e8e8e8;font-size:14px;margin:24px 0 0;border-collapse:collapse;">${rows}</table>
        <p style="color:#a0a0a0;font-size:13px;margin:16px 0 0;">Subtotal R${Number(order.subtotal_zar).toFixed(0)} · Delivery R${Number(order.shipping_zar).toFixed(0)} · VAT R${Number(order.vat_zar).toFixed(0)}</p>
        <p style="font-family:'Fraunces',serif;color:#c9a84c;font-size:28px;margin:24px 0 0;">R${Number(order.total_zar).toFixed(0)}</p>
      </div>
    </div>`;

  const stockist = await sendEmail({
    type: "wholesale-order-confirmation",
    to: acct?.primary_contact_email,
    subject: `Terps — Order ${order.order_number} confirmed`,
    html: stockistHtml,
  });

  const internal = await sendEmail({
    type: "internal-new-order-wholesale",
    to: SALES_EMAIL,
    subject: `New wholesale order #${order.order_number} — ${displayName}`,
    html: internalHtml({
      kind: "Wholesale",
      orderNumber: order.order_number,
      name: `${displayName}${acct?.primary_contact_name ? ` (${acct.primary_contact_name})` : ""}`,
      email: acct?.primary_contact_email ?? "—",
      phone: acct?.primary_contact_phone ?? "—",
      itemRows: rows,
      address: formatAddress(order.shipping_address),
      total: Number(order.total_zar),
      reference: order.order_number,
      transactionId: transactionId ?? order.bobpay_transaction_id ?? null,
      escapeHtml,
    }),
  });

  return { stockist, internal };
}

// ---------------------------------------------------------------- shared

function internalHtml(o: {
  kind: "Retail" | "Wholesale";
  orderNumber: string;
  name: string;
  email: string;
  phone: string;
  itemRows: string;
  address: string;
  total: number;
  reference: string;
  transactionId: string | null;
  escapeHtml: (s: unknown) => string;
}) {
  const e = o.escapeHtml;
  return `
    <div style="font-family:'Manrope',Helvetica,Arial,sans-serif;background:#FAF7F0;padding:32px 20px;color:#1a1a1a;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e1d0;border-radius:6px;padding:32px;">
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a8a6a;margin:0 0 12px;">${e(o.kind)} order · paid</p>
        <h1 style="font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:26px;margin:0 0 4px;">${e(o.orderNumber)}</h1>
        <p style="font-size:15px;margin:0 0 20px;">${e(o.name)}</p>
        <table style="font-size:14px;line-height:1.6;margin:0 0 20px;">
          <tr><td style="padding-right:12px;color:#666;">Email</td><td><a href="mailto:${e(o.email)}" style="color:#5a6f4a;">${e(o.email)}</a></td></tr>
          <tr><td style="padding-right:12px;color:#666;">Phone</td><td>${e(o.phone)}</td></tr>
          <tr><td style="padding-right:12px;color:#666;">Payment ref</td><td>${e(o.reference)}</td></tr>
          <tr><td style="padding-right:12px;color:#666;">BobPay txn</td><td>${e(o.transactionId ?? "—")}</td></tr>
        </table>
        <table style="width:100%;font-size:14px;border-collapse:collapse;border-top:1px solid #e8e1d0;border-bottom:1px solid #e8e1d0;">${o.itemRows}</table>
        <p style="font-family:'Fraunces',Georgia,serif;font-size:24px;margin:16px 0 24px;">Total paid R${o.total.toFixed(0)}</p>
        <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7a8a6a;margin:0 0 6px;">Delivery address</p>
        <p style="font-size:14px;line-height:1.6;margin:0;white-space:pre-line;">${e(o.address)}</p>
      </div>
    </div>`;
}

function formatAddress(addr: unknown): string {
  if (!addr || typeof addr !== "object") return "—";
  const a = addr as Record<string, unknown>;
  const parts = [
    a.line1 ?? a.street_address,
    a.line2 ?? a.unit,
    a.suburb,
    a.city,
    a.province,
    a.postal_code ?? a.postalCode,
    a.country,
  ]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
  return parts.length ? parts.join("\n") : "—";
}
