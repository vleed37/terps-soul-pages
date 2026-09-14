import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  Citrus,
  Apple,
  TreePine,
  Flame,
  Flower2,
  Leaf,
  Sparkles,
  Wheat,
} from "lucide-react";
import { listTerpenes } from "@/lib/terpenes.functions";
import { listStrains } from "@/lib/strains.functions";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import { getStrainProductImage } from "@/lib/strain-assets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Strain, Terpene } from "@/lib/types";
import { seoMeta } from "@/lib/seo";
import { GridSkeleton } from "@/components/layout/PageSkeletons";

const terpenesQuery = queryOptions({
  queryKey: ["terpenes", "all"],
  queryFn: () => listTerpenes(),
});
const strainsQuery = queryOptions({
  queryKey: ["strains", "all"],
  queryFn: () => listStrains(),
});

export const Route = createFileRoute("/strains")({
  head: () => ({
    meta: seoMeta({
      title: "Strain Library · Terps",
      description:
        "The Terps strain library — terpenes, flavour families, strain types and effect classifications for every release.",
      path: "/strains",
    }),
  }),

  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(terpenesQuery),
      context.queryClient.ensureQueryData(strainsQuery),
    ]);
  },
  pendingComponent: () => <GridSkeleton count={6} />,
  pendingMs: 0,
  component: StrainsPage,
});

const TERPENE_ICON: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  limonene: Citrus,
  myrcene: Apple,
  pinene: TreePine,
  caryophyllene: Flame,
  linalool: Flower2,
  humulene: Leaf,
  terpinolene: Sparkles,
  ocimene: Wheat,
};

const EFFECT_COPY: Record<string, { label: string; body: string }> = {
  daytime: {
    label: "Daytime",
    body: "Bright, citrus-forward flavour profiles we group as daytime.",
  },
  balanced: {
    label: "Balanced",
    body: "Even flavour profiles that sit between the two — our daily rotation.",
  },
  nighttime: {
    label: "Nighttime",
    body: "Richer, deeper flavour profiles we group as nighttime.",
  },
};

const FAQS = [
  {
    q: "What's the difference between an Infused Pre-Roll and a Caviar Stick?",
    a: "An Infused Pre-Roll is infused on the inside. A Caviar Stick is infused inside and finished on the outside with live rosin and hash, which makes it richer and slower-burning.",
  },
  {
    q: "How do I store them?",
    a: "Keep the tube sealed, upright, somewhere cool and dark. Out of direct sunlight, out of the fridge. The tube is the storage — leave it in there until you're ready to smoke.",
  },
  {
    q: "Where can I buy Terps?",
    a: "Order directly from this site, or find a stockist near you on our Stockists page. New stores are added as they come on board.",
  },
  {
    q: "How do I become a stockist?",
    a: "Sign up on our Wholesale page. You'll get straight into the stockist portal, where you can see box pricing and place orders.",
  },
];



