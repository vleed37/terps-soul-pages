import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { GoldButton } from "@/components/brand/GoldButton";
import { authInputCls, AuthField } from "@/components/account/AuthCard";
import { listMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/lib/account.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/addresses")({
  head: () => ({ meta: [{ title: "Terps — Addresses" }] }),
  component: AddressesPage,
});

const PROVINCES = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Free State","Mpumalanga","Limpopo","North West","Northern Cape"];

type AddressRow = {
  id: string;
  label: string | null;
  full_name: string | null;
  phone: string | null;
  street_address: string;
  unit: string | null;
  suburb: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  is_default: boolean | null;
};

function AddressesPage() {
  const qc = useQueryClient();
  const list = useServerFn(listMyAddresses);
  const create = useServerFn(createAddress);
  const update = useServerFn(updateAddress);
  const del = useServerFn(deleteAddress);
  const setDef = useServerFn(setDefaultAddress);

  const { data: addresses = [] } = useQuery({ queryKey: ["addresses"], queryFn: () => list() });
  const [editing, setEditing] = useState<AddressRow | null>(null);
  const [open, setOpen] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["addresses"] });

  const saveMut = useMutation({
    mutationFn: async (data: any) => {
      if (editing) return update({ data: { id: editing.id, ...data } });
      return create({ data });
    },
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setEditing(null);
      toast.success("Saved.");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  return (
    <div>
      <MetaLabel gold>DELIVERY ADDRESSES</MetaLabel>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Your saved addresses.</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {addresses.map((a: AddressRow) => (
          <div key={a.id} className="rounded-[12px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8">
            <div className="flex items-center justify-between">
              <MetaLabel gold>{a.label || "ADDRESS"}</MetaLabel>
              {a.is_default && (
                <span className="meta-xs rounded-full bg-[color:var(--accent-gold-muted)] px-3 py-1 text-[color:var(--accent-gold)]">DEFAULT</span>
              )}
            </div>
            <p className="mt-3 font-display text-xl">{a.full_name}</p>
            <p className="mt-2 text-[color:var(--text-secondary)]">
              {a.street_address}{a.unit ? `, ${a.unit}` : ""}<br />
              {a.suburb && `${a.suburb}, `}{a.city}, {a.province} {a.postal_code}
            </p>
            {a.phone && <p className="mt-2 text-sm text-[color:var(--text-tertiary)]">{a.phone}</p>}
            <Hairline className="my-5" />
            <div className="flex gap-4 text-sm">
              <button onClick={() => { setEditing(a); setOpen(true); }} className="font-display italic text-[color:var(--accent-gold)] hover:underline">Edit →</button>
              <button onClick={() => del({ data: { id: a.id } }).then(invalidate)} className="font-display italic text-[color:var(--text-tertiary)] hover:text-red-400">Delete →</button>
              {!a.is_default && (
                <button onClick={() => setDef({ data: { id: a.id } }).then(invalidate)} className="font-display italic text-[color:var(--text-tertiary)] hover:text-[color:var(--accent-gold)]">Set as default →</button>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="rounded-[12px] border border-dashed border-[color:var(--border-luxe)] bg-transparent p-8 text-left transition-colors hover:border-[color:var(--accent-gold)]"
        >
          <MetaLabel gold>+ ADD NEW ADDRESS</MetaLabel>
          <p className="mt-3 font-display italic text-xl text-[color:var(--text-secondary)]">Save details for faster checkout.</p>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[560px] rounded-[12px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-elevated)] p-8 md:p-10">
            <MetaLabel gold>{editing ? "EDIT ADDRESS" : "NEW ADDRESS"}</MetaLabel>
            <Hairline className="my-4" />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                saveMut.mutate({
                  label: (fd.get("label") as string) || null,
                  full_name: fd.get("full_name") as string,
                  phone: (fd.get("phone") as string) || null,
                  street_address: fd.get("street_address") as string,
                  unit: (fd.get("unit") as string) || null,
                  suburb: fd.get("suburb") as string,
                  city: fd.get("city") as string,
                  province: fd.get("province") as string,
                  postal_code: (fd.get("postal_code") as string) || null,
                  is_default: fd.get("is_default") === "on",
                });
              }}
              className="mt-4 space-y-4"
            >
              <AuthField label="Label (e.g. Home, Work)"><input name="label" defaultValue={editing?.label ?? ""} className={authInputCls} /></AuthField>
              <AuthField label="Full Name"><input name="full_name" required defaultValue={editing?.full_name ?? ""} className={authInputCls} /></AuthField>
              <AuthField label="Phone"><input name="phone" defaultValue={editing?.phone ?? ""} className={authInputCls} /></AuthField>
              <AuthField label="Street Address"><input name="street_address" required defaultValue={editing?.street_address ?? ""} className={authInputCls} /></AuthField>
              <AuthField label="Unit (optional)"><input name="unit" defaultValue={editing?.unit ?? ""} className={authInputCls} /></AuthField>
              <div className="grid grid-cols-2 gap-4">
                <AuthField label="Suburb"><input name="suburb" required defaultValue={editing?.suburb ?? ""} className={authInputCls} /></AuthField>
                <AuthField label="City"><input name="city" required defaultValue={editing?.city ?? ""} className={authInputCls} /></AuthField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <AuthField label="Province">
                  <select name="province" required defaultValue={editing?.province ?? ""} className={authInputCls}>
                    <option value="">Select</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </AuthField>
                <AuthField label="Postal Code"><input name="postal_code" defaultValue={editing?.postal_code ?? ""} className={authInputCls} /></AuthField>
              </div>
              <label className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
                <input type="checkbox" name="is_default" defaultChecked={!!editing?.is_default} className="accent-[color:var(--accent-gold)]" />
                Set as default address
              </label>
              <div className="flex gap-3 pt-4">
                <GoldButton type="submit" className="flex-1" disabled={saveMut.isPending}>Save Address</GoldButton>
                <GoldButton type="button" variant="tertiary" onClick={() => setOpen(false)}>Cancel</GoldButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
