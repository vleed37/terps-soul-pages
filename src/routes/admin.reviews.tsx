import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { adminListReviews, adminModerateReview } from "@/lib/admin-ops.functions";
import { EmptyState, Panel, Pill, dateZa } from "@/components/admin/AdminUI";
import { GoldButton } from "@/components/brand/GoldButton";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

const TABS = ["pending", "approved", "rejected"] as const;

function AdminReviews() {
  const qc = useQueryClient();
  const list = useServerFn(adminListReviews);
  const moderate = useServerFn(adminModerateReview);
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", tab],
    queryFn: () => list({ data: { status: tab } }),
  });

  const mut = useMutation({
    mutationFn: (v: { id: string; status: "approved" | "rejected" | "pending" }) =>
      moderate({ data: { ...v, note: notes[v.id]?.trim() || null } }),
    onSuccess: () => {
      toast.success("Review updated.");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];

  return (
    <Panel
      title="Customer reviews"
      description="Only approved reviews appear on the site and count towards ratings."
      actions={
        <div className="flex gap-2">
          {TABS.map((t) => (
            <GoldButton key={t} variant={t === tab ? "primary" : "secondary"} onClick={() => setTab(t)}>
              {t}
            </GoldButton>
          ))}
        </div>
      }
    >
      {isLoading ? (
        <p className="text-sm text-[color:var(--text-tertiary)]">Loading reviews…</p>
      ) : rows.length === 0 ? (
        <EmptyState text={`No ${tab} reviews.`} />
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display text-[color:var(--accent-gold)]">{r.rating}/5</span>
                  <span className="text-sm">{r.strain?.name ?? "Unknown product"}</span>
                  <span className="text-xs text-[color:var(--text-tertiary)]">
                    {r.customer} · {dateZa(r.submitted_at)}
                  </span>
                  {r.report_count > 0 && <Pill text={`${r.report_count} reported`} tone="bad" />}
                </div>
                <Pill text={r.status} tone={r.status === "approved" ? "good" : r.status === "rejected" ? "bad" : "warn"} />
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm text-[color:var(--text-secondary)]">{r.body}</p>

              {r.report_reasons.length > 0 && (
                <p className="mt-3 text-xs text-[color:var(--status-error)]">
                  Reported: {r.report_reasons.join("; ")}
                </p>
              )}
              {r.moderation_note && (
                <p className="mt-3 text-xs text-[color:var(--text-tertiary)]">Note: {r.moderation_note}</p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Input
                  placeholder="Internal note (optional)"
                  className="w-72"
                  value={notes[r.id] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                />
                {r.status !== "approved" && (
                  <GoldButton disabled={mut.isPending} onClick={() => mut.mutate({ id: r.id, status: "approved" })}>
                    Publish
                  </GoldButton>
                )}
                {r.status !== "rejected" && (
                  <GoldButton
                    variant="secondary"
                    disabled={mut.isPending}
                    onClick={() => mut.mutate({ id: r.id, status: "rejected" })}
                  >
                    Reject
                  </GoldButton>
                )}
                {r.status !== "pending" && (
                  <button className="ghost-link text-xs" onClick={() => mut.mutate({ id: r.id, status: "pending" })}>
                    Move back to pending
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
