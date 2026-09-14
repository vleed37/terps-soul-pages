import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listStrains } from "@/lib/strains.functions";
import { StrainCard } from "@/components/brand/StrainCard";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import type { Strain } from "@/lib/types";
import type { CollectionMeta } from "@/lib/collections";

export const collectionStrainsQuery = queryOptions({
  queryKey: ["strains", "all"],
  queryFn: () => listStrains(),
});

export function CollectionLineView({ collection }: { collection: CollectionMeta }) {
  const { data } = useSuspenseQuery(collectionStrainsQuery);
  const strains = (data ?? []) as unknown as Strain[];
  const items = strains
    .filter((s) => s.product_line === collection.line)
    .sort((a, b) => {
      const fa = a.is_featured ? 0 : 1;
      const fb = b.is_featured ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });

  return (
    <section className="pb-20 md:pb-28">
      {/* Collection header photography — placeholder until the shoot arrives (HERO_MEDIA) */}
      <div className="tone-dark relative overflow-hidden">
        <img
          src={collection.heroImage}
          alt={collection.label}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0B0A08]/72" />
        <div className="relative mx-auto max-w-[900px] px-6 py-20 text-center md:px-12 md:py-28">
          <ScrollReveal>
            <MetaLabel gold>✦ {collection.label}</MetaLabel>
            <h1 className="mx-auto mt-5 font-display text-[2.6rem] font-semibold leading-[1.05] md:text-[4.5rem]">
              {collection.heading}
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-base leading-relaxed text-[color:var(--text-secondary)] md:text-lg">
              {collection.description}
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-[1400px] px-6 md:mt-20 md:px-12">
        {items.length === 0 ? (
          <p className="py-24 text-center font-display text-2xl italic text-[color:var(--text-secondary)]">
            This collection is coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s, i) => (
              <ScrollReveal key={s.id} delay={Math.min(i, 5) * 0.08}>
                <StrainCard strain={s} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
