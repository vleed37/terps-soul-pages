import { createFileRoute } from "@tanstack/react-router";
import { CollectionLineView, collectionStrainsQuery } from "@/components/brand/CollectionLineView";
import { GridSkeleton } from "@/components/layout/PageSkeletons";
import { collectionFor, PRE_ROLL_DESCRIPTION } from "@/lib/collections";
import { seoMeta } from "@/lib/seo";

const collection = collectionFor("pre_roll");

export const Route = createFileRoute("/shop/infused-pre-rolls")({
  head: () => ({
    meta: seoMeta({
      title: "Infused Pre-Rolls · Terps",
      description: PRE_ROLL_DESCRIPTION,
      path: "/shop/infused-pre-rolls",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(collectionStrainsQuery),
  pendingComponent: () => <GridSkeleton count={4} />,
  pendingMs: 0,
  component: () => <CollectionLineView collection={collection} />,
});
