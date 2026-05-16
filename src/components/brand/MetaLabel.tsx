import { cn } from "@/lib/utils";
export function MetaLabel({ children, className, gold = false }: { children: React.ReactNode; className?: string; gold?: boolean }) {
  return <span className={cn("meta-xs", gold ? "text-gold" : "text-[color:var(--text-secondary)]", className)}>{children}</span>;
}
