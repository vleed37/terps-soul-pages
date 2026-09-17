import { createFileRoute, Link } from "@tanstack/react-router";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ScrollReveal } from "@/components/brand/ScrollReveal";

import { GoldButton } from "@/components/brand/GoldButton";
import story1 from "@/assets/shoot/divine-62.jpg.asset.json";
import story2 from "@/assets/shoot/divine-48.jpg.asset.json";
import story3 from "@/assets/shoot/divine-56.jpg.asset.json";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seoHead({
      title: "Our Story · Terps",
      description:
        "The people, the process, and the philosophy behind Terps. Flavour-first, bred in South Africa.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  const paragraphs = [
    "Terps was born from a simple frustration: we knew infused pre-rolls could be better.",
    "Too often, we found ourselves paying premium prices for products made with average flower, poorly handled concentrates, or packaging that failed to protect the experience. The product might start out great, but somewhere along the way, quality was compromised.",
    "We decided to do it differently.",
    "At Terps, quality starts with the flower. From cultivation and curing to the way each product is handled and packaged, every detail matters. We believe the experience should be protected from the moment the flower is selected to the moment you open the package.",
    "For us, it has always been about flavour, quality and consistency. We don't believe in cutting corners to keep a product cheap. If better ingredients and better processes cost more, we'd rather raise the price than lower the standard.",
    "Terps is built on one simple principle: never compromise the quality of the experience.",
    "Because if we're going to put our name on it, it needs to be something we'd be proud to smoke ourselves.",
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

      {/* BODY — stakeholder-approved copy (14 Sept 2026). Do not reword. */}
      <article className="mx-auto mt-24 max-w-[720px]">
        <ScrollReveal>
          <p className="text-lg leading-[1.8] text-[color:var(--text-primary)]">{paragraphs[0]}</p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <img
            src={story1.url}
            alt="Terps infused pre-rolls being prepared by hand"
            loading="lazy"
            className="my-16 w-full rounded-xl object-cover"
            style={{ aspectRatio: "16/10" }}
          />
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-lg leading-[1.8] text-[color:var(--text-primary)]">{paragraphs[1]}</p>
        </ScrollReveal>

        <ScrollReveal>
          <p className="mt-8 font-display text-3xl italic leading-snug text-[color:var(--accent-gold)] md:text-4xl">
            {paragraphs[2]}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <img
            src={story2.url}
            alt="Cured flower selected for a Terps batch"
            loading="lazy"
            className="my-16 w-full rounded-xl object-cover"
            style={{ aspectRatio: "16/10" }}
          />
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-lg leading-[1.8] text-[color:var(--text-primary)]">{paragraphs[3]}</p>
        </ScrollReveal>

        <ScrollReveal>
          <p className="mt-8 text-lg leading-[1.8] text-[color:var(--text-primary)]">
            {paragraphs[4]}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <img
            src={story3.url}
            alt="Finished Terps products in their packaging"
            loading="lazy"
            className="my-16 w-full rounded-xl object-cover"
            style={{ aspectRatio: "16/10" }}
          />
        </ScrollReveal>

        <ScrollReveal>
          <p className="text-lg leading-[1.8] text-[color:var(--text-primary)]">{paragraphs[5]}</p>
        </ScrollReveal>

        <ScrollReveal>
          <p className="mt-10 text-center font-display text-3xl italic leading-snug text-[color:var(--text-primary)] md:text-4xl">
            {paragraphs[6]}
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

