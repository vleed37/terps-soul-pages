import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "tertiary";
type Size = "default" | "lg" | "sm";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 font-body font-semibold uppercase tracking-[0.15em] text-[0.8125rem] rounded-[4px] transition-all duration-400 ease-out disabled:opacity-40 disabled:pointer-events-none cursor-pointer";

const sizes: Record<Size, string> = {
  sm: "px-5 py-2.5",
  default: "px-8 py-4",
  lg: "px-10 py-5 text-sm",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[color:var(--accent-gold)] text-[color:var(--on-gold)] hover:bg-[color:var(--accent-gold-hover)] hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]",
  secondary:
    "bg-transparent border border-[color:var(--accent-gold)] text-[color:var(--accent-gold)] hover:bg-[color:var(--accent-gold-muted)]",
  tertiary:
    "bg-transparent border border-[color:var(--text-primary)] text-[color:var(--text-primary)] hover:bg-[color:var(--accent-gold-muted)]",
};

export const GoldButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "default", className, ...props }, ref) => (
    <button ref={ref} className={cn(base, sizes[size], variants[variant], className)} {...props} />
  ),
);
GoldButton.displayName = "GoldButton";
