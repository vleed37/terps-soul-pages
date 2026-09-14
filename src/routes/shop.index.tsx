import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listStrains } from "@/lib/strains.functions";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import collectionHeader from "@/assets/shoot/divine-56.jpg.asset.json";
import preRollImage from "@/assets/shoot/divine-110.jpg.asset.json";
import caviarImage from "@/assets/shoot/divine-117.jpg.asset.json";
import type { Strain } from "@/lib/types";
import { seoMeta } from "@/lib/seo";
import { GridSkeleton } from "@/components/layout/PageSkeletons";
import { PRODUCT_LINE_META, type ProductLine } from "@/lib/product-lines";

const strainsQuery = queryOptions({
  queryKey: ["strains", "all"],
  queryFn: () => listStrains(),
});

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: seoMeta({
      title: "Our Collection · Terps",
      description:
        "Flavour first. Always. Choose between Terps Caviar Sticks and Infused Pre-Rolls.",
      path: "/shop",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(strainsQuery),
  pendingComponent: () => <GridSkeleton count={2} />,
  pendingMs: 0,
  component: CollectionPage,
});

const CATEGORY_IMAGE: Record<ProductLine, string> = {
  caviar_stix: caviarImage.url,
  pre_roll: preRollImage.url,
};

/** Caviar first — the newest launch leads the collection. */
const CATEGORY_ORDER: ProductLine[] = ["caviar_stix", "pre_roll"];

function CollectionPage() {
  const { data } = useSuspenseQuery(strainsQuery);
  const strains = (data ?? []) as unknown as Strain[];

  return (
    <section className="pb-16 md:pb-28">
      {/* Header over collection photography */}
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
              Our Collection
            </h1>
            <p className="mt-5 font-display text-2xl italic text-[color:var(--accent-gold)] md:text-3xl">
              Flavour first. Always.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* Two categories */}
      <div className="mx-auto mt-16 grid max-w-[1400px] grid-cols-1 gap-8 px-6 md:mt-24 md:grid-cols-2 md:px-12">
        {CATEGORY_ORDER.map((line, i) => {
          const meta = PRODUCT_LINE_META[line];
          const count = strains.filter((s) => s.product_line === line).length;
          return (
            <ScrollReveal key={line} delay={i * 0.1}>
              <Link
                to={meta.path}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] transition-transform duration-500 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={CATEGORY_IMAGE[line]}
                    alt={`Terps ${meta.plural}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-8 md:p-10">
                  <MetaLabel gold>
                    {count} {count === 1 ? "product" : "products"}
                  </MetaLabel>
                  <h2 className="mt-3 font-display text-3xl md:text-4xl">{meta.title}</h2>
                  <p className="mt-4 font-body text-base leading-[1.8] text-[color:var(--text-secondary)]">
                    {meta.description}
                  </p>
                  <p className="mt-8 font-display text-lg italic text-[color:var(--accent-gold)]">
                    Shop {meta.plural} →
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>

      <div className="mx-auto mt-16 max-w-[1400px] px-6 text-center md:px-12">
        <Link to="/strains" className="ghost-link">
          Explore the Strain Library →
        </Link>
      </div>
    </section>
  );
}
