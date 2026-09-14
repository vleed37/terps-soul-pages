import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { seoMeta } from "@/lib/seo";
import {
  COMPANY_PHONE,
  EFFECTIVE_DATE,
  EXPRESS_DELIVERY_DAYS,
  LAST_UPDATED,
  LEGAL_ENTITY,
  PROCESSING_DAYS,
  SHIPPING_EMAIL,
  STANDARD_DELIVERY_DAYS,
  SUPPORT_EMAIL,
} from "@/lib/legal";

export const Route = createFileRoute("/legal/shipping")({
  head: () => ({
    meta: seoMeta({
      title: "Shipping & Delivery Policy · Terps",
      description:
        "Delivery areas, order processing, delivery times, age verification and failed deliveries.",
      path: "/legal/shipping",
    }),
    links: [{ rel: "canonical", href: "https://terps2.carbonmediasolutions.com/legal/shipping" }],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Shipping & Delivery Policy"
      lastUpdated={LAST_UPDATED}
      intro={
        <>
          <p className="meta-xs text-[color:var(--text-tertiary)]">
            Effective date: {EFFECTIVE_DATE}
          </p>
          <p className="mt-6">
            At {LEGAL_ENTITY}, we take care to process and deliver orders safely, securely and in
            accordance with applicable laws.
          </p>
        </>
      }
      sections={[
        {
          heading: "1. Delivery Areas",
          body: (
            <>
              <p>
                We only deliver products to locations where the sale, possession and delivery of the
                relevant products are legally permitted.
              </p>
              <p>
                We do not knowingly ship cannabis products to jurisdictions where such delivery is
                prohibited.
              </p>
              <p>
                Certain products may be subject to geographical, regulatory or delivery restrictions.
              </p>
            </>
          ),
        },
        {
          heading: "2. Order Processing",
          body: (
            <>
              <p>
                Orders are normally processed within {PROCESSING_DAYS} business days after payment
                has been successfully received and any required age or eligibility verification has
                been completed.
              </p>
              <p>
                Orders may be delayed where additional verification or information is required.
              </p>
            </>
          ),
        },
        {
          heading: "3. Delivery Times",
          body: (
            <>
              <p>Estimated delivery times are:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Standard delivery: {STANDARD_DELIVERY_DAYS} business days</li>
                <li>Express delivery: {EXPRESS_DELIVERY_DAYS} business days</li>
              </ul>
              <p>
                Delivery estimates are not guaranteed and may be affected by circumstances outside
                our control.
              </p>
            </>
          ),
        },
        {
          heading: "4. Age Verification",
          body: (
            <>
              <p>
                Where required, we may verify the purchaser’s age or eligibility before an order is
                dispatched.
              </p>
              <p>
                We reserve the right to cancel or refuse an order where the required verification
                cannot be satisfactorily completed.
              </p>
            </>
          ),
        },
        {
          heading: "5. Incorrect Delivery Information",
          body: (
            <>
              <p>
                Customers are responsible for providing accurate and complete delivery information.
              </p>
              <p>
                We are not responsible for delays, failed deliveries or additional costs resulting
                from incorrect or incomplete information supplied by the customer.
              </p>
            </>
          ),
        },
        {
          heading: "6. Lost, Damaged or Incorrect Orders",
          body: (
            <>
              <p>
                If your order arrives damaged, incomplete or contains an incorrect product, please
                contact us at{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="ghost-link">
                  {SUPPORT_EMAIL}
                </a>{" "}
                as soon as reasonably possible and provide your order number and relevant details.
              </p>
              <p>
                Where appropriate, we may request photographs or other information to assist with
                investigating the issue.
              </p>
            </>
          ),
        },
        {
          heading: "7. Restricted or Failed Deliveries",
          body: (
            <>
              <p>
                If a delivery cannot legally or reasonably be completed, we reserve the right to
                cancel the order.
              </p>
              <p>
                Any refund in such circumstances will be handled in accordance with our Refund
                Policy and applicable law.
              </p>
            </>
          ),
        },
        {
          heading: "8. Unauthorised Resale",
          body: (
            <p>
              Products purchased from {LEGAL_ENTITY} are intended for the purchaser’s lawful use and
              are not authorised for unlawful resale or redistribution.
            </p>
          ),
        },
        {
          heading: "9. Contact",
          body: (
            <p>
              For delivery enquiries, email{" "}
              <a href={`mailto:${SHIPPING_EMAIL}`} className="ghost-link">
                {SHIPPING_EMAIL}
              </a>
              {COMPANY_PHONE ? ` or call ${COMPANY_PHONE}` : ""}.
            </p>
          ),
        },
      ]}
    />
  );
}
