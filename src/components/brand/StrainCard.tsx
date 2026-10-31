import { Link } from "@tanstack/react-router";
import { getStrain3DModel } from "@/lib/strain-assets";
import { Product3DViewer } from "./Product3DViewer";
import { CaviarStixCard } from "./CaviarStixCard";
import { StrainTypePill } from "./StrainTypePill";
import type { Strain } from "@/lib/types";

export function StrainCard({ strain }: { strain: Strain }) {
  if (strain.product_tier === "premium" || strain.product_line === "caviar_stix") {
    return <CaviarStixCard strain={strain} />;
  }
  const model = getStrain3DModel(strain.slug);
  const soldOut = strain.stock_quantity <= 0;
  const isLimited = !!strain.is_limited && !soldOut;

  return (
    <Link
      to="/strain/$slug"
      params={{ slug: strain.slug }}
      className="group relative block overflow-hidden rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex aspect-[4/5] w-full flex-col">
        {/* Product area — clean neutral surface, no gradients */}
        <div className="relative flex-[7] overflow-hidden bg-[color:var(--bg-elevated)]">
          {strain.strain_type && (
            <div className="absolute left-4 top-4 z-10">
              <StrainTypePill type={strain.strain_type} />
            </div>
          )}
          {isLimited && (
            <div className="absolute right-4 top-4 z-10">
              <span className="inline-block rounded-[4px] border border-[color:var(--accent-gold)] px-2 py-[3px] text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-gold)]">
                Limited
              </span>
            </div>
          )}
          {model && (
            <Product3DViewer
              url={model}
              name={strain.name}
              className={`absolute inset-0 h-full w-full ${soldOut ? "opacity-50" : ""}`}
            />
          )}
        </div>

        {/* Info band */}
        <div className="flex flex-[3] flex-col justify-between gap-3 border-t border-[color:var(--border-subtle)] p-5">
          <div>
            <h3 className="font-display text-[1.5rem] font-normal leading-none text-[color:var(--text-primary)]">
              {strain.name}
            </h3>
            <p className="meta-xs mt-2 text-[color:var(--text-tertiary)]">
              Infused · {strain.weight_grams ?? 0.75}g
            </p>
            <p className="mt-3 font-body text-[1rem] font-semibold text-[color:var(--text-primary)]">
              R{Number(strain.price_zar).toFixed(0)}
            </p>
          </div>
          <span className="inline-flex w-full items-center justify-center rounded-[4px] border border-[color:var(--text-primary)] px-4 py-2.5 font-body text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-primary)] transition-colors duration-300 group-hover:bg-[color:var(--accent-gold-muted)]">
            {soldOut ? "Notify me when back" : "View strain"}
          </span>
        </div>
      </div>
    </Link>
  );
}
