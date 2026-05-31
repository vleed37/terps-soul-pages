import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { seoMeta } from "@/lib/seo";

const LAST_UPDATED = "31 May 2026";

export const Route = createFileRoute("/legal/refunds")({
  head: () => ({
    meta: seoMeta({
      title: "Refund Policy · Terps",
      description:
        "How returns, refunds, and order issues are handled by Terps. Placeholder copy — under legal review.",
      path: "/legal/refunds",
    }),
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund Policy"
      lastUpdated={LAST_UPDATED}
      intro={
        <p>
          We stand behind every Terps drop. This policy describes when refunds, replacements, and
          credits apply.
        </p>
      }
      sections={[
        {
          heading: "Damaged or Defective Items",
          body: (
            <p>
              If your order arrives damaged or defective, contact us within 7 days with photos and
              your order number. We will replace the item or refund you in full.
            </p>
          ),
        },
        {
          heading: "Incorrect Items",
          body: (
            <p>
              If you receive an item different from what you ordered, contact us within 7 days. We
              will arrange a return at no cost and dispatch the correct item.
            </p>
          ),
        },
        {
          heading: "Change of Mind",
          body: (
            <p>
              As a consumable product, unopened items can be returned within 7 days of delivery at
              your cost. Opened items cannot be returned for reasons of product integrity.
            </p>
          ),
        },
        {
          heading: "Refund Method & Timing",
          body: (
            <p>
              Approved refunds are issued to the original payment method within 7 business days of
              approval. Bank clearance times may vary.
            </p>
          ),
        },
        {
          heading: "Cancellations",
          body: (
            <p>
              Orders may be cancelled prior to dispatch by contacting{" "}
              <a href="mailto:sales@terpnation.co.za" className="ghost-link">
                sales@terpnation.co.za
              </a>
              . Once dispatched, the order is subject to the returns process above.
            </p>
          ),
        },
      ]}
    />
  );
}