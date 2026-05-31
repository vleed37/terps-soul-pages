import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { seoMeta } from "@/lib/seo";

const LAST_UPDATED = "31 May 2026";

export const Route = createFileRoute("/legal/shipping")({
  head: () => ({
    meta: seoMeta({
      title: "Shipping Policy · Terps",
      description:
        "Delivery areas, timelines, and costs for Terps orders in South Africa. Placeholder copy — under legal review.",
      path: "/legal/shipping",
    }),
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Shipping Policy"
      lastUpdated={LAST_UPDATED}
      intro={
        <p>
          Terps ships within the Republic of South Africa via vetted courier partners. This policy
          describes our coverage, timing, and costs.
        </p>
      }
      sections={[
        {
          heading: "Coverage",
          body: (
            <p>
              We deliver to most addresses in South Africa. Remote or outlying areas may require
              additional handling time and surcharges, which will be communicated before dispatch.
            </p>
          ),
        },
        {
          heading: "Timing",
          body: (
            <p>
              Orders placed before 12:00 SAST on a business day are dispatched the same day. Main
              centres typically receive within 1–2 business days; regional addresses within 3–5
              business days.
            </p>
          ),
        },
        {
          heading: "Shipping Costs",
          body: (
            <p>
              Flat-rate delivery applies at checkout, with free delivery on orders over R500.
              Costs are shown before payment.
            </p>
          ),
        },
        {
          heading: "Tracking",
          body: (
            <p>
              You will receive a tracking number once your order ships. You can also view tracking
              from your order detail page.
            </p>
          ),
        },
        {
          heading: "Collection at a Stockist",
          body: (
            <p>
              Selected stockists offer in-store collection at checkout. ID may be required on
              collection.
            </p>
          ),
        },
        {
          heading: "Failed Delivery",
          body: (
            <p>
              If a delivery cannot be completed and is returned to us, we will contact you to
              arrange redelivery. Additional courier fees may apply.
            </p>
          ),
        },
      ]}
    />
  );
}