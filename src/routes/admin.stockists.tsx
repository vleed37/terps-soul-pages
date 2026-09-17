import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  adminListCuratedStockists,
  adminListWholesaleAccounts,
  adminSetAccountNotes,
  adminSetAccountStatus,
  adminSetCuratedCoordinates,
  adminSetCuratedStockistActive,
  adminUpsertCuratedStockist,
} from "@/lib/admin-ops.functions";
import { adminRetryStockistGeocoding } from "@/lib/admin.functions";
import { EmptyState, Field, Panel, Pill, TableShell, Td, Th } from "@/components/admin/AdminUI";
import { GoldButton } from "@/components/brand/GoldButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/stockists")({
  component: AdminStockists,
});

const LISTING_LABEL: Record<string, { text: string; tone: "good" | "warn" | "neutral" }> = {
  active: { text: "on the map", tone: "good" },
  active_no_coordinates: { text: "listed, no pin", tone: "warn" },
  eligible_not_opted_in: { text: "eligible, not opted in", tone: "neutral" },
  not_eligible: { text: "not listed", tone: "neutral" },
};

function AdminStockists() {
  const [tab, setTab] = useState<"accounts" | "curated">("accounts");
  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        <GoldButton variant={tab === "accounts" ? "primary" : "secondary"} onClick={() => setTab("accounts")}>
          Stockist accounts
        </GoldButton>
        <GoldButton variant={tab === "curated" ? "primary" : "secondary"} onClick={() => setTab("curated")}>
          Curated locations
        </GoldButton>
      </div>
      {tab === "accounts" ? <Accounts /> : <Curated />}
    </div>
  );
}

