import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { z } from "zod";

/** Legacy /shop filter URLs stay valid and route to the new collection pages. */
const legacySearchSchema = z
  .object({
    line: z.string().optional(),
    effect: z.any().optional(),
    flavor: z.any().optional(),
    avail: z.any().optional(),
    strain_type: z.any().optional(),
    min: z.any().optional(),
    max: z.any().optional(),
    sort: z.any().optional(),
  })
  .passthrough();

export const Route = createFileRoute("/shop")({
  validateSearch: legacySearchSchema,
  beforeLoad: ({ search, location }) => {
    if (location.pathname !== "/shop" && location.pathname !== "/shop/") return;
    const line = typeof search.line === "string" ? search.line : undefined;
    if (line === "caviar_stix") throw redirect({ to: "/shop/caviar-stix" });
    if (line === "pre_roll") throw redirect({ to: "/shop/infused-pre-rolls" });
  },
  component: () => <Outlet />,
});
