import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoldButton } from "@/components/brand/GoldButton";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { updateMyWholesaleAccount } from "@/lib/wholesale.functions";

type Account = {
  business_name?: string | null;
  trading_as?: string | null;
  business_type?: string | null;
  vat_number?: string | null;
  cipc_registration_number?: string | null;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  primary_contact_phone?: string | null;
  business_address_line_1?: string | null;
  business_address_line_2?: string | null;
  business_city?: string | null;
  business_province?: string | null;
  business_postal_code?: string | null;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null | undefined;
}

export function UpdateAccountModal({ open, onOpenChange, account }: Props) {
  const qc = useQueryClient();
  const update = useServerFn(updateMyWholesaleAccount);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    primary_contact_name: "",
    primary_contact_email: "",
    primary_contact_phone: "",
    business_address_line_1: "",
    business_address_line_2: "",
    business_city: "",
    business_province: "",
    business_postal_code: "",
  });

  useEffect(() => {
    if (open && account) {
      setForm({
        primary_contact_name: account.primary_contact_name ?? "",
        primary_contact_email: account.primary_contact_email ?? "",
        primary_contact_phone: account.primary_contact_phone ?? "",
        business_address_line_1: account.business_address_line_1 ?? "",
        business_address_line_2: account.business_address_line_2 ?? "",
        business_city: account.business_city ?? "",
        business_province: account.business_province ?? "",
        business_postal_code: account.business_postal_code ?? "",
      });
    }
  }, [open, account]);

  const onChange =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await update({ data: form });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["wholesale-account"] }),
        qc.invalidateQueries({ queryKey: ["wholesale-account-me"] }),
      ]);
      toast.success("✓ Details updated.");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-0">
        <form onSubmit={onSubmit}>
          <DialogHeader className="px-8 pt-8">
            <MetaLabel gold>✦ Account Details</MetaLabel>
            <DialogTitle className="mt-3 font-display text-3xl font-normal text-[color:var(--text-primary)]">
              Your details.
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto px-8 py-6">
            <section>
              <p className="meta-xs text-[color:var(--text-tertiary)]">Editable</p>
              <Hairline className="my-3" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Primary contact name" value={form.primary_contact_name} onChange={onChange("primary_contact_name")} required />
                <Field label="Email" type="email" value={form.primary_contact_email} onChange={onChange("primary_contact_email")} required />
                <Field label="Phone" value={form.primary_contact_phone} onChange={onChange("primary_contact_phone")} required />
                <div className="hidden md:block" />
                <Field label="Address line 1" value={form.business_address_line_1} onChange={onChange("business_address_line_1")} required className="md:col-span-2" />
                <Field label="Address line 2" value={form.business_address_line_2} onChange={onChange("business_address_line_2")} className="md:col-span-2" />
                <Field label="City" value={form.business_city} onChange={onChange("business_city")} required />
                <Field label="Province" value={form.business_province} onChange={onChange("business_province")} required />
                <Field label="Postal code" value={form.business_postal_code} onChange={onChange("business_postal_code")} />
              </div>
            </section>

            <section className="mt-8">
              <p className="meta-xs text-[color:var(--text-tertiary)]">Locked</p>
              <Hairline className="my-3" />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ReadOnly label="Business name" value={account?.business_name} />
                <ReadOnly label="Trading as" value={account?.trading_as} />
                <ReadOnly label="Business type" value={account?.business_type} />
                <ReadOnly label="VAT number" value={account?.vat_number} />
                <ReadOnly label="CIPC registration number" value={account?.cipc_registration_number} className="md:col-span-2" />
              </div>
              <p className="mt-4 text-xs italic text-[color:var(--text-tertiary)]">
                Business identity is locked once approved. Contact us if any of these change.
              </p>
            </section>
          </div>

          <div className="flex items-center justify-end gap-6 border-t border-[color:var(--border-subtle)] px-8 py-5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="ghost-link text-sm"
              disabled={saving}
            >
              Cancel
            </button>
            <GoldButton type="submit" variant="dark" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </GoldButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="meta-xs text-[color:var(--text-tertiary)]">
        {label}
        {required ? "" : " (optional)"}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-base)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--accent-gold)] focus:outline-none"
      />
    </label>
  );
}

function ReadOnly({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="meta-xs text-[color:var(--text-tertiary)]">{label}</p>
      <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{value || "—"}</p>
    </div>
  );
}