function Accounts() {
  const qc = useQueryClient();
  const list = useServerFn(adminListWholesaleAccounts);
  const setStatus = useServerFn(adminSetAccountStatus);
  const setNotes = useServerFn(adminSetAccountNotes);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-accounts", q],
    queryFn: () => list({ data: { q: q.trim() || undefined } }),
  });

  const statusMut = useMutation({
    mutationFn: (v: { id: string; action: "suspend" | "reactivate" }) =>
      setStatus({ data: { ...v, reason: reason.trim() || undefined } }),
    onSuccess: () => {
      toast.success("Account updated.");
      setReason("");
      qc.invalidateQueries({ queryKey: ["admin-accounts"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const noteMut = useMutation({
    mutationFn: (id: string) => setNotes({ data: { id, internal_notes: note.trim() || null } }),
    onSuccess: () => {
      toast.success("Note saved.");
      qc.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];

  return (
    <Panel
      title="Stockist accounts"
      description="New stockists are approved automatically. Suspending an account blocks trade pricing and ordering immediately."
      actions={
        <Input
          className="w-64"
          value={q}
          placeholder="Search business, email or city"
          onChange={(e) => setQ(e.target.value)}
        />
      }
    >
      {isLoading ? (
        <p className="text-sm text-[color:var(--text-tertiary)]">Loading accounts…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No stockist accounts match." />
      ) : (
        <div className="space-y-4">
          {rows.map((a) => {
            const label = LISTING_LABEL[a.listing.state] ?? LISTING_LABEL.not_eligible!;
            return (
              <div
                key={a.id}
                className="rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg">{a.business_name}</h3>
                    <p className="text-xs text-[color:var(--text-tertiary)]">
                      {a.primary_contact_name} · {a.primary_contact_email} · {a.business_city},{" "}
                      {a.business_province}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill
                      text={a.approval_status}
                      tone={a.approval_status === "approved" ? "good" : a.approval_status === "suspended" ? "bad" : "warn"}
                    />
                    <Pill text={label.text} tone={label.tone} />
                    {a.hasPaidOrder && <Pill text="has paid order" />}
                    <button
                      className="ghost-link text-xs"
                      onClick={() => {
                        setOpenId(openId === a.id ? null : a.id);
                        setNote("");
                      }}
                    >
                      {openId === a.id ? "Close" : "Manage"}
                    </button>
                  </div>
                </div>

                {a.listing.reason && (
                  <p className="mt-2 text-xs text-[color:var(--text-tertiary)]">
                    Map listing: {a.listing.reason}.
                  </p>
                )}

                {openId === a.id && (
                  <div className="mt-5 space-y-4">
                    <div className="grid gap-3 text-xs text-[color:var(--text-secondary)] sm:grid-cols-2">
                      <p>Public name: {a.public_store_name ?? "—"}</p>
                      <p>Public address: {a.public_address ?? "—"}</p>
                      <p>Public phone: {a.public_phone ?? "—"}</p>
                      <p>Opted in: {a.map_listing_opt_in ? "yes" : "no"}</p>
                    </div>
                    <Field label="Internal note">
                      <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                    </Field>
                    <div className="flex flex-wrap items-end gap-3">
                      <GoldButton variant="secondary" disabled={noteMut.isPending} onClick={() => noteMut.mutate(a.id)}>
                        Save note
                      </GoldButton>
                      {a.approval_status === "approved" ? (
                        <>
                          <Field label="Reason (optional)">
                            <Input
                              className="w-64"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />
                          </Field>
                          <GoldButton
                            disabled={statusMut.isPending}
                            onClick={() => statusMut.mutate({ id: a.id, action: "suspend" })}
                          >
                            Suspend access
                          </GoldButton>
                        </>
                      ) : (
                        <GoldButton
                          disabled={statusMut.isPending}
                          onClick={() => statusMut.mutate({ id: a.id, action: "reactivate" })}
                        >
                          Reactivate access
                        </GoldButton>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

const BLANK = {
  slug: "",
  name: "",
  address: "",
  unit: "",
  suburb: "",
  city: "",
  province: "",
  postal_code: "",
  phone: "",
  email: "",
  website: "",
  is_active: false,
  is_featured: false,
};

function Curated() {
  const qc = useQueryClient();
  const list = useServerFn(adminListCuratedStockists);
  const upsert = useServerFn(adminUpsertCuratedStockist);
  const setActive = useServerFn(adminSetCuratedStockistActive);
  const setCoords = useServerFn(adminSetCuratedCoordinates);
  const retryGeocode = useServerFn(adminRetryStockistGeocoding);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState({ ...BLANK });

  const { data, isLoading } = useQuery({ queryKey: ["admin-curated"], queryFn: () => list() });

  const saveMut = useMutation({
    mutationFn: (id?: string) =>
      upsert({
        data: {
          ...(id ? { id } : {}),
          slug: form.slug.trim(),
          name: form.name.trim(),
          address: form.address.trim(),
          unit: form.unit.trim() || null,
          suburb: form.suburb.trim() || null,
          city: form.city.trim(),
          province: form.province.trim(),
          postal_code: form.postal_code.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          website: form.website.trim() || null,
          is_active: form.is_active,
          is_featured: form.is_featured,
        },
      }),
    onSuccess: (res) => {
      toast.success(
        res.geocode === "ok"
          ? "Saved and placed on the map."
          : res.geocode === "unconfigured"
            ? "Saved. Map pin needs a mapping credential."
            : "Saved.",
      );
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-curated"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeMut = useMutation({
    mutationFn: (v: { id: string; is_active: boolean }) => setActive({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-curated"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const coordsMut = useMutation({
    mutationFn: (v: { id: string; latitude: number | null; longitude: number | null }) => setCoords({ data: v }),
    onSuccess: () => {
      toast.success("Coordinates updated.");
      qc.invalidateQueries({ queryKey: ["admin-curated"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const retryMut = useMutation({
    mutationFn: () => retryGeocode({ data: {} as never }),
    onSuccess: () => {
      toast.success("Address lookup re-run.");
      qc.invalidateQueries({ queryKey: ["admin-curated"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];

  return (
    <Panel
      title="Curated locations"
      description="Shops Terps lists manually. Coordinates come from the address automatically — never typed in by a stockist."
      actions={
        <div className="flex gap-3">
          <GoldButton variant="secondary" disabled={retryMut.isPending} onClick={() => retryMut.mutate()}>
            Retry address lookups
          </GoldButton>
          <GoldButton
            onClick={() => {
              setEditing(editing === "new" ? null : "new");
              setForm({ ...BLANK });
            }}
          >
            {editing === "new" ? "Cancel" : "Add location"}
          </GoldButton>
        </div>
      }
    >
      {editing === "new" && <CuratedForm form={form} setForm={setForm} onSave={() => saveMut.mutate(undefined)} busy={saveMut.isPending} />}

      {isLoading ? (
        <p className="text-sm text-[color:var(--text-tertiary)]">Loading locations…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No curated locations yet." />
      ) : (
        <div className="mt-6 space-y-4">
          <TableShell>
            <thead className="bg-[color:var(--bg-elevated)]">
              <tr>
                <Th>Name</Th>
                <Th>City</Th>
                <Th>Map pin</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {rows.map((s) => (
                <tr key={s.id}>
                  <Td>
                    <span className="font-display">{s.name}</span>
                    <span className="ml-2 text-xs text-[color:var(--text-tertiary)]">/{s.slug}</span>
                  </Td>
                  <Td>
                    {s.city}, {s.province}
                  </Td>
                  <Td>
                    {s.latitude != null && s.longitude != null ? (
                      <Pill text="pinned" tone="good" />
                    ) : (
                      <Pill text="no pin" tone="warn" />
                    )}
                  </Td>
                  <Td>{s.is_active ? <Pill text="listed" tone="good" /> : <Pill text="hidden" />}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <button
                        className="ghost-link"
                        onClick={() => {
                          setEditing(editing === s.id ? null : s.id);
                          setForm({
                            slug: s.slug ?? "",
                            name: s.name ?? "",
                            address: s.address ?? "",
                            unit: s.unit ?? "",
                            suburb: s.suburb ?? "",
                            city: s.city ?? "",
                            province: s.province ?? "",
                            postal_code: s.postal_code ?? "",
                            phone: s.phone ?? "",
                            email: s.email ?? "",
                            website: s.website ?? "",
                            is_active: Boolean(s.is_active),
                            is_featured: Boolean(s.is_featured),
                          });
                        }}
                      >
                        {editing === s.id ? "Close" : "Edit"}
                      </button>
                      <button
                        className="ghost-link"
                        onClick={() => activeMut.mutate({ id: s.id, is_active: !s.is_active })}
                      >
                        {s.is_active ? "Hide" : "List"}
                      </button>
                      {s.latitude != null && (
                        <button
                          className="ghost-link"
                          onClick={() => coordsMut.mutate({ id: s.id, latitude: null, longitude: null })}
                        >
                          Clear pin
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>

          {editing && editing !== "new" && (
            <CuratedForm form={form} setForm={setForm} onSave={() => saveMut.mutate(editing)} busy={saveMut.isPending} />
          )}
        </div>
      )}
    </Panel>
  );
}

function CuratedForm({
  form,
  setForm,
  onSave,
  busy,
}: {
  form: typeof BLANK;
  setForm: (v: typeof BLANK) => void;
  onSave: () => void;
  busy: boolean;
}) {
  const text = (key: keyof typeof BLANK, label: string) => (
    <Field label={label}>
      <Input value={String(form[key] ?? "")} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </Field>
  );
  return (
    <div className="grid gap-4 rounded-[8px] border border-[color:var(--border-subtle)] p-5 sm:grid-cols-2 lg:grid-cols-3">
      {text("name", "Store name")}
      {text("slug", "URL slug")}
      {text("address", "Street address")}
      {text("unit", "Unit (optional)")}
      {text("suburb", "Suburb")}
      {text("city", "City")}
      {text("province", "Province")}
      {text("postal_code", "Postal code")}
      {text("phone", "Phone")}
      {text("email", "Email")}
      {text("website", "Website")}
      <div className="flex items-center gap-6 pt-6 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Listed publicly
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
          />
          Featured
        </label>
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <GoldButton disabled={busy} onClick={onSave}>
          {busy ? "Saving…" : "Save location"}
        </GoldButton>
      </div>
    </div>
  );
}
