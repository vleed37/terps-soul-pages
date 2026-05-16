import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthCard, AuthField, authInputCls } from "@/components/account/AuthCard";
import { GoldButton } from "@/components/brand/GoldButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/account/reset-password")({
  head: () => ({ meta: [{ title: "Terps — Set New Password" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== confirm) return toast.error("Passwords don't match.");
    if (pw.length < 8) return toast.error("Password must be at least 8 characters.");
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    navigate({ to: "/account" });
  }

  return (
    <AuthCard label="SET NEW PASSWORD" title="Almost there." subtitle="Choose a new password for your account.">
      {!ready ? (
        <p className="text-center text-sm text-[color:var(--text-secondary)]">
          Open the reset link from your email to continue.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthField label="New Password">
            <input className={authInputCls} type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} />
          </AuthField>
          <AuthField label="Confirm New Password">
            <input className={authInputCls} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </AuthField>
          <GoldButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Updating…" : "Update Password"}
          </GoldButton>
        </form>
      )}
    </AuthCard>
  );
}
