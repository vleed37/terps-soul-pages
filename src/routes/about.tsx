import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listStrains } from "@/lib/strains.functions";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import { PullQuote } from "@/components/brand/PullQuote";
import { GoldButton } from "@/components/brand/GoldButton";
import { getStrainProductImage } from "@/lib/strain-assets";
import lifestyle1 from "@/assets/lifestyle-1.webp";
import lifestyle3 from "@/assets/lifestyle-3.webp";
import lifestyle4 from "@/assets/lifestyle-4.webp";
import type { Strain } from "@/lib/types";
import { seoMeta } from "@/lib/seo";

const strainsQuery = queryOptions({
  queryKey: ["strains", "all"],
  queryFn: () => listStrains(),
});

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: seoMeta({
      title: "Our Story · Terps",
      description:
        "The people, the process, and the philosophy behind Terps. Flavour-first, bred in South Africa.",
      path: "/about",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(strainsQuery),
  component: AboutPage,
});

function AboutPage() {
  const { data } = useSuspenseQuery(strainsQuery);
  const strains = (data ?? []) as unknown as Strain[];

  const paragraphs = [
    "Terps was built around one belief: an infused pre-roll should taste like something. Not chemicals. Not cover-ups. Real strain expression — sharpened, never masked. Every drop carries the flavour it was supposed to.",
    "Every batch starts with cultivars chosen for their terpene profile, not their yield. We slow-cure. We hand-infuse with live hash rosin. We do small drops, strain-specific, and we put the strain on the label because we're proud of what's inside.",
    "We're South African born and bred. The land here grows different, and so do the people. Terps is a product of that — the patience of the soil, the edge of the streets, the standard of a culture that knows quality when it tastes it.",
    "Every drop is limited. Every batch is numbered. When it's gone, it's gone — and the next one is already in cure. This is craft cannabis the way it should be made: slowly, intentionally, and with absolute respect for the flavour on the other end.",
    "Welcome to Terps. Welcome to flavour first.",
  ];

  return (
    <div className="px-6 py-20 md:px-12 md:py-28">
      {/* HERO */}
      <ScrollReveal className="mx-auto max-w-4xl text-center">
        <MetaLabel gold>✦ Our Story</MetaLabel>
        <h1 className="mt-6 font-display text-6xl leading-[0.95] md:text-[8rem]">
          Flavour first.
        </h1>
        <p className="mt-3 font-display text-4xl italic leading-none text-[color:var(--accent-gold)] md:text-6xl">
          Always.
        </p>
      </ScrollReveal>

      {/* BODY */}
      <article className="mx-auto mt-24 max-w-[720px]">
        <ScrollReveal>
          <p className="text-lg leading-[1.8] text-[color:var(--text-primary)]">{paragraphs[0]}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <img
            src={lifestyle1}
            alt=""
            loading="lazy"
            className="my-16 w-full rounded-xl object-cover"
            style={{ aspectRatio: "16/10" }}
          />
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-lg leading-[1.8] text-[color:var(--text-primary)]">{paragraphs[1]}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="my-20">
            <PullQuote attribution="Terps">We don't chase hype. We chase flavour.</PullQuote>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-lg leading-[1.8] text-[color:var(--text-primary)]">{paragraphs[2]}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <img
            src={lifestyle3}
            alt=""
            loading="lazy"
            className="my-16 w-full rounded-xl object-cover"
            style={{ aspectRatio: "16/10" }}
          />
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-lg leading-[1.8] text-[color:var(--text-primary)]">{paragraphs[3]}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <img
            src={lifestyle4}
            alt=""
            loading="lazy"
            className="my-16 w-full rounded-xl object-cover"
            style={{ aspectRatio: "16/10" }}
          />
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-center font-display text-3xl italic leading-snug text-[color:var(--text-primary)] md:text-4xl">
            {paragraphs[4]}
          </p>
        </ScrollReveal>
      </article>

      {/* THE CRAFT */}
      <section className="mx-auto mt-32 max-w-[1200px]">
        <ScrollReveal className="text-center">
          <MetaLabel gold>✦ The Craft</MetaLabel>
          <h2 className="mt-6 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Built slowly. <em className="text-[color:var(--accent-gold)]">Built once.</em>
          </h2>
        </ScrollReveal>
        <div className="mt-20 grid grid-cols-1 gap-px bg-[color:var(--border-subtle)] md:grid-cols-3">
          {[
            {
              t: "Selected Strains",
              d: "Hand-picked for terpene profile. Only the cultivars that earn their flavour.",
            },
            {
              t: "Extended Curing",
              d: "Slow-cured to lock in the depth and the body. Patience over volume.",
            },
            {
              t: "Hand Infusion",
              d: "Premium flower, cured hash and crumble, brought together by hand.",
            },
          ].map((c, i) => (
            <ScrollReveal key={c.t} delay={i * 0.1} className="bg-[color:var(--bg-base)] p-10 md:p-12">
              <div className="h-px w-12 bg-[color:var(--accent-gold)]" />
              <h3 className="mt-6 font-display text-2xl">{c.t}</h3>
              <p className="mt-4 font-body text-base leading-relaxed text-[color:var(--text-secondary)]">
                {c.d}
              </p>
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/shop" className="inline-block">
            <GoldButton>Discover the collection</GoldButton>
          </Link>
        </div>
      </section>
    </div>
  );
}

