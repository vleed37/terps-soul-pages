import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { StrainCard } from "@/components/brand/StrainCard";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import { StrainTypeDot } from "@/components/brand/StrainTypePill";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Strain } from "@/lib/types";
import {
  AVAILABILITY,
  EFFECTS,
  FLAVORS,
  STRAIN_TYPES,
  applyShopFilters,
  toggleArr,
  type ShopSearch,
} from "@/lib/shop-filters";
import { lineMeta, type ProductLine } from "@/lib/product-lines";

interface Props {
  line: ProductLine;
  strains: Strain[];
  search: ShopSearch;
  onSearchChange: (partial: ShopSearch) => void;
  onReset: () => void;
}

const AVAIL_LABEL: Record<(typeof AVAILABILITY)[number], string> = {
  in: "In stock",
  limited: "Limited",
  soldout: "Sold out",
};

export function CategoryCollection({ line, strains, search, onSearchChange, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const meta = lineMeta(line);

  const effect = search.effect ?? [];
  const flavor = search.flavor ?? [];
  const avail = search.avail ?? [];
  const strainType = search.strain_type ?? [];
  const min = search.min ?? 0;
  const max = search.max ?? 500;
  const sort = search.sort ?? "featured";

  const inLine = useMemo(() => strains.filter((s) => s.product_line === line), [strains, line]);
  const filtered = useMemo(() => applyShopFilters(inLine, search), [inLine, search]);

  return (
    <section className="pb-16 md:pb-28">
      <div className="mx-auto max-w-[1400px] px-6 pt-12 md:px-12 md:pt-16">
        <Link to="/shop" className="ghost-link">
          ← Our Collection
        </Link>

        <ScrollReveal className="mt-8 max-w-[760px]">
          <MetaLabel gold>✦ {meta.plural}</MetaLabel>
          <h1 className="mt-4 font-display text-[2.75rem] font-semibold leading-[1.05] md:text-7xl">
            {meta.title}
          </h1>
          <p className="mt-6 font-body text-base leading-[1.85] text-[color:var(--text-secondary)] md:text-lg">
            {meta.description}
          </p>
        </ScrollReveal>

        {/* Filter + sort bar */}
        <div className="mt-12">
          <Hairline />
          <Collapsible open={open} onOpenChange={setOpen}>
            <div className="flex items-center justify-between py-4">
              <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]">
                <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden="true" />
                Filter
                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
              <MetaLabel className="hidden md:inline">
                Showing {filtered.length} {filtered.length === 1 ? "product" : "products"}
              </MetaLabel>
              <Select
                value={sort}
                onValueChange={(v) => onSearchChange({ sort: v as ShopSearch["sort"] })}
              >
                <SelectTrigger
                  aria-label="Sort products"
                  className="w-[180px] border-[color:var(--border-subtle)] bg-transparent text-xs uppercase tracking-[0.15em]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price ↑</SelectItem>
                  <SelectItem value="price-desc">Price ↓</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CollapsibleContent>
              <div className="grid grid-cols-1 gap-10 pb-8 pt-2 md:grid-cols-5">
                <div>
                  <MetaLabel gold>Strain type</MetaLabel>
                  <div className="mt-4 flex flex-col gap-3">
                    {STRAIN_TYPES.map((t) => (
                      <label
                        key={t}
                        className="flex cursor-pointer items-center gap-3 text-sm capitalize"
                      >
                        <Checkbox
                          checked={strainType.includes(t)}
                          onCheckedChange={() =>
                            onSearchChange({ strain_type: toggleArr(strainType, t) })
                          }
                        />
                        <StrainTypeDot type={t} />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <MetaLabel gold>Effect</MetaLabel>
                  <div className="mt-4 flex flex-col gap-3">
                    {EFFECTS.map((e) => (
                      <label
                        key={e}
                        className="flex cursor-pointer items-center gap-3 text-sm capitalize"
                      >
                        <Checkbox
                          checked={effect.includes(e)}
                          onCheckedChange={() => onSearchChange({ effect: toggleArr(effect, e) })}
                        />
                        {e}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <MetaLabel gold>Flavour family</MetaLabel>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {FLAVORS.map((f) => (
                      <label
                        key={f}
                        className="flex cursor-pointer items-center gap-2 text-sm capitalize"
                      >
                        <Checkbox
                          checked={flavor.includes(f)}
                          onCheckedChange={() => onSearchChange({ flavor: toggleArr(flavor, f) })}
                        />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <MetaLabel gold>Price (ZAR)</MetaLabel>
                  <div className="mt-6 px-1">
                    <Slider
                      min={0}
                      max={500}
                      step={10}
                      value={[min, max]}
                      onValueChange={([lo, hi]) => onSearchChange({ min: lo, max: hi })}
                    />
                    <div className="mt-3 flex justify-between text-xs text-[color:var(--text-tertiary)]">
                      <span>R{min}</span>
                      <span>R{max}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <MetaLabel gold>Availability</MetaLabel>
                  <div className="mt-4 flex flex-col gap-3">
                    {AVAILABILITY.map((v) => (
                      <label key={v} className="flex cursor-pointer items-center gap-3 text-sm">
                        <Checkbox
                          checked={avail.includes(v)}
                          onCheckedChange={() => onSearchChange({ avail: toggleArr(avail, v) })}
                        />
                        {AVAIL_LABEL[v]}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pb-8">
                <button
                  onClick={onReset}
                  className="font-display text-sm italic text-[color:var(--accent-gold)] hover:underline"
                >
                  Clear filters →
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <Hairline />
        </div>

        {/* Grid */}
        <div className="mt-12">
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-2xl italic text-[color:var(--text-secondary)] md:text-3xl">
                Nothing matches that combination.
              </p>
              <button
                onClick={onReset}
                className="mt-8 font-display text-sm italic text-[color:var(--accent-gold)] hover:underline"
              >
                Reset filters →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s, i) => (
                <ScrollReveal key={s.id} delay={Math.min(i, 5) * 0.08}>
                  <StrainCard strain={s} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
