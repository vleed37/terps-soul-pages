import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listStrains } from "@/lib/strains.functions";
import { CategoryCollection } from "@/components/shop/CategoryCollection";
import { GridSkeleton } from "@/components/layout/PageSkeletons";
import { seoHead } from "@/lib/seo";
import { shopSearchSchema, type ShopSearch } from "@/lib/shop-filters";
import { PRODUCT_LINE_META } from "@/lib/product-lines";
import type { Strain } from "@/lib/types";

const strainsQuery = queryOptions({
  queryKey: ["strains", "all"],
  queryFn: () => listStrains(),
});

export const Route = createFileRoute("/shop/infused-pre-rolls")({
  head: () =>
    seoHead({
      title: "The Infused Pre-Roll · Terps",
      description: PRODUCT_LINE_META.pre_roll.description,
      path: "/shop/infused-pre-rolls",
    }),
  validateSearch: shopSearchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(strainsQuery),
  pendingComponent: () => <GridSkeleton count={6} />,
  pendingMs: 0,
  component: PreRollsPage,
});

function PreRollsPage() {
  const { data } = useSuspenseQuery(strainsQuery);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop/infused-pre-rolls" });

  return (
    <CategoryCollection
      line="pre_roll"
      strains={(data ?? []) as unknown as Strain[]}
      search={search}
      onSearchChange={(partial: ShopSearch) =>
        navigate({ search: (prev: ShopSearch) => ({ ...prev, ...partial }) })
      }
      onReset={() => navigate({ search: {} })}
    />
  );
}
