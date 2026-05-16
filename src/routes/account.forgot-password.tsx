import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthCard, AuthField, authInputCls } from "@/components/account/AuthCard";
import { GoldButton } from "@/components/brand/GoldButton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/forgot-password")({
  head: () => ({ meta: [{ title: "Terps — Forgot Password" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });
    setSubmitting(false);
    setSent(true);
  }

  return (
    <AuthCard label="FORGOT PASSWORD" title="Let's get you back in." subtitle="Enter your email and we'll send a reset link.">
      {sent ? (
        <p className="text-center text-sm text-[color:var(--text-secondary)]">
          Check your inbox. If an account exists for <span className="text-[color:var(--text-primary)]">{email}</span>, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthField label="Email">
            <input className={authInputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </AuthField>
          <GoldButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Send Reset Link"}
          </GoldButton>
        </form>
      )}
      <p className="mt-8 text-center font-display italic text-sm text-[color:var(--text-secondary)]">
        <Link to="/account/login" className="text-[color:var(--accent-gold)] hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
