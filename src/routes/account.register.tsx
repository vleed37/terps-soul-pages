import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthCard, AuthField, authInputCls } from "@/components/account/AuthCard";
import { GoldButton } from "@/components/brand/GoldButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/account/register")({
  head: () => ({ meta: [{ title: "Terps — Create Account" }] }),
  component: RegisterPage,
});

function strength(pw: string): "Too short" | "Weak" | "Strong" {
  if (pw.length < 8) return "Too short";
  const score = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].reduce((a, r) => a + (r.test(pw) ? 1 : 0), 0);
  return score >= 3 ? "Strong" : "Weak";
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    dob: "",
  });
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const s = strength(form.password);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords don't match.");
    if (s === "Too short") return toast.error("Password must be at least 8 characters.");
    if (!terms) return toast.error("Please confirm you're 18+ and accept the terms.");

    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: {
          full_name: form.fullName,
          phone: form.phone || null,
          birthdate: form.dob || null,
          marketing_opt_in: marketing,
        },
      },
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to verify your account.");
    navigate({ to: "/account/login" });
  }

  return (
    <AuthCard
      label="CREATE ACCOUNT"
      title="Join us."
      subtitle="Faster checkout, order tracking, and the occasional flavor first."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField label="Full Name">
          <input className={authInputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
        </AuthField>
        <AuthField label="Email">
          <input className={authInputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </AuthField>
        <AuthField label="Password">
          <input className={authInputCls} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} />
          {form.password.length > 0 && (
            <span className="mt-1 block meta-xs" style={{ color: s === "Strong" ? "var(--accent-gold)" : "var(--text-tertiary)" }}>
              {s}
            </span>
          )}
        </AuthField>
        <AuthField label="Confirm Password">
          <input className={authInputCls} type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} required />
        </AuthField>
        <AuthField label="Phone (optional)">
          <input className={authInputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </AuthField>
        <AuthField label="Date of Birth">
          <input className={authInputCls} type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} required />
        </AuthField>
        <label className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
          <input type="checkbox" className="mt-1 accent-[color:var(--accent-gold)]" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          <span>I confirm I am 18+ and agree to the Terms of Sale and Privacy Policy.</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
          <input type="checkbox" className="mt-1 accent-[color:var(--accent-gold)]" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          <span>Send me drop alerts and flavor announcements.</span>
        </label>
        <GoldButton type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating…" : "Create Account"}
        </GoldButton>
      </form>
      <p className="mt-8 text-center font-display italic text-sm text-[color:var(--text-secondary)]">
        Already have an account?{" "}
        <Link to="/account/login" className="text-[color:var(--accent-gold)] hover:underline">
          Sign in →
        </Link>
      </p>
    </AuthCard>
  );
}
