import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/wholesale-approval-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.WHOLESALE_APPROVAL_WEBHOOK_SECRET;
        if (!secret) {
          console.error("WHOLESALE_APPROVAL_WEBHOOK_SECRET not configured");
          return new Response("Server misconfigured", { status: 500 });
        }
        const provided = request.headers.get("x-webhook-secret") || "";
        if (provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: { account_id?: string };
        try {
          payload = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const accountId = payload.account_id;
        if (!accountId) return new Response("Missing account_id", { status: 400 });

        const { data: acct, error } = await supabaseAdmin
          .from("wholesale_accounts")
          .select("id, business_name, primary_contact_name, primary_contact_email, approval_status")
          .eq("id", accountId)
          .maybeSingle();
        if (error) return new Response(error.message, { status: 500 });
        if (!acct) return new Response("Account not found", { status: 404 });
        if (acct.approval_status !== "approved") {
          // Trigger may re-fire on unrelated updates; ack silently.
          return new Response("ok");
        }

        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.RESEND_FROM_EMAIL || "Terps <orders@terpnation.co.za>";
        if (!apiKey) {
          console.warn(
            `RESEND_API_KEY not set — skipping approval email for ${acct.business_name}`,
          );
          return new Response("ok");
        }

        const siteUrl = process.env.PUBLIC_SITE_URL || "https://terps-soul-pages.lovable.app";
        const loginUrl = `${siteUrl.replace(/\/$/, "")}/wholesale/login`;
        const html = welcomeHtml(acct.business_name, acct.primary_contact_name, loginUrl);

        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from,
              to: acct.primary_contact_email,
              subject: "Welcome to the Terps Stockist Program",
              html,
            }),
          });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error("Resend approval email failed", res.status, text);
            return new Response("Email send failed", { status: 500 });
          }
        } catch (e) {
          console.error("Resend approval email threw", e);
          return new Response("Email send error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});

function welcomeHtml(businessName: string, contactName: string, loginUrl: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Welcome to Terps</title></head>
<body style="margin:0;padding:0;background:#FAF7F0;font-family:'Manrope',Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <div style="background:#FFFDF8;border:1px solid #e8e1d0;border-radius:8px;padding:48px 40px;">
      <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#7a8a6a;margin:0 0 24px;">✦ Stockist Program</p>
      <h1 style="font-family:'Fraunces',Georgia,serif;font-weight:400;font-size:34px;line-height:1.15;margin:0 0 20px;color:#1a1a1a;">
        Welcome, ${escapeHtml(businessName)}.
      </h1>
      <p style="font-size:15px;line-height:1.65;color:#3a3a3a;margin:0 0 18px;">
        ${escapeHtml(contactName ? contactName + "," : "")} your application to become a Terps stockist has been approved.
      </p>
      <p style="font-size:15px;line-height:1.65;color:#3a3a3a;margin:0 0 32px;">
        You can now sign in to your stockist portal to browse the wholesale catalog, place box orders, and manage your account.
      </p>
      <p style="margin:0 0 36px;">
        <a href="${loginUrl}" style="display:inline-block;background:#5a6f4a;color:#FAF7F0;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;">
          Sign in to portal
        </a>
      </p>
      <hr style="border:none;border-top:1px solid #e8e1d0;margin:32px 0;">
      <p style="font-size:13px;line-height:1.6;color:#666;margin:0 0 12px;">
        Questions? Reply to this email or reach out at
        <a href="mailto:sales@terpnation.co.za" style="color:#5a6f4a;text-decoration:underline;">sales@terpnation.co.za</a>.
      </p>
      <p style="font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:15px;color:#3a3a3a;margin:24px 0 0;">
        Welcome to the network. — The Terps Team
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#999;margin:24px 0 0;letter-spacing:0.08em;">TERPS · CAPE TOWN</p>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c] as string);
}