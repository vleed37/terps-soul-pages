import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { GoldButton } from "@/components/brand/GoldButton";
import { AuthField, authInputCls } from "@/components/account/AuthCard";
import { getMyCustomer, updateMyCustomer } from "@/lib/account.functions";
import { deleteMyAccount } from "@/lib/account-delete.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/settings")({
  head: () => ({ meta: [{ title: "Terps — Settings" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchMe = useServerFn(getMyCustomer);
  const updateMe = useServerFn(updateMyCustomer);
  const deleteMe = useServerFn(deleteMyAccount);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });

  const [form, setForm] = useState({ full_name: "", phone: "", birthdate: "" });
  const [marketing, setMarketing] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (me) {
      setForm({
        full_name: me.full_name ?? "",
        phone: me.phone ?? "",
        birthdate: me.birthdate ?? "",
      });
      setMarketing(!!me.marketing_opt_in);
    }
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, [me]);

  async function savePersonal(e: React.FormEvent) {
    e.preventDefault();
    await updateMe({ data: form });
    qc.invalidateQueries({ queryKey: ["me"] });
    toast.success("Saved.");
  }

  async function saveMarketing(v: boolean) {
    setMarketing(v);
    await updateMe({ data: { marketing_opt_in: v } });
    toast.success(v ? "You'll hear from us." : "Marketing emails off.");
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const newEmail = fd.get("email") as string;
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return toast.error(error.message);
    toast.success("Check your new inbox to confirm.");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) return toast.error("Passwords don't match.");
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    if (error) return toast.error(error.message);
    setPw({ current: "", next: "", confirm: "" });
    toast.success("Password updated.");
  }

  async function doDelete() {
    await deleteMe();
    await supabase.auth.signOut();
    toast.success("Account deleted.");
    navigate({ to: "/" });
  }

  return (
    <div className="space-y-8">
      <div>
        <MetaLabel gold>ACCOUNT SETTINGS</MetaLabel>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Your details.</h1>
      </div>

      <Card label="PERSONAL INFORMATION">
        <form onSubmit={savePersonal} className="space-y-4">
          <AuthField label="Full Name"><input className={authInputCls} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></AuthField>
          <AuthField label="Phone"><input className={authInputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></AuthField>
          <AuthField label="Date of Birth"><input type="date" className={authInputCls} value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} /></AuthField>
          <GoldButton type="submit">Save Changes</GoldButton>
        </form>
      </Card>

      <Card label="EMAIL">
        <p className="mb-3 text-[color:var(--text-secondary)]">Current: {email}</p>
        <form onSubmit={changeEmail} className="flex flex-wrap gap-3">
          <input name="email" type="email" placeholder="new@email.com" className={authInputCls + " max-w-xs"} required />
          <GoldButton type="submit" variant="tertiary">Update Email</GoldButton>
        </form>
      </Card>

      <Card label="PASSWORD">
        <form onSubmit={changePassword} className="space-y-3 max-w-sm">
          <input type="password" placeholder="New password" className={authInputCls} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required minLength={8} />
          <input type="password" placeholder="Confirm new password" className={authInputCls} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
          <GoldButton type="submit" variant="tertiary">Change Password</GoldButton>
        </form>
      </Card>

      <Card label="MARKETING">
        <label className="flex items-center justify-between gap-3 text-[color:var(--text-secondary)]">
          <span>Drop alerts and flavor announcements</span>
          <input type="checkbox" checked={marketing} onChange={(e) => saveMarketing(e.target.checked)} className="h-5 w-5 accent-[color:var(--accent-gold)]" />
        </label>
        <label className="mt-3 flex items-center justify-between gap-3 text-[color:var(--text-tertiary)]">
          <span>Order updates and tracking</span>
          <input type="checkbox" checked disabled className="h-5 w-5 accent-[color:var(--accent-gold)]" />
        </label>
      </Card>

      <div className="rounded-[12px] border border-red-900/40 bg-[color:var(--bg-surface)] p-8">
        <span className="meta-xs text-red-400">DANGER ZONE</span>
        <Hairline className="my-4" />
        <p className="text-[color:var(--text-secondary)]">Delete your account permanently. This cannot be undone.</p>
        <button onClick={() => setConfirmDelete(true)} className="mt-4 meta-xs border border-red-400/40 px-5 py-3 text-red-400 hover:bg-red-400/10">
          DELETE ACCOUNT →
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setConfirmDelete(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-[12px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-elevated)] p-8">
            <h3 className="font-display text-2xl">Delete account?</h3>
            <p className="mt-3 text-[color:var(--text-secondary)]">
              This will permanently delete your account, order history, and saved details. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={doDelete} className="meta-xs flex-1 border border-red-400/40 px-5 py-3 text-red-400 hover:bg-red-400/10">DELETE PERMANENTLY</button>
              <GoldButton variant="tertiary" onClick={() => setConfirmDelete(false)}>Cancel</GoldButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
      <MetaLabel gold>{label}</MetaLabel>
      <Hairline className="my-4" />
      {children}
    </div>
  );
}
