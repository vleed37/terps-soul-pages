import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listStrains } from "@/lib/strains.functions";
import { StrainCard } from "@/components/brand/StrainCard";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import type { Strain } from "@/lib/types";

const strainsQuery = queryOptions({
  queryKey: ["strains", "all"],
  queryFn: () => listStrains(),
});

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "The Collection — Terps" },
      { name: "description", content: "Browse the full Terps collection. Hand-infused, live rosin pre-rolls, lab verified, bred in South Africa." },
      { property: "og:title", content: "The Collection — Terps" },
      { property: "og:description", content: "Browse the full Terps collection. Hand-infused, live rosin pre-rolls, lab verified." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(strainsQuery),
  component: ShopPage,
});

function ShopPage() {
  const { data } = useSuspenseQuery(strainsQuery);
  const strains = (data ?? []) as unknown as Strain[];

  const inStock = strains.filter((s) => s.stock_quantity > 0);
  const soldOut = strains.filter((s) => s.stock_quantity <= 0);

  return (
    <section className="px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-12 md:mb-16">
          <MetaLabel gold>The Collection</MetaLabel>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] md:text-7xl">
            Every strain, every <em className="italic font-normal">terpene</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[color:var(--text-secondary)]">
            A small, deliberate menu. Each pre-roll is hand-infused with live rosin pressed from the same strain on the label — no distillate shortcuts, no flavour additives.
          </p>
        </header>

        {strains.length === 0 ? (
          <p className="py-32 text-center text-[color:var(--text-tertiary)]">
            No strains available right now. Check back soon.
          </p>
        ) : (
          <>
            {inStock.length > 0 && (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {inStock.map((s) => (
                  <StrainCard key={s.id} strain={s} />
                ))}
              </div>
            )}

            {soldOut.length > 0 && (
              <div className="mt-20">
                <div className="mb-8 flex items-center gap-6">
                  <MetaLabel>Currently sold out</MetaLabel>
                  <Hairline className="flex-1" />
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {soldOut.map((s) => (
                    <StrainCard key={s.id} strain={s} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
