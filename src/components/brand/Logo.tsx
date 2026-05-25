import logoLight from "@/assets/logo-terps.png";       // light/cream wordmark — for use on dark surfaces
import logoDark from "@/assets/logo-terps-light.png";  // dark wordmark — for use on cream surfaces
import { cn } from "@/lib/utils";

export function Logo({
  className,
  height = 56,
  onTone = "light",
}: {
  className?: string;
  height?: number;
  /** Which surface the logo sits on: "light" (cream) → dark wordmark; "dark" → light wordmark. */
  onTone?: "light" | "dark";
}) {
  const src = onTone === "dark" ? logoLight : logoDark;
  return (
    <img
      src={src}
      alt="Terps"
      className={cn("inline-block w-auto select-none", className)}
      style={{ height }}
      draggable={false}
    />
  );
}
