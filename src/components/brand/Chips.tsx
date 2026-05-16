import { cn } from "@/lib/utils";

export function EffectChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-block rounded-full border border-[color:var(--accent-gold)] px-3.5 py-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-[color:var(--accent-gold)]", className)}>
      {children}
    </span>
  );
}

export function FlavorChip({ children, dominant, className }: { children: React.ReactNode; dominant?: boolean; className?: string }) {
  return (
    <span className={cn(
      "inline-block rounded-full border px-3 py-1 text-xs",
      dominant
        ? "border-[color:var(--accent-gold)] text-[color:var(--accent-gold)]"
        : "border-[color:var(--border-strong)] text-[color:var(--text-primary)]",
      className,
    )}>
      {children}
    </span>
  );
}

export function StatusBadge({ kind }: { kind: "limited" | "soldout" }) {
  if (kind === "limited") {
    return (
      <span className="inline-block rounded-full border border-[color:var(--accent-gold)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--accent-gold)]">
        Limited
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full border border-[color:var(--text-secondary)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
      Sold out
    </span>
  );
}
