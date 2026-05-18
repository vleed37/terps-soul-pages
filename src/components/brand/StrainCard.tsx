import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { getStrainProductImage } from "@/lib/strain-assets";
import { StatusBadge } from "./Chips";
import type { Strain } from "@/lib/types";

export function StrainCard({ strain }: { strain: Strain }) {
  const img = getStrainProductImage(strain.slug);
  const soldOut = strain.stock_quantity <= 0;

  return (
    <Link
      to="/strain/$slug"
      params={{ slug: strain.slug }}
      className="group relative block overflow-hidden rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-rich)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex aspect-[4/5] w-full flex-col">
        {/* Product area — clean neutral surface, no gradients */}
        <div className="relative flex-[7] overflow-hidden bg-[color:var(--bg-surface)]">
          {soldOut && (
            <div className="absolute right-4 top-4 z-10">
              <StatusBadge kind="soldout" />
            </div>
          )}
          {img && (
            <motion.img
              src={img}
              alt={strain.name}
              className="absolute left-1/2 top-1/2 max-h-[82%] w-auto -translate-x-1/2 -translate-y-1/2 select-none transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              initial={{ opacity: 0 }}
              animate={{ opacity: soldOut ? 0.5 : 1 }}
              transition={{ duration: 0.6 }}
              draggable={false}
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
            {soldOut ? "Join Waitlist" : "View Strain"}
          </span>
        </div>
      </div>
    </Link>
  );
}
