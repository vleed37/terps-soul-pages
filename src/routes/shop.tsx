import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { listStrains } from "@/lib/strains.functions";
import { StrainCard } from "@/components/brand/StrainCard";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
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

const strainsQuery = queryOptions({
  queryKey: ["strains", "all"],
  queryFn: () => listStrains(),
});

const EFFECTS = ["daytime", "balanced", "nighttime"] as const;
const FLAVORS = ["citrus", "berry", "earthy", "sweet", "tropical", "pine", "floral"] as const;
const SORT = ["featured", "price-asc", "price-desc", "name"] as const;

const searchSchema = z.object({
  effect: z.array(z.enum(EFFECTS)).optional(),
  flavor: z.array(z.enum(FLAVORS)).optional(),
  avail: z.array(z.enum(["in", "limited", "soldout"])).optional(),
  min: z.coerce.number().min(0).max(500).optional(),
  max: z.coerce.number().min(0).max(500).optional(),
  sort: z.enum(SORT).optional(),
});

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "The Collection — Terps" },
      { name: "description", content: "Four lab-verified, hand-infused live rosin pre-rolls. Filter by effect, flavor, and price." },
      { property: "og:title", content: "The Collection — Terps" },
      { property: "og:description", content: "Four lab-verified, hand-infused live rosin pre-rolls. Browse the full Terps collection." },
    ],
  }),
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(strainsQuery),
  component: ShopPage,
});

function ShopPage() {
  const { data } = useSuspenseQuery(strainsQuery);
  const strains = (data ?? []) as unknown as Strain[];
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [open, setOpen] = useState(false);

  const effect = search.effect ?? [];
  const flavor = search.flavor ?? [];
  const avail = search.avail ?? [];
  const min = search.min ?? 0;
  const max = search.max ?? 500;
  const sort = search.sort ?? "featured";

  const setSearch = (partial: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...partial }) });

  const toggleArr = <T extends string>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const filtered = useMemo(() => {
    let list = strains.filter((s) => {
      if (effect.length && (!s.effect_category || !effect.includes(s.effect_category)))
        return false;
      if (flavor.length) {
        const tags = (s.flavor_tags ?? []).map((t) => t.toLowerCase());
        if (!flavor.some((f: string) => tags.some((t) => t.includes(f)))) return false;
      }
      if (avail.length) {
        const isSold = s.stock_quantity <= 0;
        const isLim = !!s.is_limited && !isSold;
        const isIn = !isSold && !isLim;
        const pass =
          (avail.includes("in") && isIn) ||
          (avail.includes("limited") && isLim) ||
          (avail.includes("soldout") && isSold);
        if (!pass) return false;
      }
      const price = Number(s.price_zar);
      if (price < min || price > max) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price_zar) - Number(b.price_zar);
      if (sort === "price-desc") return Number(b.price_zar) - Number(a.price_zar);
      if (sort === "name") return a.name.localeCompare(b.name);
      // featured: featured first, then display_order
      const fa = a.is_featured ? 0 : 1;
      const fb = b.is_featured ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });
    return list;
  }, [strains, effect, flavor, avail, min, max, sort]);

  const reset = () =>
    navigate({ search: {} });

  const FilterPanel = (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
      <div>
        <MetaLabel gold>Effect</MetaLabel>
        <div className="mt-4 flex flex-col gap-3">
          {EFFECTS.map((e) => (
            <label key={e} className="flex items-center gap-3 text-sm capitalize cursor-pointer">
              <Checkbox
                checked={effect.includes(e)}
                onCheckedChange={() => setSearch({ effect: toggleArr(effect, e) })}
              />
              {e}
            </label>
          ))}
        </div>
      </div>
      <div>
        <MetaLabel gold>Flavor family</MetaLabel>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {FLAVORS.map((f) => (
            <label key={f} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
              <Checkbox
                checked={flavor.includes(f)}
                onCheckedChange={() => setSearch({ flavor: toggleArr(flavor, f) })}
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
            onValueChange={([lo, hi]) => setSearch({ min: lo, max: hi })}
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
          {[
            { v: "in", l: "In stock" },
            { v: "limited", l: "Limited" },
            { v: "soldout", l: "Sold out" },
          ].map((opt) => (
            <label key={opt.v} className="flex items-center gap-3 text-sm cursor-pointer">
              <Checkbox
                checked={avail.includes(opt.v as "in" | "limited" | "soldout")}
                onCheckedChange={() =>
                  setSearch({ avail: toggleArr(avail, opt.v as "in" | "limited" | "soldout") })
                }
              />
              {opt.l}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <ScrollReveal className="text-center">
          <MetaLabel gold>✦ The Collection</MetaLabel>
          <h1 className="mx-auto mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
            Every drop. <em className="text-[color:var(--accent-gold)]">Every flavor.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-[500px] text-base text-[color:var(--text-secondary)] md:text-lg">
            Four strains. Each lab-verified. Each hand-infused with live rosin.
          </p>
        </ScrollReveal>

        {/* Sticky filter + sort bar */}
        <div className="sticky top-20 z-30 mt-16 -mx-6 bg-[color:var(--bg-base)]/95 px-6 backdrop-blur md:-mx-12 md:px-12">
          <Hairline />
          <Collapsible open={open} onOpenChange={setOpen}>
            <div className="flex items-center justify-between py-4">
              <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-primary)] hover:text-[color:var(--accent-gold)]">
                <SlidersHorizontal size={14} strokeWidth={1.5} />
                Filter
                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                  className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
              <MetaLabel className="hidden md:inline">
                Showing {filtered.length} {filtered.length === 1 ? "strain" : "strains"}
              </MetaLabel>
              <Select value={sort} onValueChange={(v) => setSearch({ sort: v as typeof sort })}>
                <SelectTrigger className="w-[180px] border-[color:var(--border-subtle)] bg-transparent text-xs uppercase tracking-[0.15em]">
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
              <div className="pb-8 pt-2">
                {FilterPanel}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={reset}
                    className="font-display text-sm italic text-[color:var(--accent-gold)] hover:underline"
                  >
                    Clear filters →
                  </button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <Hairline />
        </div>

        {/* Grid */}
        <div className="mt-12">
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="font-display text-2xl italic text-[color:var(--text-secondary)] md:text-3xl">
                No drops match that combination.
              </p>
              <button
                onClick={reset}
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
