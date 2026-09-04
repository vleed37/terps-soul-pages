/**
 * Single outbound email path. Server-only.
 *
 * Every send is loud: a missing RESEND_API_KEY logs a warning naming the email
 * type and the recipient and returns { sent: false, reason: "missing_api_key" }.
 * Callers decide what to do with that — nothing silently pretends to succeed.
 */

export type EmailFailureReason =
  | "missing_api_key"
  | "provider_error"
  | "network_error"
  | "no_recipient";

export type EmailResult =
  | { sent: true }
  | { sent: false; reason: EmailFailureReason; detail?: string };

export const DEFAULT_FROM = "Terps <orders@terpnation.co.za>";

export function emailFrom(): string {
  return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
}

export async function sendEmail(opts: {
  /** Short label for the logs, e.g. "stockist-welcome", "retail-order-confirmation". */
  type: string;
  to: string | null | undefined;
  subject: string;
  html: string;
  from?: string;
}): Promise<EmailResult> {
  const { type, to, subject, html } = opts;
  const recipient = (to ?? "").trim();

  if (!recipient) {
    console.warn(`[email] SKIPPED ${type} — no recipient address`);
    return { sent: false, reason: "no_recipient" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email] SKIPPED ${type} to ${recipient} — RESEND_API_KEY not set`);
    return { sent: false, reason: "missing_api_key" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from ?? emailFrom(),
        to: recipient,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email] FAILED ${type} to ${recipient} — ${res.status} ${body}`);
      return { sent: false, reason: "provider_error", detail: `${res.status} ${body}` };
    }
    console.log(`[email] SENT ${type} to ${recipient}`);
    return { sent: true };
  } catch (e) {
    console.error(`[email] FAILED ${type} to ${recipient} — ${String(e)}`);
    return { sent: false, reason: "network_error", detail: String(e) };
  }
}

export function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );
}
