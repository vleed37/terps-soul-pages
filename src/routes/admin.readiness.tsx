import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminReadiness, type ReadyState } from "@/lib/settings-admin.functions";
import { Panel } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/readiness")({
  component: AdminReadiness,
});

const LABEL: Record<ReadyState, string> = {
  ready: "Ready",
  incomplete: "Incomplete",
  needs_config: "Needs configuration",
  needs_client: "Needs client",
  needs_legal: "Needs legal review",
};

const TONE: Record<ReadyState, string> = {
  ready: "border-[color:var(--status-success,#4B6B44)] text-[color:var(--status-success,#4B6B44)]",
  incomplete: "border-[color:var(--accent-gold)] text-[color:var(--accent-gold)]",
  needs_config: "border-[color:var(--status-error)] text-[color:var(--status-error)]",
  needs_client: "border-[color:var(--border-strong)] text-[color:var(--text-secondary)]",
  needs_legal: "border-[color:var(--status-error)] text-[color:var(--status-error)]",
};

function StatePill({ state }: { state: ReadyState }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em] ${TONE[state]}`}
    >
      {LABEL[state]}
    </span>
  );
}

function AdminReadiness() {
  const run = useServerFn(adminReadiness);
  const { data, isLoading } = useQuery({ queryKey: ["admin-readiness"], queryFn: () => run() });

  const groups = data ?? [];
  const all = groups.flatMap((g) => g.items);
  const readyCount = all.filter((i) => i.state === "ready").length;
  const blocked = all.filter((i) => i.state !== "ready").length;

  return (
    <div className="space-y-8">
      <Panel
        title="Production readiness"
        description="Every line below is read from live configuration and data. Nothing is marked ready by hand."
      >
        {isLoading ? (
          <p className="text-sm text-[color:var(--text-tertiary)]">Checking…</p>
        ) : (
          <p className="text-sm text-[color:var(--text-secondary)]">
            <strong className="font-display text-lg">{readyCount}</strong> ready ·{" "}
            <strong className="font-display text-lg">{blocked}</strong> outstanding.{" "}
            {blocked > 0 ? "Launch is blocked until the outstanding items are resolved." : "No blockers detected."}
          </p>
        )}
      </Panel>

      {groups.map((g) => (
        <Panel key={g.group} title={g.group}>
          <ul className="space-y-3">
            {g.items.map((item) => (
              <li
                key={`${g.group}-${item.label}`}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--border-subtle)] pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-[240px] flex-1">
                  <p className="font-display text-base">{item.label}</p>
                  <p className="mt-1 text-sm text-[color:var(--text-tertiary)]">{item.detail}</p>
                </div>
                <StatePill state={item.state} />
              </li>
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
