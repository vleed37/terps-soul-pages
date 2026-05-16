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

const strainsQuery = queryOptions({
  queryKey: ["strains", "all"],
  queryFn: () => listStrains(),
});

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Terps" },
      { name: "description", content: "Flavor first. Always. The story behind Terps — South African–bred, hand-infused with live hash rosin." },
      { property: "og:title", content: "Our Story — Terps" },
      { property: "og:description", content: "The story behind Terps — South African–bred, slow-cured, hand-infused with live hash rosin." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(strainsQuery),
  component: AboutPage,
});

function AboutPage() {
  const { data } = useSuspenseQuery(strainsQuery);
  const strains = (data ?? []) as unknown as Strain[];

  const paragraphs = [
    "Terps was built around one belief: an infused pre-roll should taste like something. Not chemicals. Not cover-ups. Real strain expression — sharpened, never masked. Every drop carries the flavor it was supposed to.",
    "Every batch starts with cultivars chosen for their terpene profile, not their yield. We slow-cure. We hand-infuse with live hash rosin. We do small drops, strain-specific, and we put the strain on the label because we're proud of what's inside.",
    "We're South African born and bred. The land here grows different, and so do the people. Terps is a product of that — the patience of the soil, the edge of the streets, the standard of a culture that knows quality when it tastes it.",
    "Every drop is limited. Every batch is numbered. When it's gone, it's gone — and the next one is already in cure. This is craft cannabis the way it should be made: slowly, intentionally, and with absolute respect for the flavor on the other end.",
    "Welcome to Terps. Welcome to flavor first.",
  ];

  return (
    <div className="px-6 py-20 md:px-12 md:py-28">
      {/* HERO */}
      <ScrollReveal className="mx-auto max-w-4xl text-center">
        <MetaLabel gold>✦ Our Story</MetaLabel>
        <h1 className="mt-6 font-display text-6xl leading-[0.95] md:text-[8rem]">
          Flavor first.
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
            <PullQuote attribution="Terps">We don't chase hype. We chase flavor.</PullQuote>
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

      {/* CLOSING SHOWCASE */}
      <section className="mx-auto mt-32 max-w-[1400px]">
        <ScrollReveal className="text-center">
          <MetaLabel gold>✦ The Collection</MetaLabel>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">
            Four drops. <em className="text-[color:var(--accent-gold)]">One standard.</em>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div
            className="relative mt-16 flex items-end justify-center gap-4 overflow-hidden rounded-xl px-6 py-12 md:gap-12 md:px-12 md:py-20"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.12), transparent 70%), linear-gradient(180deg, var(--bg-surface), var(--bg-rich))",
            }}
          >
            {strains.slice(0, 4).map((s) => {
              const img = getStrainProductImage(s.slug);
              if (!img) return null;
              return (
                <Link
                  key={s.id}
                  to="/strain/$slug"
                  params={{ slug: s.slug }}
                  className="group block"
                >
                  <img
                    src={img}
                    alt={s.name}
                    className="max-h-[280px] w-auto rounded-xl transition-transform duration-500 ease-out group-hover:-translate-y-2 md:max-h-[420px]"
                  />
                </Link>
              );
            })}
          </div>
        </ScrollReveal>

        <div className="mt-12 text-center">
          <Link to="/shop" className="inline-block">
            <GoldButton>Discover all four</GoldButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
