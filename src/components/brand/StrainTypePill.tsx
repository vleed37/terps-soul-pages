import { cn } from "@/lib/utils";

type StrainType = "sativa" | "hybrid" | "indica";

const STYLES: Record<StrainType, { bg: string; color: string }> = {
  sativa: { bg: "var(--strain-sativa-bg)", color: "var(--strain-sativa)" },
  hybrid: { bg: "var(--strain-hybrid-bg)", color: "var(--strain-hybrid)" },
  indica: { bg: "var(--strain-indica-bg)", color: "var(--strain-indica)" },
};

export function StrainTypePill({
  type,
  className,
  size = "sm",
}: {
  type?: StrainType | null;
  className?: string;
  size?: "sm" | "md";
}) {
  if (!type) return null;
  const s = STYLES[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] font-body font-semibold uppercase tracking-[0.18em]",
        size === "sm" ? "px-2 py-[3px] text-[0.65rem]" : "px-2.5 py-1 text-[0.7rem]",
        className,
      )}
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {type}
    </span>
  );
}

export function StrainTypeDot({ type, className }: { type: StrainType; className?: string }) {
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", className)}
      style={{ backgroundColor: `var(--strain-${type})` }}
    />
  );
}

export type { StrainType };