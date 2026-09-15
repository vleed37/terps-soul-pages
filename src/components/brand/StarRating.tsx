import { Star } from "lucide-react";

/** Read-only star display. Accessible text equivalent is always rendered. */
export function StarRating({
  value,
  size = 14,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-[2px] ${className}`} role="img"
      aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rounded >= i;
        const half = !filled && rounded >= i - 0.5;
        return (
          <Star
            key={i}
            width={size}
            height={size}
            strokeWidth={1.5}
            className={
              filled || half
                ? "text-[color:var(--accent-gold)]"
                : "text-[color:var(--border-strong)]"
            }
            fill={filled ? "currentColor" : "none"}
          />
        );
      })}
    </span>
  );
}

/** Interactive 1–5 picker. */
export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i === 1 ? "" : "s"}`}
          onClick={() => onChange(i)}
          className="rounded p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-gold)]"
        >
          <Star
            width={22}
            height={22}
            strokeWidth={1.5}
            className={
              value >= i ? "text-[color:var(--accent-gold)]" : "text-[color:var(--border-strong)]"
            }
            fill={value >= i ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}
