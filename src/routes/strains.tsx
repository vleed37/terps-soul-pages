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
      title: "Strains · Terps",
      description:
        "The Terps strain library — effects, flavours, terpene profiles, and lab-verified data for every release.",
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

const EFFECT_COPY: Record<string, { label: string; headline: string; body: string }> = {
  daytime: {
    label: "Daytime",
    headline: "Sharp. Focused. Lifted.",
    body: "Daytime strains lift without disorientation. Sharp citrus, fast-acting clarity, and a head-forward feel that keeps you in the room. Built for the work, the conversation, the long afternoon.",
  },
  balanced: {
    label: "Balanced",
    headline: "Even. Versatile. In rotation.",
    body: "Balanced strains are the daily drivers. Enough lift to start your day, enough body to wind it down. Not too far in any direction — just smooth, dialed in, and always in rotation.",
  },
  nighttime: {
    label: "Nighttime",
    headline: "Slow. Rich. Deep.",
    body: "Nighttime strains land in the body. Rich, lingering flavours and a calm that settles in. Built for the after-dinner sit-down, the no-plans evening, the slow conversation.",
  },
};

const FAQS = [
  {
    q: "What is an infused pre-roll?",
    a: "Premium flower with cured hash and crumble worked into it by hand before it's rolled. Not sprayed, not soaked — real concentrate, mixed in, so the flavour and the strength both come through.",
  },
  {
    q: "What is a Caviar Stix?",
    a: "Our infused pre-roll taken to the next level: coated with live rosin and sprinkled with a generous amount of hash. The top of the range.",
  },
  {
    q: "What's the difference between the two?",
    a: "An infused pre-roll is infused on the inside. A Caviar Stix is infused inside and coated on the outside, which makes it richer, slower-burning and more intense.",
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
                to="/shop"
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

      {/* SECTION 2 — EFFECT CATEGORIES */}
      <section className="mx-auto mt-32 max-w-3xl">
        {(["daytime", "balanced", "nighttime"] as const).map((eff, i) => {
          const copy = EFFECT_COPY[eff];
          const items = byEffect(eff);
          return (
            <div key={eff}>
              {i > 0 && <Hairline className="my-20" />}
              <ScrollReveal className="text-center">
                <MetaLabel gold>{copy.label}</MetaLabel>
                <h3 className="mt-4 font-display text-4xl leading-[1.1] md:text-5xl">
                  {copy.headline}
                </h3>
                <p className="mx-auto mt-6 max-w-[700px] text-base leading-[1.8] text-[color:var(--text-secondary)] md:text-lg">
                  {copy.body}
                </p>
                {items.length > 0 && (
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {items.map((s) => (
                      <Link
                        key={s.id}
                        to="/shop"
                        search={{ effect: [eff] }}
                        className="inline-block rounded-full border border-[color:var(--accent-gold)]/40 px-4 py-1.5 text-xs text-[color:var(--accent-gold)] hover:bg-[color:var(--accent-gold-muted)] transition-colors"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                )}
              </ScrollReveal>
            </div>
          );
        })}
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
