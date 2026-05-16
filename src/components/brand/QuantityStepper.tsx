import { Minus, Plus } from "lucide-react";

export function QuantityStepper({ value, onChange, min = 1, max = 10 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid h-9 w-9 place-items-center rounded-[4px] border border-[color:var(--accent-gold)] text-[color:var(--accent-gold)] transition-colors hover:bg-[color:var(--accent-gold-muted)]"
      >
        <Minus strokeWidth={1.5} className="h-4 w-4" />
      </button>
      <span className="min-w-[2ch] text-center font-body text-base font-medium">{value}</span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid h-9 w-9 place-items-center rounded-[4px] border border-[color:var(--accent-gold)] text-[color:var(--accent-gold)] transition-colors hover:bg-[color:var(--accent-gold-muted)]"
      >
        <Plus strokeWidth={1.5} className="h-4 w-4" />
      </button>
    </div>
  );
}
