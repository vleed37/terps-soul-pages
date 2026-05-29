import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
          if (wOrder.payment_status === "paid") return new Response("ok");
          const wStatus = (payload.status || payload.event || "").toLowerCase();
          const wPaid = ["paid", "success", "successful", "completed"].includes(wStatus);
          const wFailed = ["failed", "declined", "cancelled", "canceled"].includes(wStatus);
          if (wPaid) {
            await supabaseAdmin
              .from("wholesale_orders")
              .update({
                payment_status: "paid",
                fulfillment_status: "preparing",
                paid_at: new Date().toISOString(),
                bobpay_transaction_id: payload.transaction_id ?? null,
              })
              .eq("id", wOrder.id);
          } else if (wFailed) {
            await supabaseAdmin
              .from("wholesale_orders")
              .update({ payment_status: "failed" })
              .eq("id", wOrder.id);
          }
          return new Response("ok");
        }

        // Idempotent — if already paid, just ack
        if (order.payment_status === "paid") return new Response("ok");

        const status = (payload.status || payload.event || "").toLowerCase();
        const isPaid = ["paid", "success", "successful", "completed"].includes(status);
        const isFailed = ["failed", "declined", "cancelled", "canceled"].includes(status);

        if (isPaid) {
          await supabaseAdmin
            .from("orders")
            .update({
              payment_status: "paid",
              status: "confirmed",
              payment_completed_at: new Date().toISOString(),
              bobpay_transaction_id: payload.transaction_id ?? null,
            })
            .eq("id", order.id);

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

          // Email — graceful no-op if Resend not configured
          await maybeSendConfirmationEmail(order.order_number);
        } else if (isFailed) {
          await supabaseAdmin
            .from("orders")
            .update({ payment_status: "failed", status: "cancelled" })
            .eq("id", order.id);
        }

        return new Response("ok");
      },
    },
  },
});

async function maybeSendConfirmationEmail(orderNumber: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Terps <orders@terpsnation.co.za>";
  if (!apiKey) {
    console.warn(`RESEND_API_KEY not set — skipping confirmation email for ${orderNumber}`);
    return;
  }
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("guest_name, guest_email, total, order_number")
    .eq("order_number", orderNumber)
    .single();
  if (!order?.guest_email) return;

  const html = `
    <div style="background:#0d0d0d;color:#f5f0e0;font-family:'Manrope',sans-serif;padding:48px 24px;">
      <div style="max-width:560px;margin:0 auto;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:4px;padding:48px;">
        <h1 style="font-family:'Fraunces',serif;font-weight:400;color:#c9a84c;margin:0 0 8px;font-size:32px;">Order Confirmed</h1>
        <p style="color:#a0a0a0;margin:0 0 32px;font-size:14px;">${order.order_number}</p>
        <p style="color:#e8e8e8;line-height:1.6;">Thank you, ${order.guest_name}. Your order has been received and payment confirmed. We'll be in touch shortly with delivery details.</p>
        <p style="font-family:'Fraunces',serif;color:#c9a84c;font-size:28px;margin:32px 0 0;">R${Number(order.total).toFixed(0)}</p>
      </div>
    </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: order.guest_email,
        subject: `Terps — Order ${order.order_number} confirmed`,
        html,
      }),
    });
  } catch (e) {
    console.error("Resend email failed", e);
  }
}