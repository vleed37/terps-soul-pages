import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { getStrainProductImage } from "@/lib/strain-assets";
import { StrainTypePill } from "./StrainTypePill";
import type { Strain } from "@/lib/types";

function CornerOrnament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`pointer-events-none absolute h-4 w-4 text-[color:var(--accent-gold)] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M2 2 L22 2 M2 2 L2 22" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}

export function CaviarStixCard({ strain }: { strain: Strain }) {
  const img = getStrainProductImage(strain.slug);
  const soldOut = strain.stock_quantity <= 0;
  const isLimited = !!strain.is_limited && !soldOut;

  return (
    <Link
      to="/strain/$slug"
      params={{ slug: strain.slug }}
      className="group relative block overflow-hidden rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-elevated)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
    >
      {/* Ornamental corner flourishes */}
      <CornerOrnament className="left-2 top-2" />
      <CornerOrnament className="right-2 top-2 rotate-90" />
      <CornerOrnament className="bottom-2 left-2 -rotate-90" />
      <CornerOrnament className="bottom-2 right-2 rotate-180" />

      <div className="flex aspect-[3/4] w-full flex-col">
        {/* Premium specimen surface — slightly darker, more atmospheric */}
        <div
          className="relative flex-[7] overflow-hidden"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${strain.accent_color_primary ?? "#283526"}22, var(--bg-rich) 75%)`,
          }}
        >
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            {strain.strain_type && <StrainTypePill type={strain.strain_type} />}
          </div>
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-[color:var(--accent-gold-muted)] px-2 py-[3px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-gold)]">
              ✦ Premium
            </span>
            {isLimited && (
              <span className="inline-block rounded-[4px] border border-[color:var(--accent-gold)] px-2 py-[3px] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-gold)]">
                Limited
              </span>
            )}
          </div>
          {img && (
            <motion.img
              src={img}
              alt={strain.name}
              loading="lazy"
              className="absolute left-1/2 top-1/2 max-h-[88%] w-auto -translate-x-1/2 -translate-y-1/2 select-none transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              initial={{ opacity: 0 }}
              animate={{ opacity: soldOut ? 0.5 : 1 }}
              transition={{ duration: 0.7 }}
              draggable={false}
            />
          )}
        </div>

        {/* Info band — premium typography scale */}
        <div className="flex flex-[3] flex-col justify-between gap-3 border-t border-[color:var(--border-luxe)] p-6">
          <div>
            <p className="meta-xs text-[color:var(--accent-gold)]">
              {strain.strain_type ?? "Caviar"} · Caviar Stix
            </p>
            <h3 className="mt-2 font-display text-[1.875rem] font-normal leading-[1.05] text-[color:var(--text-primary)]">
              {strain.name.replace("Caviar Stix — ", "")}
            </h3>
            <p className="mt-3 font-body text-[1.05rem] font-semibold text-[color:var(--text-primary)]">
              R{Number(strain.price_zar).toFixed(0)}
            </p>
          </div>
          <span className="inline-flex w-full items-center justify-center rounded-[4px] border border-[color:var(--accent-gold)] px-4 py-2.5 font-body text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-gold)] transition-colors duration-300 group-hover:bg-[color:var(--accent-gold-muted)]">
            {soldOut ? "Notify me when back" : "Explore Stix"}
          </span>
        </div>
      </div>
    </Link>
  );
}