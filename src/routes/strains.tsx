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
import { getStrainImage } from "@/lib/strain-assets";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Strain, Terpene } from "@/lib/types";

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
    meta: [
      { title: "The Strain Library — Terps" },
      { name: "description", content: "The terpene index, effect categories, and the language of flavor. Your guide to every Terps strain." },
      { property: "og:title", content: "The Strain Library — Terps" },
      { property: "og:description", content: "Every cannabis flavor comes down to terpenes. Explore Terps' full strain library." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(terpenesQuery),
      context.queryClient.ensureQueryData(strainsQuery),
    ]);
  },
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
    body: "Nighttime strains land in the body. Rich, lingering flavors and a calm that settles in. Built for the after-dinner sit-down, the no-plans evening, the slow conversation.",
  },
};

const FAQS = [
  {
    q: "What does 'infused' actually mean?",
    a: "We add live hash rosin — a solventless, terpene-rich concentrate — directly into the flower before it's rolled. Not sprayed on. Not soaked in distillate. Real concentrate, mixed by hand, locked into every joint.",
  },
  {
    q: "How is Terps different from a normal pre-roll?",
    a: "A normal pre-roll is just flower. Terps is flower plus live rosin from the same strain — same terpene profile, same flavor language. The result is brighter flavor, longer burn, and a noticeably stronger, more dimensional high.",
  },
  {
    q: "What is live hash rosin?",
    a: "Rosin pressed from fresh-frozen flower using heat and pressure — no solvents, no chemicals. 'Live' means the plant was frozen at harvest to preserve every terpene. It's the cleanest, most flavor-forward concentrate we know.",
  },
  {
    q: "How should I store my Terps?",
    a: "Keep the tube sealed, upright, somewhere cool and dark. Out of direct sunlight. Out of the fridge. The tube is the storage — leave it in the tube until you're ready to smoke.",
  },
  {
    q: "Is Terps legal in South Africa?",
    a: "Terps follows the current South African regulatory framework for adult-use cannabis. We sell only to adults 21+ and ship within permitted regions. Check your local laws if you're unsure.",
  },
  {
    q: "What does '0.75g' refer to?",
    a: "The total weight of cannabis material in each pre-roll — flower plus infused rosin. A single Terps is a session built for two or three people, or a long solo evening.",
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
          The <em className="text-[color:var(--accent-gold)]">language</em> of flavor.
        </h1>
        <p className="mx-auto mt-6 max-w-[700px] text-base text-[color:var(--text-secondary)] md:text-lg">
          Every cannabis flavor — every nuance of every high — comes down to terpenes. This is your guide.
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

      {/* SECTION 2 — EFFECT CATEGORIES */}
      <section className="mx-auto mt-32 max-w-3xl">
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

      {/* SECTION 2 (continued) — EFFECT CATEGORIES */}
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

      {/* SECTION 3 — LABEL TRANSPARENCY */}
      <section className="mx-auto mt-32 max-w-[1100px]">
        <ScrollReveal className="text-center">
          <MetaLabel gold>✦ Transparency</MetaLabel>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">Every detail is on the tube.</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="relative mt-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="relative mx-auto">
              {(() => {
                const img = getStrainImage("green-crack");
                return img ? (
                  <img
                    src={img}
                    alt="Terps tube"
                    className="max-h-[480px] drop-shadow-[0_28px_60px_rgba(0,0,0,0.7)]"
                  />
                ) : null;
              })()}
              {/* Callouts */}
              {[
                { t: "Strain name", top: "18%", side: "right" },
                { t: "Batch number", top: "34%", side: "left" },
                { t: "0.75g", top: "50%", side: "right" },
                { t: "THC %", top: "62%", side: "left" },
                { t: "Effect category", top: "76%", side: "right" },
                { t: "QR → COA", top: "88%", side: "left" },
              ].map((c) => (
                <span
                  key={c.t}
                  className="absolute font-display italic text-sm text-[color:var(--accent-gold)] whitespace-nowrap"
                  style={{
                    top: c.top,
                    ...(c.side === "left" ? { right: "calc(100% + 12px)" } : { left: "calc(100% + 12px)" }),
                  }}
                >
                  {c.side === "right" && <span className="mr-2">—</span>}
                  {c.t}
                  {c.side === "left" && <span className="ml-2">—</span>}
                </span>
              ))}
            </div>
            <div>
              <p className="text-base leading-[1.8] text-[color:var(--text-secondary)] md:text-lg">
                Terps tubes carry the same data we publish online — strain, batch, lab-verified
                cannabinoids, and a QR code that links to the exact certificate of analysis for what
                you're holding. No mystery.
              </p>
            </div>
          </div>
        </ScrollReveal>
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
