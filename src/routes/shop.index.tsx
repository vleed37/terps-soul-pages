import { createFileRoute, Link } from "@tanstack/react-router";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import collectionHeader from "@/assets/shoot/divine-56.jpg.asset.json";
import { COLLECTIONS } from "@/lib/collections";
import { seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: seoMeta({
      title: "The Collection · Terps",
      description:
        "Two Terps collections — Infused Pre-Rolls and Caviar Stix. Choose a collection to see every product in the line.",
      path: "/shop",
    }),
  }),
  component: ShopHub,
});

function ShopHub() {
  return (
    <section className="pb-20 md:pb-28">
      <div className="tone-dark relative overflow-hidden">
        <img
          src={collectionHeader.url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0B0A08]/75" />
        <div className="relative mx-auto max-w-[1400px] px-6 py-20 text-center md:px-12 md:py-28">
          <ScrollReveal>
            <MetaLabel gold>✦ The Collection</MetaLabel>
            <h1 className="mx-auto mt-5 font-display text-[2.75rem] font-semibold leading-[1.05] md:text-7xl">
              Flavour first. <em className="text-[color:var(--accent-gold)]">Always.</em>
            </h1>
          </ScrollReveal>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-[1200px] px-6 md:mt-20 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {COLLECTIONS.map((c, i) => (
            <ScrollReveal key={c.line} delay={i * 0.08}>
              <Link to={c.path} className="group block">
                <div className="overflow-hidden rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)]">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={c.hubImage}
                      alt={c.label}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <MetaLabel gold>✦ {c.label}</MetaLabel>
                    <h2 className="mt-4 font-display text-[1.9rem] font-semibold leading-[1.08] md:text-[2.4rem]">
                      {c.heading}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-secondary)] md:text-base">
                      {c.description}
                    </p>
                    <span className="mt-6 inline-block font-display text-sm italic text-[color:var(--accent-gold)] group-hover:underline">
                      Shop the collection →
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
