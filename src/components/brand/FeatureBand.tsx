import { Leaf, Droplet, ShieldCheck, MapPin } from "lucide-react";

const ITEMS = [
  { Icon: Leaf, label: "Premium Flower" },
  { Icon: Droplet, label: "Hand-Infused" },
  { Icon: ShieldCheck, label: "Lab Verified" },
  { Icon: MapPin, label: "Bred in SA" },
] as const;

export function FeatureBand() {
  return (
    <div
      className="w-full border-y border-[color:var(--border-luxe)]"
      style={{ backgroundColor: "var(--bg-sage)" }}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-5 px-6 py-7 md:grid-cols-4 md:gap-0 md:px-12 md:py-6">
        {ITEMS.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-3"
            style={{ color: "#0B0A08" }}
          >
            <Icon strokeWidth={1.5} className="h-[18px] w-[18px]" />
            <span className="meta-xs" style={{ color: "rgba(11,10,8,0.75)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
