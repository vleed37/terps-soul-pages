import logoDark from "@/assets/logo-terps.png";
import logoLight from "@/assets/logo-terps-light.png";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

export function Logo({ className, height = 56 }: { className?: string; height?: number }) {
  const { theme, mounted } = useTheme();
  const src = mounted && theme === "light" ? logoLight : logoDark;
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
