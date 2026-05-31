import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { seoMeta } from "@/lib/seo";

const LAST_UPDATED = "31 May 2026";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: seoMeta({
      title: "Terms of Sale · Terps",
      description:
        "The terms and conditions that govern your purchase from Terps. Placeholder copy — under legal review.",
      path: "/legal/terms",
    }),
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Sale"
      lastUpdated={LAST_UPDATED}
      intro={
        <p>
          These terms govern purchases made from <strong>Terps</strong> via this website. By placing
          an order you confirm that you have read and agreed to them.
        </p>
      }
      sections={[
        {
          heading: "Eligibility & Age Verification",
          body: (
            <p>
              You must be 18 years of age or older to place an order. We may refuse or cancel any
              order where age cannot be verified. See our Cannabis Disclaimer for further detail.
            </p>
          ),
        },
        {
          heading: "Orders & Acceptance",
          body: (
            <p>
              An order placed through the site constitutes an offer to buy. Acceptance occurs when
              we confirm dispatch. We reserve the right to refuse or limit any order at our
              discretion.
            </p>
          ),
        },
        {
          heading: "Pricing & Payment",
          body: (
            <p>
              Prices are listed in ZAR and may change at any time. Payment is processed by our
              third-party payment provider. We do not store card details on our servers.
            </p>
          ),
        },
        {
          heading: "Delivery & Risk of Loss",
          body: (
            <p>
              Risk passes to you on delivery to the address you supplied. Please see our Shipping
              Policy for delivery windows, costs, and collection options.
            </p>
          ),
        },
        {
          heading: "Cancellations, Returns & Refunds",
          body: (
            <p>
              Cancellations and refunds are governed by our Refund Policy. As a consumable product,
              opened items are not eligible for return except where required by law.
            </p>
          ),
        },
        {
          heading: "Liability",
          body: (
            <p>
              To the extent permitted by South African law, our liability is limited to the amount
              paid for the order in question. Nothing in these terms excludes liability that cannot
              be excluded by law.
            </p>
          ),
        },
        {
          heading: "Governing Law",
          body: (
            <p>
              These terms are governed by the laws of the Republic of South Africa. Disputes are
              subject to the exclusive jurisdiction of the South African courts.
            </p>
          ),
        },
      ]}
    />
  );
}