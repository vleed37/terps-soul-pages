import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { seoMeta } from "@/lib/seo";
import {
  COMPANY_PHONE,
  EFFECTIVE_DATE,
  LAST_UPDATED,
  LEGAL_ENTITY,
  REFUNDS_EMAIL,
  RETURN_WINDOW_DAYS,
} from "@/lib/legal";

export const Route = createFileRoute("/legal/refunds")({
  head: () => ({
    meta: seoMeta({
      title: "Refund & Returns Policy · Terps",
      description:
        "Incorrect or damaged products, change of mind, refunds, cancelled orders and consumer rights.",
      path: "/legal/refunds",
    }),
    links: [{ rel: "canonical", href: "https://terps2.carbonmediasolutions.com/legal/refunds" }],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund & Returns Policy"
      lastUpdated={LAST_UPDATED}
      intro={
        <>
          <p className="meta-xs text-[color:var(--text-tertiary)]">
            Effective date: {EFFECTIVE_DATE}
          </p>
          <p className="mt-6">
            We want every order from {LEGAL_ENTITY} to arrive safely and correctly. Because our
            products may be consumable cannabis products, returns are subject to applicable health,
            safety and legal requirements.
          </p>
        </>
      }
      sections={[
        {
          heading: "1. Incorrect or Damaged Products",
          body: (
            <>
              <p>
                If you receive an incorrect, damaged or defective product, please contact us within{" "}
                {RETURN_WINDOW_DAYS} of delivery.
              </p>
              <p>Please provide:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Your order number</li>
                <li>A description of the problem</li>
                <li>Photographs where relevant</li>
                <li>Any other information reasonably required to investigate the issue</li>
              </ul>
              <p>
                Where appropriate, we may offer a replacement, refund or other remedy in accordance
                with applicable law.
              </p>
            </>
          ),
        },
        {
          heading: "2. Change of Mind",
          body: (
            <p>
              Due to the nature of our products, opened, used or consumed cannabis products generally
              cannot be returned for a change of mind, subject always to any rights that cannot
              lawfully be excluded.
            </p>
          ),
        },
        {
          heading: "3. Unopened Products",
          body: (
            <>
              <p>
                Requests concerning unopened products must be submitted within {RETURN_WINDOW_DAYS}{" "}
                of delivery.
              </p>
              <p>
                Any return must comply with our instructions and all applicable legal requirements.
              </p>
              <p>Do not send products back to us without first contacting customer support.</p>
            </>
          ),
        },
        {
          heading: "4. Refunds",
          body: (
            <>
              <p>
                Where a refund is approved, the refund will normally be processed using the original
                payment method where reasonably possible.
              </p>
              <p>
                Processing times may vary depending on the payment provider or financial institution.
              </p>
            </>
          ),
        },
        {
          heading: "5. Cancelled or Rejected Orders",
          body: (
            <>
              <p>We may cancel an order where:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>The transaction cannot be successfully processed;</li>
                <li>Required age or eligibility verification cannot be completed;</li>
                <li>Delivery to the relevant location is not lawful or possible;</li>
                <li>The product is unavailable;</li>
                <li>We reasonably suspect fraud or misuse; or</li>
                <li>Cancellation is otherwise permitted or required by applicable law.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "6. Consumer Rights",
          body: (
            <>
              <p>
                Nothing in this Refund &amp; Returns Policy is intended to exclude, restrict or limit
                any consumer right, warranty, remedy or protection that cannot legally be excluded
                under applicable law.
              </p>
              <p>
                If applicable law provides you with a mandatory right to a refund, replacement, repair
                or other remedy, that right will continue to apply.
              </p>
            </>
          ),
        },
        {
          heading: "7. Contact",
          body: (
            <p>
              For refund or return enquiries, email{" "}
              <a href={`mailto:${REFUNDS_EMAIL}`} className="ghost-link">
                {REFUNDS_EMAIL}
              </a>
              {COMPANY_PHONE ? ` or call ${COMPANY_PHONE}` : ""}.
            </p>
          ),
        },
      ]}
    />
  );
}
