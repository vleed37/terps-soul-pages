import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  children,
  actions,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-6">
      {(title || actions) && (
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-xl">{title}</h2>}
            {description && (
              <p className="mt-1 text-xs text-[color:var(--text-tertiary)]">{description}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left meta-xs whitespace-nowrap text-[color:var(--text-tertiary)]">
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3 text-sm text-[color:var(--text-primary)]", className)}>{children}</td>
  );
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[8px] border border-[color:var(--border-luxe)]">
      <table className="min-w-full divide-y divide-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]">
        {children}
      </table>
    </div>
  );
}

export function Pill({
  text,
  tone = "neutral",
}: {
  text: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const tones: Record<string, string> = {
    neutral: "border-[color:var(--border-strong)] text-[color:var(--text-secondary)]",
    good: "border-[color:var(--status-success)] text-[color:var(--status-success)]",
    warn: "border-[color:var(--accent-gold)] text-[color:var(--accent-gold)]",
    bad: "border-[color:var(--status-error)] text-[color:var(--status-error)]",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em]",
        tones[tone],
      )}
    >
      {text}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-5">
      <p className="meta-xs text-[color:var(--text-tertiary)]">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-[color:var(--text-tertiary)]">{hint}</p>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="meta-xs text-[color:var(--text-tertiary)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-12 text-center text-sm text-[color:var(--text-tertiary)]">
      {text}
    </div>
  );
}

export function moneyZar(n: number | string | null | undefined) {
  return `R${Number(n ?? 0).toFixed(2)}`;
}

export function dateZa(v: string | null | undefined) {
  return v ? new Date(v).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

export function paymentTone(status: string) {
  return status === "paid" ? "good" : status === "failed" ? "bad" : "warn";
}
