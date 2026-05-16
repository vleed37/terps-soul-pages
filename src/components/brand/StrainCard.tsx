import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { getStrainProductImage } from "@/lib/strain-assets";
import { StatusBadge } from "./Chips";
import type { Strain } from "@/lib/types";

export function StrainCard({ strain }: { strain: Strain }) {
  const img = getStrainProductImage(strain.slug);
  const soldOut = strain.stock_quantity <= 0;
  const accent = strain.accent_color_accent ?? "#6CC840";

  return (
    <Link
      to="/strain/$slug"
      params={{ slug: strain.slug }}
      className="group relative block overflow-hidden rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-[color:var(--accent-gold)]/40 hover:shadow-[0_18px_50px_-12px_rgba(201,168,76,0.25)]"
    >
      <div className="flex aspect-[4/5] w-full flex-col">
        {/* Zone 1 — product hero (60%) */}
        <div className="relative flex-[3] overflow-hidden">
          {/* subtle dark gradient + accent glow upper area */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 60% 40% at 50% 25%, ${accent}18, transparent 70%), linear-gradient(180deg, rgba(255,255,255,0.02), var(--bg-rich) 90%)`,
            }}
          />
          {soldOut && (
            <div className="absolute right-5 top-5 z-10">
              <StatusBadge kind="soldout" />
            </div>
          )}
          {/* product image — centered, upright */}
          {img && (
            <motion.img
              src={img}
              alt={strain.name}
              className="absolute left-1/2 top-1/2 max-h-[88%] w-auto -translate-x-1/2 -translate-y-1/2 select-none rounded-xl drop-shadow-[0_22px_40px_rgba(0,0,0,0.65)] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              initial={{ opacity: 0 }}
              animate={{ opacity: soldOut ? 0.55 : 1 }}
              transition={{ duration: 0.6 }}
              draggable={false}
            />
          )}
        </div>

        {/* gold hairline divider */}
        <div className="h-px w-full bg-[color:var(--accent-gold)]/40" />

        {/* Zone 2 — info band (40%) */}
        <div className="flex flex-[2] flex-col justify-between bg-[color:var(--bg-surface)] p-5">
          <div>
            <h3 className="font-display text-[1.75rem] font-normal leading-none text-[color:var(--text-primary)]">
              {strain.name}
            </h3>
            {strain.tagline && (
              <p className="mt-2 font-display text-[0.95rem] italic text-[color:var(--text-secondary)]">
                {strain.tagline}
              </p>
            )}
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="font-body text-[1.125rem] font-bold leading-none text-[color:var(--text-primary)]">
                R{Number(strain.price_zar).toFixed(0)}
              </span>
              <span className="meta-xs text-[color:var(--text-tertiary)]">
                {strain.weight_grams ?? 0.75}g · Live rosin
              </span>
            </div>
            <span className="font-display text-sm italic text-[color:var(--accent-gold)] transition-transform duration-400 ease-out group-hover:translate-x-1">
              {soldOut ? "Join waitlist →" : "Discover →"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
