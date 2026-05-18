import { Leaf, Droplet, ShieldCheck, MapPin } from "lucide-react";

const ITEMS = [
  { Icon: Leaf, label: "Premium Flower" },
  { Icon: Droplet, label: "Hand-Infused" },
  { Icon: ShieldCheck, label: "Lab Verified" },
  { Icon: MapPin, label: "Bred in SA" },
] as const;

export function FeatureBand() {
  return (
    <div className="w-full bg-[color:var(--accent-gold)]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-5 px-6 py-6 md:grid-cols-4 md:gap-0 md:px-12 md:py-5">
        {ITEMS.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center justify-center gap-3 text-[color:var(--on-gold)]"
          >
            <Icon strokeWidth={1.5} className="h-[18px] w-[18px]" />
            <span className="meta-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
