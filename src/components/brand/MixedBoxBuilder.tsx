import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { GoldButton } from "@/components/brand/GoldButton";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { useWholesaleCart } from "@/lib/store/wholesale-cart";
import { formatTierRange, wholesaleBoxPrice } from "@/lib/wholesale-pricing";
import type { WholesaleMixedBoxLineOption } from "@/lib/types";

/**
 * Build one completely-filled box from any mix of a single product line's products.
 * Never crosses product lines; "Add to order" unlocks only on an exact full box.
 */
export function MixedBoxBuilder({ line }: { line: WholesaleMixedBoxLineOption }) {
  const addMixedBox = useWholesaleCart((s) => s.addMixedBox);
  const [units, setUnits] = useState<Record<string, number>>({});
  const [boxes, setBoxes] = useState(line.minimum_boxes || 1);

  const total = useMemo(
    () => Object.values(units).reduce((a, n) => a + n, 0),
    [units],
  );
  const remaining = line.units_per_box - total;
  const complete = remaining === 0;
  const boxPrice = wholesaleBoxPrice(line.tiers, boxes);

  function bump(strainId: string, delta: number) {
    setUnits((prev) => {
      const current = prev[strainId] ?? 0;
      const next = Math.max(0, Math.min(current + delta, current + Math.max(0, remaining)));
      if (next === current) return prev;
      return { ...prev, [strainId]: next };
    });
  }

  function onAdd() {
    if (!complete) return;
    const composition = line.strains
      .filter((s) => (units[s.id] ?? 0) > 0)
      .map((s) => ({
        strainId: s.id,
        name: s.name,
        units: units[s.id]!,
        imageUrl: s.product_image_url,
      }));

    addMixedBox(
      {
        productLine: line.product_line,
        composition,
        tiers: line.tiers,
        boxQuantity: line.units_per_box,
        minimumBoxes: line.minimum_boxes,
      },
      boxes,
    );
    setUnits({});
    setBoxes(line.minimum_boxes || 1);
    toast.success(
      `${boxes} mixed ${line.label} box${boxes > 1 ? "es" : ""} added to your order`,
    );
  }

  return (
    <section className="rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <MetaLabel gold>Build a mixed box</MetaLabel>
          <h3 className="mt-2 font-display text-2xl">{line.label}</h3>
          <p className="mt-2 max-w-xl text-sm text-[color:var(--text-secondary)]">
            Fill one box with any mix of {line.label.toLowerCase()}. A box holds exactly{" "}
            {line.units_per_box} units and cannot mix product lines.
          </p>
        </div>
        <div className="text-right">
          <p
            aria-live="polite"
            className={`font-display text-3xl ${complete ? "text-[color:var(--accent-gold)]" : ""}`}
          >
            {total} / {line.units_per_box}
          </p>
          <p className="meta-xs text-[color:var(--text-tertiary)]">
            {complete ? "BOX FULL" : `${remaining} UNITS TO GO`}
          </p>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {line.strains.map((s) => {
          const value = units[s.id] ?? 0;
          return (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-[4px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] p-3"
            >
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[4px] bg-[color:var(--bg-surface)]">
                {s.product_image_url && (
                  <img src={s.product_image_url} alt={s.name} className="h-full w-full object-cover" />
                )}
              </div>
              <p className="min-w-0 flex-1 font-display text-base leading-tight">{s.name}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bump(s.id, -1)}
                  disabled={value === 0}
                  aria-label={`Remove one unit of ${s.name}`}
                  className="grid h-8 w-8 place-items-center rounded border border-[color:var(--border-luxe)] transition-colors hover:border-[color:var(--accent-gold)] disabled:opacity-40"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[2ch] text-center font-semibold">{value}</span>
                <button
                  type="button"
                  onClick={() => bump(s.id, 1)}
                  disabled={remaining === 0}
                  aria-label={`Add one unit of ${s.name}`}
                  className="grid h-8 w-8 place-items-center rounded border border-[color:var(--border-luxe)] transition-colors hover:border-[color:var(--accent-gold)] disabled:opacity-40"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-[4px] border border-[color:var(--border-subtle)] p-3">
        <p className="meta-xs text-[color:var(--text-tertiary)]">VOLUME PRICING</p>
        <ul className="mt-2 space-y-1">
          {line.tiers.map((t) => {
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="meta-xs text-[color:var(--text-tertiary)]">BOXES</span>
          <div className="flex items-center gap-2 rounded-[4px] border border-[color:var(--border-luxe)] px-2 py-1">
            <button
              type="button"
              onClick={() => setBoxes((b) => Math.max(line.minimum_boxes || 1, b - 1))}
              aria-label="Fewer boxes"
              className="grid h-7 w-7 place-items-center text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[2ch] text-center font-semibold">{boxes}</span>
            <button
              type="button"
              onClick={() => setBoxes((b) => b + 1)}
              aria-label="More boxes"
              className="grid h-7 w-7 place-items-center text-[color:var(--text-secondary)] hover:text-[color:var(--accent-gold)]"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="text-sm text-[color:var(--text-secondary)]">
            R{boxPrice.toFixed(0)} / box
          </span>
        </div>
        <GoldButton onClick={onAdd} disabled={!complete} size="sm">
          {complete ? "Add to Order" : `Add ${remaining} more unit${remaining === 1 ? "" : "s"}`}
        </GoldButton>
      </div>
    </section>
  );
}
