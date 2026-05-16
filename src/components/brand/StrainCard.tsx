import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { getStrainImage } from "@/lib/strain-assets";
import { EffectChip, StatusBadge } from "./Chips";
import { Hairline } from "./Hairline";
import type { Strain } from "@/lib/types";

const EFFECT_LABEL: Record<string, string> = {
  daytime: "Daytime",
  balanced: "Balanced",
  nighttime: "Nighttime",
};

export function StrainCard({ strain }: { strain: Strain }) {
  const img = getStrainImage(strain.slug);
  const soldOut = strain.stock_quantity <= 0;
  const primary = strain.accent_color_primary ?? "#1F3A2A";
  const accent = strain.accent_color_accent ?? "#6CC840";

  return (
    <Link
      to="/strain/$slug"
      params={{ slug: strain.slug }}
      className="group relative block overflow-hidden rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]"
    >
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-[4/5] w-full"
      >
        {/* radial accent glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 35%, ${accent}22, ${primary}11 45%, transparent 75%), linear-gradient(180deg, ${primary}10, var(--bg-rich) 80%)`,
          }}
        />
        {/* top-left batch + top-right effect */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5">
          <span className="meta-xs text-gold opacity-60">Batch 04</span>
          {soldOut ? (
            <StatusBadge kind="soldout" />
          ) : (
            strain.effect_category && <EffectChip>{EFFECT_LABEL[strain.effect_category]}</EffectChip>
          )}
        </div>
        {/* product image */}
        {img && (
          <motion.img
            src={img}
            alt={strain.name}
            className="absolute left-1/2 top-1/2 max-h-[78%] w-auto -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-[0_18px_36px_rgba(0,0,0,0.6)]"
            style={{ rotate: "5deg" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: soldOut ? 0.6 : 1 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            draggable={false}
          />
        )}
        {/* bottom content */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6">
          <Hairline className="mb-4 w-full" />
          <h3 className="font-display text-[1.75rem] font-normal leading-none text-[color:var(--text-primary)]">
            {strain.name}
          </h3>
          {strain.tagline && (
            <p className="mt-2 font-display text-base italic text-[color:var(--text-secondary)]">
              {strain.tagline}
            </p>
          )}
          <div className="mt-4 flex items-baseline justify-between">
            <span className="font-body text-lg font-bold">R{Number(strain.price_zar).toFixed(0)}</span>
            <span className="meta-xs text-[color:var(--text-tertiary)]">
              {strain.weight_grams ?? 0.75}g · Live rosin
            </span>
          </div>
          <div className="mt-3 flex items-center justify-end">
            <span className="font-display text-sm italic text-[color:var(--accent-gold)] transition-transform duration-400 group-hover:translate-x-1">
              {soldOut ? "Join waitlist →" : "Discover →"}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
