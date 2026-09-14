import { createFileRoute } from "@tanstack/react-router";
import { CollectionLineView, collectionStrainsQuery } from "@/components/brand/CollectionLineView";
import { GridSkeleton } from "@/components/layout/PageSkeletons";
import { collectionFor, CAVIAR_DESCRIPTION } from "@/lib/collections";
import { seoMeta } from "@/lib/seo";

const collection = collectionFor("caviar_stix");

export const Route = createFileRoute("/shop/caviar-stix")({
  head: () => ({
    meta: seoMeta({
      title: "Caviar Stix · Terps",
      description: CAVIAR_DESCRIPTION,
      path: "/shop/caviar-stix",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(collectionStrainsQuery),
  pendingComponent: () => <GridSkeleton count={3} />,
  pendingMs: 0,
  component: () => <CollectionLineView collection={collection} />,
});
