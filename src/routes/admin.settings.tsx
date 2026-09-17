import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  adminGrantAdmin,
  adminListAdmins,
  adminRevokeAdmin,
} from "@/lib/admin-ops.functions";
import { adminGetSettings, adminSaveSettings } from "@/lib/settings-admin.functions";
import {
  BUSINESS_FIELDS,
  LEGAL_REVIEW_KEY,
  SHIPPING_KEYS,
  VAT_STATUS_KEY,
  legalReadiness,
} from "@/lib/settings";
import { ContentImagePanel } from "@/components/admin/ContentImagePanel";
import { Field, Panel, TableShell, Td, Th, dateZa } from "@/components/admin/AdminUI";
import { GoldButton } from "@/components/brand/GoldButton";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const TABS = ["Business & legal", "Shipping", "Imagery", "Access"] as const;

function AdminSettings() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Business & legal");
  const get = useServerFn(adminGetSettings);
  const { data: settings } = useQuery({ queryKey: ["admin-settings"], queryFn: () => get() });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={
              tab === t
                ? "rounded-full bg-[color:var(--bg-contrast)] px-5 py-2 text-xs uppercase tracking-[0.12em] text-[color:var(--text-on-dark)]"
                : "rounded-full border border-[color:var(--border-strong)] px-5 py-2 text-xs uppercase tracking-[0.12em] text-[color:var(--text-secondary)]"
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Business & legal" && <BusinessLegal settings={settings ?? {}} />}
      {tab === "Shipping" && <Shipping settings={settings ?? {}} />}
      {tab === "Imagery" && <ContentImagePanel settings={settings ?? {}} />}
      {tab === "Access" && <Access />}
    </div>
  );
}

/* --------------------------------------------------------- shared save form */

