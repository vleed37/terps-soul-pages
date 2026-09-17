import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { adminListTerpenes, adminUpdateTerpene } from "@/lib/admin-ops.functions";
import { EmptyState, Field, Panel, Pill } from "@/components/admin/AdminUI";
import { GoldButton } from "@/components/brand/GoldButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/terpenes")({
  component: AdminTerpenes,
});

function AdminTerpenes() {
  const qc = useQueryClient();
  const list = useServerFn(adminListTerpenes);
  const update = useServerFn(adminUpdateTerpene);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    tastes_like: "",
    short_descriptor: "",
    long_description: "",
    display_order: 0,
  });

  const { data, isLoading } = useQuery({ queryKey: ["admin-terpenes"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: (id: string) =>
      update({
        data: {
          id,
          name: form.name.trim(),
          tastes_like: form.tastes_like.trim() || null,
          short_descriptor: form.short_descriptor.trim() || null,
          long_description: form.long_description.trim() || null,
          display_order: Number(form.display_order),
        },
      }),
    onSuccess: () => {
      toast.success("Terpene updated.");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-terpenes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];

  return (
    <Panel
      title="Terpene library"
      description="Products are linked to terpenes on each product's edit page; those links drive the public library."
    >
      {isLoading ? (
        <p className="text-sm text-[color:var(--text-tertiary)]">Loading terpenes…</p>
      ) : rows.length === 0 ? (
        <EmptyState text="No terpenes yet." />
      ) : (
        <ul className="space-y-4">
          {rows.map((t) => (
            <li
              key={t.id}
              className="rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg">{t.name}</h3>
                  <p className="text-xs text-[color:var(--text-tertiary)]">
                    {t.tastes_like || "No taste note"} · order {t.display_order ?? 0}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {t.strains.length === 0 ? (
                    <Pill text="no products linked" tone="warn" />
                  ) : (
                    t.strains.map((s) => <Pill key={s.id} text={s.name} />)
                  )}
                  <button
                    className="ghost-link text-xs"
                    onClick={() => {
                      setEditing(editing === t.id ? null : t.id);
                      setForm({
                        name: t.name ?? "",
                        tastes_like: t.tastes_like ?? "",
                        short_descriptor: t.short_descriptor ?? "",
                        long_description: t.long_description ?? "",
                        display_order: t.display_order ?? 0,
                      });
                    }}
                  >
                    {editing === t.id ? "Close" : "Edit"}
                  </button>
                </div>
              </div>

              {editing === t.id && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </Field>
                  <Field label="Tastes like">
                    <Input
                      value={form.tastes_like}
                      onChange={(e) => setForm({ ...form, tastes_like: e.target.value })}
                    />
                  </Field>
                  <Field label="Short descriptor">
                    <Input
                      value={form.short_descriptor}
                      onChange={(e) => setForm({ ...form, short_descriptor: e.target.value })}
                    />
                  </Field>
                  <Field label="Display order">
                    <Input
                      type="number"
                      value={form.display_order}
                      onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Long description">
                      <Textarea
                        rows={4}
                        value={form.long_description}
                        onChange={(e) => setForm({ ...form, long_description: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <GoldButton disabled={mut.isPending} onClick={() => mut.mutate(t.id)}>
                      {mut.isPending ? "Saving…" : "Save terpene"}
                    </GoldButton>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
