import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { GoldButton } from "@/components/brand/GoldButton";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { useWholesaleCart } from "@/lib/store/wholesale-cart";
import { resolveTierPrice, type WholesalePriceTier } from "@/lib/wholesale-pricing";
import type { WholesaleStrain } from "@/lib/types";
import type { ProductLine } from "@/lib/product-lines";

/**
 * Build one variety box from strains in a single product family. A box must be
 * filled to exactly the family's box size; the server revalidates composition
 * and recalculates the price on checkout.
 */
export function MixedBoxBuilder({
  productLine,
  title,
  strains,
}: {
  productLine: ProductLine;
  title: string;
  strains: WholesaleStrain[];
}) {
  const addMixedBox = useWholesaleCart((s) => s.addMixedBox);
  const [units, setUnits] = useState<Record<string, number>>({});
  const [boxes, setBoxes] = useState(1);

  const boxQuantity = strains[0]?.units_per_box ?? 20;
  const totalUnits = Object.values(units).reduce((a, n) => a + n, 0);
  const remaining = boxQuantity - totalUnits;
  const chosen = strains.filter((s) => (units[s.id] ?? 0) > 0);
  const ready = remaining === 0 && chosen.length >= 2;

  /** Units-weighted tier ladder — display only. */
  const tiers = useMemo<WholesalePriceTier[]>(() => {
    const base = strains[0]?.tiers ?? [];
    if (!base.length || totalUnits === 0) return [];
    return base.map((t) => ({
      min_boxes: t.min_boxes,
      max_boxes: t.max_boxes,
      price_per_box_zar: Number(
        chosen
          .reduce((a, s) => {
            const per = resolveTierPrice(s.tiers, t.min_boxes);
            return a + (per / boxQuantity) * (units[s.id] ?? 0);
          }, 0)
          .toFixed(2),
      ),
    }));
  }, [strains, chosen, units, boxQuantity, totalUnits]);

  const boxPrice = resolveTierPrice(tiers, boxes);

  function setUnit(id: string, next: number) {
    setUnits((prev) => {
      const clamped = Math.max(0, next);
      const others = Object.entries(prev).reduce(
        (a, [k, v]) => (k === id ? a : a + v),
        0,
      );
      const allowed = Math.min(clamped, boxQuantity - others);
      const out = { ...prev, [id]: allowed };
      if (allowed === 0) delete out[id];
      return out;
    });
  }

  function onAdd() {
    if (!ready) return;
    addMixedBox({
      productLine,
      boxQuantity,
      tiers,
      boxes,
      composition: chosen.map((s) => ({
        strainId: s.id,
        slug: s.slug,
        name: s.name,
        units: units[s.id] ?? 0,
      })),
    });
    toast.success(`${boxes} variety box${boxes > 1 ? "es" : ""} added`);
    setUnits({});
    setBoxes(1);
  }

  if (strains.length < 2) return null;

  const pct = Math.min(100, Math.round((totalUnits / boxQuantity) * 100));

  return (
    <section className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-6">
      <MetaLabel gold>Variety box</MetaLabel>
      <h3 className="mt-3 font-display text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
        Mix strains from this range into one box of {boxQuantity} units. Choose at least
        two strains and fill the box exactly.
      </p>

      <div className="mt-5">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--bg-elevated)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={boxQuantity}
          aria-valuenow={totalUnits}
          aria-label={`${totalUnits} of ${boxQuantity} units selected`}
        >
          <div
            className="h-full bg-[color:var(--accent-gold)] transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p aria-live="polite" className="mt-2 text-xs text-[color:var(--text-secondary)]">
          {totalUnits} of {boxQuantity} units selected
          {remaining > 0 ? ` · ${remaining} to go` : remaining === 0 ? " · box full" : ""}
        </p>
      </div>

      <ul className="mt-5 divide-y divide-[color:var(--border-subtle)]">
        {strains.map((s) => {
          const n = units[s.id] ?? 0;
          return (
            <li key={s.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="font-display text-base leading-tight">{s.name}</p>
                <p className="meta-xs text-[color:var(--text-tertiary)]">
                  {s.strain_type ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-[4px] border border-[color:var(--border-luxe)] px-2 py-1">
                <button
                  type="button"
                  onClick={() => setUnit(s.id, n - 1)}
                  disabled={n === 0}
                  aria-label={`Remove one unit of ${s.name}`}
                  className="grid h-8 w-8 place-items-center text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)] disabled:opacity-30"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[2ch] text-center font-semibold">{n}</span>
                <button
                  type="button"
                  onClick={() => setUnit(s.id, n + 1)}
                  disabled={remaining <= 0}
                  aria-label={`Add one unit of ${s.name}`}
                  className="grid h-8 w-8 place-items-center text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)] disabled:opacity-30"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="meta-xs text-[color:var(--accent-gold)]">YOUR BOX PRICE</p>
          <p className="font-display text-2xl">
            {ready ? `R${boxPrice.toFixed(0)}` : "—"}
            <span className="ml-1 text-xs text-[color:var(--text-tertiary)]">/ box</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-[4px] border border-[color:var(--border-luxe)] px-2 py-1">
            <button
              type="button"
              onClick={() => setBoxes((b) => Math.max(1, b - 1))}
              aria-label="Fewer variety boxes"
              className="grid h-8 w-8 place-items-center text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[2ch] text-center font-semibold">{boxes}</span>
            <button
              type="button"
              onClick={() => setBoxes((b) => b + 1)}
              aria-label="More variety boxes"
              className="grid h-8 w-8 place-items-center text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <GoldButton onClick={onAdd} size="sm" disabled={!ready}>
            Add to Order
          </GoldButton>
        </div>
      </div>
      {!ready && (
        <p className="mt-3 text-xs text-[color:var(--text-tertiary)]">
          {chosen.length < 2
            ? "Pick at least two strains."
            : `Add ${remaining} more unit${remaining === 1 ? "" : "s"} to fill the box.`}
        </p>
      )}
    </section>
  );
}
