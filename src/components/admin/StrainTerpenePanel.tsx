import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminGetStrainTerpenes, adminSetStrainTerpenes } from "@/lib/admin-ops.functions";
import { GoldButton } from "@/components/brand/GoldButton";
import { Panel } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";

type Row = { terpene_id: string; percentage: number | null; note: string | null };

/** Structural product ↔ terpene links that drive the public terpene library. */
export function StrainTerpenePanel({ strainId }: { strainId: string }) {
  const load = useServerFn(adminGetStrainTerpenes);
  const save = useServerFn(adminSetStrainTerpenes);
  const [rows, setRows] = useState<Row[]>([]);

  const { data } = useQuery({
    queryKey: ["admin-strain-terpenes", strainId],
    queryFn: () => load({ data: { strain_id: strainId } }),
  });

  useEffect(() => {
    if (!data) return;
    setRows(
      data.links.map((l) => ({
        terpene_id: l.terpene_id,
        percentage: l.percentage == null ? null : Number(l.percentage),
        note: l.note ?? null,
      })),
    );
  }, [data]);

  const saveMut = useMutation({
    mutationFn: () =>
      save({
        data: {
          strain_id: strainId,
          items: rows.map((r, i) => ({
            terpene_id: r.terpene_id,
            prominence: i,
            percentage: r.percentage,
            note: r.note,
          })),
        },
      }),
    onSuccess: () => toast.success("Terpene links saved."),
    onError: (e: Error) => toast.error(e.message),
  });

  const terpenes = data?.terpenes ?? [];
  const selected = new Set(rows.map((r) => r.terpene_id));

  return (
    <Panel
      title="Terpenes in this product"
      description="Tick the terpenes present. Order top to bottom is the order shown to customers."
    >
      <div className="space-y-3">
        {terpenes.map((t) => {
          const row = rows.find((r) => r.terpene_id === t.id);
          return (
            <div key={t.id} className="flex flex-wrap items-center gap-4">
              <label className="flex min-w-44 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={(e) =>
                    setRows((prev) =>
                      e.target.checked
                        ? [...prev, { terpene_id: t.id, percentage: null, note: null }]
                        : prev.filter((r) => r.terpene_id !== t.id),
                    )
                  }
                />
                {t.name}
              </label>
              {row && (
                <>
                  <Input
                    className="w-28"
                    type="number"
                    step="0.01"
                    placeholder="%"
                    value={row.percentage ?? ""}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.terpene_id === t.id
                            ? { ...r, percentage: e.target.value === "" ? null : Number(e.target.value) }
                            : r,
                        ),
                      )
                    }
                  />
                  <Input
                    className="w-64"
                    placeholder="Note (optional)"
                    value={row.note ?? ""}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) => (r.terpene_id === t.id ? { ...r, note: e.target.value || null } : r)),
                      )
                    }
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <GoldButton disabled={saveMut.isPending} onClick={() => saveMut.mutate()}>
          {saveMut.isPending ? "Saving…" : "Save terpene links"}
        </GoldButton>
      </div>
    </Panel>
  );
}