function useSaver(keys: string[], settings: Record<string, string>) {
  const qc = useQueryClient();
  const save = useServerFn(adminSaveSettings);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const k of keys) next[k] = settings[k] ?? "";
    setDraft(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(settings), JSON.stringify(keys)]);

  const mut = useMutation({
    mutationFn: () =>
      save({ data: { entries: keys.map((k) => ({ key: k, value: draft[k] ?? "" })) } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Saved. Blank fields stay marked as not yet supplied.");
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["admin-readiness"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { draft, set: (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v })), mut };
}

/* ------------------------------------------------------------ business tab */

function BusinessLegal({ settings }: { settings: Record<string, string> }) {
  const keys = [...BUSINESS_FIELDS.map((f) => f.key), VAT_STATUS_KEY, LEGAL_REVIEW_KEY];
  const { draft, set, mut } = useSaver(keys, settings);
  const legal = legalReadiness(settings);

  return (
    <div className="space-y-8">
      <Panel
        title="Legal readiness"
        description="Policies stay marked as drafts until every required field is supplied AND legal approval is recorded."
      >
        <ul className="space-y-2 text-sm">
          <li>
            Legal information:{" "}
            <strong>{legal.fieldsComplete ? "Complete" : "Incomplete"}</strong>
          </li>
          <li>
            Legal review: <strong>{legal.reviewApproved ? "Approved" : "Not approved"}</strong>
          </li>
          <li>
            Production readiness: <strong>{legal.ready ? "Cleared" : "Blocked"}</strong>
          </li>
        </ul>
        {legal.missing.length > 0 && (
          <ul className="mt-4 grid grid-cols-1 gap-1 text-sm text-[color:var(--text-tertiary)] sm:grid-cols-2">
            {legal.missing.map((m) => (
              <li key={m}>· {m}</li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Business & legal details"
        description="Leave a field blank if the value has not been confirmed — the site then says so openly instead of guessing."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {BUSINESS_FIELDS.map((f) => (
            <Field key={f.key} label={`${f.label}${f.required ? "" : " (optional)"}`}>
              <Input
                value={draft[f.key] ?? ""}
                placeholder="Not supplied"
                onChange={(e) => set(f.key, e.target.value)}
              />
            </Field>
          ))}

          <Field label="VAT registered">
            <select
              value={draft[VAT_STATUS_KEY] ?? "tbc"}
              onChange={(e) => set(VAT_STATUS_KEY, e.target.value)}
              className="h-10 w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] px-3 text-sm"
            >
              <option value="tbc">To be confirmed</option>
              <option value="registered">Yes — VAT registered</option>
              <option value="not_registered">No — not VAT registered</option>
            </select>
          </Field>

          <Field label="Legal review approved">
            <select
              value={draft[LEGAL_REVIEW_KEY] ?? "false"}
              onChange={(e) => set(LEGAL_REVIEW_KEY, e.target.value)}
              className="h-10 w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] px-3 text-sm"
            >
              <option value="false">Not approved</option>
              <option value="true">Approved by legal practitioner</option>
            </select>
          </Field>
        </div>

        <p className="mt-4 text-xs text-[color:var(--text-tertiary)]">
          Recording legal approval does not create or check legal wording. Your legal practitioner remains
          responsible for the content of the policies.
        </p>

        <div className="mt-6">
          <GoldButton disabled={mut.isPending} onClick={() => mut.mutate()}>
            {mut.isPending ? "Saving…" : "Save business & legal"}
          </GoldButton>
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------ shipping tab */

function Shipping({ settings }: { settings: Record<string, string> }) {
  const keys = Object.values(SHIPPING_KEYS) as string[];
  const { draft, set, mut } = useSaver(keys, settings);

  return (
    <Panel
      title="Delivery settings"
      description="While delivery pricing is not confirmed, the public site shows no rates, no free-delivery offer and no delivery estimates."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Retail delivery fee (R)">
          <Input
            inputMode="decimal"
            value={draft[SHIPPING_KEYS.retailFee] ?? ""}
            placeholder="e.g. 80"
            onChange={(e) => set(SHIPPING_KEYS.retailFee, e.target.value)}
          />
        </Field>
        <Field label="Wholesale delivery fee (R)">
          <Input
            inputMode="decimal"
            value={draft[SHIPPING_KEYS.wholesaleFee] ?? ""}
            placeholder="e.g. 250"
            onChange={(e) => set(SHIPPING_KEYS.wholesaleFee, e.target.value)}
          />
        </Field>
        <Field label="Free delivery offered">
          <select
            value={draft[SHIPPING_KEYS.freeEnabled] ?? "false"}
            onChange={(e) => set(SHIPPING_KEYS.freeEnabled, e.target.value)}
            className="h-10 w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] px-3 text-sm"
          >
            <option value="false">No</option>
            <option value="true">Yes, over a threshold</option>
          </select>
        </Field>
        <Field label="Free delivery threshold (R)">
          <Input
            inputMode="decimal"
            value={draft[SHIPPING_KEYS.freeThreshold] ?? ""}
            placeholder="e.g. 500"
            onChange={(e) => set(SHIPPING_KEYS.freeThreshold, e.target.value)}
          />
        </Field>
        <Field label="Courier / delivery provider">
          <Input
            value={draft[SHIPPING_KEYS.courier] ?? ""}
            placeholder="Not chosen yet"
            onChange={(e) => set(SHIPPING_KEYS.courier, e.target.value)}
          />
        </Field>
        <Field label="Delivery pricing confirmed">
          <select
            value={draft[SHIPPING_KEYS.confirmed] ?? "false"}
            onChange={(e) => set(SHIPPING_KEYS.confirmed, e.target.value)}
            className="h-10 w-full rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] px-3 text-sm"
          >
            <option value="false">Not confirmed — keep rates private</option>
            <option value="true">Confirmed — may be shown publicly</option>
          </select>
        </Field>
      </div>

      <p className="mt-4 text-xs text-[color:var(--text-tertiary)]">
        Delivery estimates and processing times live on the Business &amp; legal tab. No courier is connected —
        the checkout stays provider-neutral until you choose one.
      </p>

      <div className="mt-6">
        <GoldButton disabled={mut.isPending} onClick={() => mut.mutate()}>
          {mut.isPending ? "Saving…" : "Save delivery settings"}
        </GoldButton>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------- access tab */

function Access() {
  const qc = useQueryClient();
  const list = useServerFn(adminListAdmins);
  const grant = useServerFn(adminGrantAdmin);
  const revoke = useServerFn(adminRevokeAdmin);
  const [email, setEmail] = useState("");

  const { data, isLoading } = useQuery({ queryKey: ["admin-admins"], queryFn: () => list() });

  const grantMut = useMutation({
    mutationFn: () => grant({ data: { email: email.trim() } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Access granted.");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admin-admins"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeMut = useMutation({
    mutationFn: (user_id: string) => revoke({ data: { user_id } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Access removed.");
      qc.invalidateQueries({ queryKey: ["admin-admins"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <Panel
        title="Who can manage Terps"
        description="Access is stored in the database, not in the browser. The person must already have a Terps account."
      >
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <Field label="Account email">
            <Input
              className="w-72"
              value={email}
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <GoldButton disabled={grantMut.isPending || !email.includes("@")} onClick={() => grantMut.mutate()}>
            {grantMut.isPending ? "Granting…" : "Grant access"}
          </GoldButton>
        </div>

        {isLoading ? (
          <p className="text-sm text-[color:var(--text-tertiary)]">Loading…</p>
        ) : (
          <TableShell>
            <thead className="bg-[color:var(--bg-elevated)]">
              <tr>
                <Th>Email</Th>
                <Th>Granted</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {(data ?? []).map((a) => (
                <tr key={a.id}>
                  <Td>{a.email ?? a.user_id}</Td>
                  <Td>{dateZa(a.created_at)}</Td>
                  <Td>
                    <button className="ghost-link text-xs" onClick={() => revokeMut.mutate(a.user_id)}>
                      Remove
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>

      <Panel title="Things handled outside this screen">
        <ul className="space-y-2 text-sm text-[color:var(--text-secondary)]">
          <li>· Payment status is set only by the payment provider, never by hand.</li>
          <li>· Payment, email and mapping credentials are environment-controlled and never shown here.</li>
          <li>· Legal pages remain drafts until the wording is approved and every field is supplied.</li>
          <li>· Address-to-map conversion needs a mapping credential before pins appear automatically.</li>
        </ul>
      </Panel>
    </div>
  );
}