function StrainsPage() {
  const { data: terpenesData } = useSuspenseQuery(terpenesQuery);
  const { data: strainsData } = useSuspenseQuery(strainsQuery);
  const terpenes = (terpenesData ?? []) as unknown as Terpene[];
  const strains = (strainsData ?? []) as unknown as Strain[];

  const bySlug = new Map(strains.map((s) => [s.slug, s] as const));
  const byEffect = (e: string) => strains.filter((s) => s.effect_category === e);

  return (
    <div className="px-6 py-20 md:px-12 md:py-28">
      {/* HERO */}
      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <MetaLabel gold>✦ The Strain Library</MetaLabel>
        <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-[5.5rem]">
          The <em className="text-[color:var(--accent-gold)]">language</em> of flavour.
        </h1>
        <p className="mx-auto mt-6 max-w-[700px] text-base text-[color:var(--text-secondary)] md:text-lg">
          Every cannabis flavour — every nuance of every high — comes down to terpenes. This is your guide.
        </p>
      </ScrollReveal>

      {/* SECTION 1 — TERPENE INDEX */}
      <section className="mx-auto mt-28 max-w-[1400px]">
        <ScrollReveal>
          <MetaLabel gold>✦ Terpene Index</MetaLabel>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">Eight terpenes. Endless combinations.</h2>
        </ScrollReveal>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {terpenes.map((t, i) => {
            const Icon = TERPENE_ICON[t.slug] ?? Sparkles;
            const found = (t.found_in_strain_slugs ?? [])
              .map((slug) => bySlug.get(slug))
              .filter(Boolean) as Strain[];
            return (
              <ScrollReveal key={t.id} delay={Math.min(i, 5) * 0.06}>
                <article className="h-full rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-10">
                  <Icon size={32} strokeWidth={1.5} className="text-[color:var(--accent-gold)]" />
                  <Hairline className="mt-6 w-12" />
                  <h3 className="mt-6 font-display text-3xl">{t.name}</h3>
                  {t.tastes_like && (
                    <div className="mt-3">
                      <MetaLabel gold>Tastes like</MetaLabel>
                      <p className="mt-1 font-display italic text-[color:var(--text-primary)]">{t.tastes_like}</p>
                    </div>
                  )}
                  <p className="mt-5 text-sm leading-[1.8] text-[color:var(--text-secondary)]">
                    {t.long_description ?? t.short_descriptor}
                  </p>
                  {found.length > 0 && (
                    <div className="mt-6">
                      <MetaLabel>Found in</MetaLabel>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {found.map((s) => (
                          <Link
                            key={s.id}
                            to="/strain/$slug"
                            params={{ slug: s.slug }}
                            className="inline-block rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-xs hover:border-[color:var(--accent-gold)] hover:text-[color:var(--accent-gold)] transition-colors"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* SECTION 1b — BY STRAIN TYPE */}
      <section className="mx-auto mt-32 max-w-[1200px]">
        <ScrollReveal className="text-center">
          <MetaLabel gold>✦ By Strain Type</MetaLabel>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">Three lineages. One craft.</h2>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {([
            {
              type: "sativa" as const,
              title: "Sativa",
              body: "Lifted energy. Sharp clarity. For the morning, the studio, the start.",
            },
            {
              type: "hybrid" as const,
              title: "Hybrid",
              body: "Balanced and versatile. For any moment, any session.",
            },
            {
              type: "indica" as const,
              title: "Indica",
              body: "Slow, deep, profound. For the after-dinner sit-down.",
            },
          ]).map((panel, i) => (
            <ScrollReveal key={panel.type} delay={i * 0.08}>
              <Link
                to="/shop/infused-pre-rolls"
                search={{ strain_type: [panel.type] }}

                className="group block h-full rounded-lg border border-[color:var(--border-luxe)] p-10 transition-all duration-500 hover:-translate-y-1"
                style={{ backgroundColor: `var(--strain-${panel.type}-bg)` }}
              >
                <p
                  className="meta-xs"
                  style={{ color: `var(--strain-${panel.type})` }}
                >
                  {panel.title}
                </p>
                <h3
                  className="mt-4 font-display text-4xl"
                  style={{ color: `var(--strain-${panel.type})` }}
                >
                  {panel.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.65] text-[color:var(--text-secondary)]">
                  {panel.body}
                </p>
                <p
                  className="mt-8 font-display italic"
                  style={{ color: `var(--strain-${panel.type})` }}
                >
                  Explore {panel.title.toLowerCase()} strains →
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* SECTION 2 — EFFECT CLASSIFICATION */}
      <section className="mx-auto mt-32 max-w-[1200px]">
        <ScrollReveal className="text-center">
          <MetaLabel gold>✦ Effect Classification</MetaLabel>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">How we group flavour.</h2>
          <p className="mx-auto mt-5 max-w-[640px] text-base leading-[1.8] text-[color:var(--text-secondary)]">
            These groupings describe flavour character and how we tend to reach for a strain. They
            are not a promise of any physical or psychological effect.
          </p>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {(["daytime", "balanced", "nighttime"] as const).map((eff, i) => {
            const copy = EFFECT_COPY[eff];
            const items = byEffect(eff);
            return (
              <ScrollReveal key={eff} delay={i * 0.08}>
                <div className="h-full rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-8">
                  <MetaLabel gold>{copy.label}</MetaLabel>
                  <p className="mt-4 text-sm leading-[1.7] text-[color:var(--text-secondary)]">
                    {copy.body}
                  </p>
                  {items.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {items.map((s) => (
                        <Link
                          key={s.id}
                          to="/strain/$slug"
                          params={{ slug: s.slug }}
                          className="inline-block rounded-full border border-[color:var(--accent-gold)]/40 px-3 py-1 text-xs text-[color:var(--accent-gold)] transition-colors hover:bg-[color:var(--accent-gold-muted)]"
                        >
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>




      {/* SECTION 3 — EVERY STRAIN */}
      <section className="mx-auto mt-32 max-w-[1200px]">
        <ScrollReveal className="text-center">
          <MetaLabel gold>✦ Every Strain</MetaLabel>
          <h2 className="mt-4 font-display text-4xl font-semibold md:text-5xl">The full library.</h2>
        </ScrollReveal>
        <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
          {strains.map((s, i) => {
            const img = getStrainProductImage(s.slug);
            const soldOut = s.stock_quantity <= 0;
            return (
              <ScrollReveal key={s.id} delay={Math.min(i, 5) * 0.06}>
                <Link
                  to="/strain/$slug"
                  params={{ slug: s.slug }}
                  className="group block overflow-hidden rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {img && (
                      <img
                        src={img}
                        alt={s.name}
                        loading="lazy"
                        className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
                          soldOut ? "opacity-60" : ""
                        }`}
                      />
                    )}
                    {soldOut && (
                      <span className="absolute left-3 top-3 rounded-[4px] bg-[color:var(--bg-rich)]/80 px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-on-dark)]">
                        Sold out
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl leading-tight">{s.name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--text-tertiary)]">
                      {s.strain_type ?? s.effect_category}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </section>


      {/* SECTION 4 — FAQ */}
      <section className="mx-auto mt-32 max-w-3xl">
        <ScrollReveal className="text-center">
          <MetaLabel gold>✦ FAQ</MetaLabel>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">Questions, answered.</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-12">
            {FAQS.map((f) => (
              <AccordionItem
                key={f.q}
                value={f.q}
                className="border-b border-[color:var(--border-subtle)]"
              >
                <AccordionTrigger className="py-6 text-left font-display text-xl hover:no-underline md:text-2xl">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-base leading-[1.8] text-[color:var(--text-secondary)]">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </section>
    </div>
  );
}
