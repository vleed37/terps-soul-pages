import { cn } from "@/lib/utils";
export function Hairline({ className, w }: { className?: string; w?: string }) {
  return <hr className={cn("hairline-gold", className)} style={w ? { width: w } : undefined} />;
}
