import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { AuthCard, AuthField, authInputCls } from "@/components/account/AuthCard";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/account/login")({
  head: () => ({ meta: [{ title: "Terps — Sign In" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/account",
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [magicMode, setMagicMode] = useState(false);

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!z.string().email().safeParse(email).success) {
      toast.error("Please enter a valid email.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: redirect });
  }

  async function onMagicSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${redirect}` },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your inbox for the sign-in link.");
  }

  return (
    <AuthCard
      label="SIGN IN"
      title="Welcome back."
      subtitle="Sign in to view your orders and saved details."
    >
      {!magicMode ? (
        <form onSubmit={onPasswordSubmit} className="space-y-5">
          <AuthField label="Email">
            <input className={authInputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </AuthField>
          <AuthField label="Password">
            <div className="relative">
              <input
                className={authInputCls + " pr-12"}
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </AuthField>
          <div className="text-right">
            <Link to="/account/forgot-password" className="font-display italic text-xs text-[color:var(--accent-gold)] hover:underline">
              FORGOT PASSWORD →
            </Link>
          </div>
          <GoldButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </GoldButton>
        </form>
      ) : (
        <form onSubmit={onMagicSubmit} className="space-y-5">
          <AuthField label="Email">
            <input className={authInputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </AuthField>
          <GoldButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Send Magic Link"}
          </GoldButton>
        </form>
      )}

      <div className="my-8 flex items-center gap-3">
        <Hairline className="flex-1" />
        <span className="meta-xs text-[color:var(--text-tertiary)]">OR</span>
        <Hairline className="flex-1" />
      </div>

      <GoldButton variant="secondary" type="button" className="w-full" onClick={() => setMagicMode((v) => !v)}>
        {magicMode ? "Use Password Instead" : "Email Me a Magic Link"}
      </GoldButton>

      <p className="mt-8 text-center font-display italic text-sm text-[color:var(--text-secondary)]">
        First time here?{" "}
        <Link to="/account/register" className="text-[color:var(--accent-gold)] hover:underline">
          Create an account →
        </Link>
      </p>
    </AuthCard>
  );
}
