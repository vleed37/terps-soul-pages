import logoUrl from "@/assets/logo-terps.png";
import { cn } from "@/lib/utils";

export function Logo({ className, height = 56 }: { className?: string; height?: number }) {
  return (
    <img
      src={logoUrl}
      alt="Terps"
      className={cn("inline-block w-auto select-none", className)}
      style={{ height }}
      draggable={false}
    />
  );
}
