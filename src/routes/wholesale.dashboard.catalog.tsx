import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { listWholesaleStrains } from "@/lib/wholesale.functions";
import { GoldButton } from "@/components/brand/GoldButton";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { StrainTypePill } from "@/components/brand/StrainTypePill";
import { useWholesaleCart } from "@/lib/store/wholesale-cart";
import { toast } from "sonner";
import type { WholesaleStrain } from "@/lib/types";
import { GridSkeleton } from "@/components/layout/PageSkeletons";

export const Route = createFileRoute("/wholesale/dashboard/catalog")({
  head: () => ({ meta: [{ title: "Terps — Wholesale Catalog" }] }),
  component: CatalogPage,
});

function CatalogPage() {
  const fetchStrains = useServerFn(listWholesaleStrains);
  const { data, isLoading } = useQuery({
    queryKey: ["wholesale-strains"],
    queryFn: () => fetchStrains(),
  });

  if (isLoading) return <GridSkeleton count={8} />;
  const strains = data ?? [];

  return (
    <div>
      <div className="mb-8">
        <MetaLabel gold>Catalog</MetaLabel>
        <h2 className="mt-3 font-display text-3xl md:text-4xl">Box pricing for stockists.</h2>
        <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
          All prices are wholesale box rate, excluding VAT and shipping.
        </p>
      </div>
      {strains.length === 0 ? (
        <div className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-12 text-center text-sm text-[color:var(--text-tertiary)]">
          No wholesale products available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {strains.map((s) => <WholesaleStrainCard key={s.id} s={s} />)}
        </div>
      )}
    </div>
  );
}

function WholesaleStrainCard({ s }: { s: WholesaleStrain }) {
  const addItem = useWholesaleCart((st) => st.addItem);
  const [boxes, setBoxes] = useState(s.minimum_boxes || 1);
  const boxPrice = resolveTierPrice(s.tiers, boxes);
  const unitPrice = s.units_per_box > 0 ? boxPrice / s.units_per_box : 0;

  function onAdd() {
    addItem({
      strainId: s.id,
      slug: s.slug,
      name: s.name,
      imageUrl: s.product_image_url,
      strainType: s.strain_type,
      tiers: s.tiers,
      boxQuantity: s.units_per_box,
      minimumBoxes: s.minimum_boxes,
    }, boxes);
    toast.success(`${boxes} box${boxes > 1 ? "es" : ""} of ${s.name} added`);
  }

  return (
    <div className="flex flex-col rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-5">
      <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[color:var(--bg-elevated)]">
        {s.product_image_url && <img src={s.product_image_url} alt={s.name} className="h-full w-full object-cover" />}
        {s.strain_type && <div className="absolute left-3 top-3"><StrainTypePill type={s.strain_type} /></div>}
      </div>
      <div className="mt-4 flex-1">
        <h3 className="font-display text-xl leading-tight">{s.name}</h3>
        {s.tagline && <p className="mt-1 text-xs italic text-[color:var(--text-tertiary)]">{s.tagline}</p>}
        <p className="mt-3 meta-xs text-[color:var(--accent-gold)]">YOUR BOX PRICE</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-display text-2xl">R{boxPrice.toFixed(0)}</span>
          <span className="text-xs text-[color:var(--text-tertiary)]">/ box</span>
        </div>
        <p className="text-xs text-[color:var(--text-secondary)]">
          {s.units_per_box} units per box · R{unitPrice.toFixed(0)}/unit
        </p>
        <p className="mt-1 text-xs text-[color:var(--text-tertiary)]">
          Recommended retail: R{Number(s.rrp_zar).toFixed(0)}/unit
        </p>

        <div className="mt-4 rounded-[4px] border border-[color:var(--border-subtle)] p-3">
          <p className="meta-xs text-[color:var(--text-tertiary)]">VOLUME PRICING</p>
          <ul className="mt-2 space-y-1">
            {s.tiers.map((t) => {
              const active = boxes >= t.min_boxes && (t.max_boxes == null || boxes <= t.max_boxes);
              return (
                <li
                  key={`${t.min_boxes}-${t.max_boxes ?? "plus"}`}
                  className={`flex justify-between text-xs ${active ? "text-[color:var(--accent-gold)]" : "text-[color:var(--text-secondary)]"}`}
                >
                  <span>{formatTierRange(t)}</span>
                  <span>R{Number(t.price_per_box_zar).toFixed(0)} / box</span>
                </li>
              );
            })}
          </ul>
        </div>

        {s.minimum_boxes > 1 && (
          <p className="mt-2 text-xs text-[color:var(--text-tertiary)]">Min. order: {s.minimum_boxes} boxes</p>
        )}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-[4px] border border-[color:var(--border-luxe)] px-2 py-1">
          <button
            onClick={() => setBoxes((b) => Math.max(s.minimum_boxes || 1, b - 1))}
            className="grid h-7 w-7 place-items-center text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]"
            aria-label="Decrease"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[2ch] text-center font-semibold">{boxes}</span>
          <button
            onClick={() => setBoxes((b) => b + 1)}
            className="grid h-7 w-7 place-items-center text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]"
            aria-label="Increase"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <GoldButton onClick={onAdd} size="sm" className="flex-1">Add to Order</GoldButton>
      </div>
    </div>
  );
}