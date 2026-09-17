import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { adminListStrains } from "@/lib/admin.functions";
import { adminCreateStrain, adminSetStrainArchived } from "@/lib/admin-ops.functions";
import { EmptyState, Field, Panel, Pill, TableShell, Td, Th, moneyZar } from "@/components/admin/AdminUI";
import { GoldButton } from "@/components/brand/GoldButton";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/strains/")({
  component: AdminStrains,
});

function AdminStrains() {
  const qc = useQueryClient();
  const list = useServerFn(adminListStrains);
  const setArchived = useServerFn(adminSetStrainArchived);
  const create = useServerFn(adminCreateStrain);
  const [showArchived, setShowArchived] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    product_line: "infused-pre-rolls",
    price_zar: 0,
    stock_quantity: 0,
  });

  const { data, isLoading } = useQuery({ queryKey: ["admin-strains"], queryFn: () => list() });

  const archiveMut = useMutation({
    mutationFn: (v: { id: string; archived: boolean }) => setArchived({ data: v }),
    onSuccess: () => {
      toast.success("Product updated.");
      qc.invalidateQueries({ queryKey: ["admin-strains"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMut = useMutation({
    mutationFn: () =>
      create({
        data: {
          name: form.name.trim(),
          slug: form.slug.trim(),
          product_line: form.product_line,
          product_tier: "core",
          price_zar: Number(form.price_zar),
          stock_quantity: Number(form.stock_quantity),
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Product created as a draft — it stays hidden until you make it live.");
      setCreating(false);
      setForm({ name: "", slug: "", product_line: form.product_line, price_zar: 0, stock_quantity: 0 });
      qc.invalidateQueries({ queryKey: ["admin-strains"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data ?? []).filter((s: any) => Boolean(s.is_archived) === showArchived);

  return (
    <div className="space-y-8">
      <Panel
        title="Products"
        description="Editing a product never changes past orders — order lines keep their own saved snapshot."
        actions={
          <div className="flex gap-3">
            <GoldButton variant="secondary" onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? "Show live" : "Show archived"}
            </GoldButton>
            <GoldButton onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "New product"}</GoldButton>
          </div>
        }
      >
        {creating && (
          <div className="mb-6 grid gap-4 rounded-[8px] border border-[color:var(--border-subtle)] p-5 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="URL slug">
              <Input
                value={form.slug}
                placeholder="cream-og"
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
              />
            </Field>
            <Field label="Range">
              <Input
                value={form.product_line}
                onChange={(e) => setForm({ ...form, product_line: e.target.value })}
              />
            </Field>
            <Field label="Retail price (R)">
              <Input
                type="number"
                value={form.price_zar}
                onChange={(e) => setForm({ ...form, price_zar: Number(e.target.value) })}
              />
            </Field>
            <Field label="Stock">
              <Input
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
              />
            </Field>
            <div className="lg:col-span-5">
              <GoldButton
                onClick={() => createMut.mutate()}
                disabled={createMut.isPending || form.name.length < 2 || form.slug.length < 2}
              >
                {createMut.isPending ? "Creating…" : "Create draft product"}
              </GoldButton>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-[color:var(--text-tertiary)]">Loading products…</p>
        ) : rows.length === 0 ? (
          <EmptyState text={showArchived ? "Nothing archived." : "No products yet."} />
        ) : (
          <TableShell>
            <thead className="bg-[color:var(--bg-elevated)]">
              <tr>
                <Th>Product</Th>
                <Th>Range</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {rows.map((s: any) => (
                <tr key={s.id}>
                  <Td>
                    <Link
                      to="/admin/strains/$id/edit"
                      params={{ id: s.id }}
                      className="font-display hover:text-[color:var(--accent-gold)]"
                    >
                      {s.name}
                    </Link>
                    <span className="ml-2 text-xs text-[color:var(--text-tertiary)]">/{s.slug}</span>
                  </Td>
                  <Td>{s.product_line}</Td>
                  <Td>{moneyZar(s.price_zar)}</Td>
                  <Td>{s.stock_quantity}</Td>
                  <Td>
                    {s.is_archived ? (
                      <Pill text="archived" />
                    ) : s.is_active ? (
                      <Pill text="live" tone="good" />
                    ) : (
                      <Pill text="draft" tone="warn" />
                    )}
                  </Td>
                  <Td>
                    <div className="flex gap-3 text-xs">
                      <Link to="/admin/strains/$id/edit" params={{ id: s.id }} className="ghost-link">
                        Edit
                      </Link>
                      <button
                        className="ghost-link"
                        onClick={() => archiveMut.mutate({ id: s.id, archived: !s.is_archived })}
                      >
                        {s.is_archived ? "Restore" : "Archive"}
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>
    </div>
  );
}
