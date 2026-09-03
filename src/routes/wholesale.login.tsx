import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { AuthCard, AuthField, authInputCls } from "@/components/account/AuthCard";
import { GoldButton } from "@/components/brand/GoldButton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/wholesale/login")({
  head: () => ({ meta: [{ title: "Terps — Stockist Sign In" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/wholesale/dashboard",
  }),
  component: WholesaleLoginPage,
});

function WholesaleLoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!z.string().email().safeParse(email).success) {
      toast.error("Please enter a valid email.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    navigate({ to: redirect });
  }

  return (
    <AuthCard label="STOCKIST PORTAL" title="Welcome back." subtitle="Sign in to your stockist account.">
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField label="Work email">
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
      <p className="mt-8 text-center font-display italic text-sm text-[color:var(--text-secondary)]">
        Not a stockist yet?{" "}
        <Link to="/wholesale" className="text-[color:var(--accent-gold)] hover:underline">
          Apply now →
        </Link>
      </p>
    </AuthCard>
  );
}