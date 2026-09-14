import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { Pending } from "@/components/layout/LegalDraftNotice";
import { seoMeta } from "@/lib/seo";
import { BUSINESS, contactEmail } from "@/lib/business";
import { DELIVERY_COPY } from "@/lib/brand";

export const Route = createFileRoute("/legal/shipping")({
  head: () => ({
    meta: seoMeta({
      title: "Shipping and Delivery Policy · Terps",
      description:
        "Delivery areas, processing and delivery arrangements for Terps orders in South Africa.",
      path: "/legal/shipping",
    }),
  }),
  component: ShippingPage,
});

function ShippingPage() {
  const email = contactEmail("shipping");
  return (
    <LegalPage
      eyebrow="Legal"
      title="Shipping and Delivery Policy"
      intro={
        <p>
          {BUSINESS.tradingName} operates on a delivery-only basis within {BUSINESS.jurisdiction}.
          This policy describes how orders are prepared and delivered. It is a draft: the delivery
          partner, delivery timeframes and delivery charges are not yet confirmed.
        </p>
      }
      sections={[
        {
          heading: "Delivery Only",
          body: (
            <p>
              All orders placed on this website are delivered to the address you supply at checkout.
              We do not offer collection or in-person pickup from any premises.
            </p>
          ),
        },
        {
          heading: "Delivery Areas",
          body: (
            <p>
              We intend to deliver to addresses within {BUSINESS.jurisdiction}. Serviceable areas are
              confirmed at checkout for the address you enter. Outlying areas may not be serviceable,
              in which case we will contact you before taking payment for that order.
            </p>
          ),
        },
        {
          heading: "Processing Time",
          body: (
            <p>
              Orders are prepared once payment is confirmed. Our standard processing time is{" "}
              <Pending label="processing time" />, after which the order is handed to the delivery
              partner.
            </p>
          ),
        },
        {
          heading: "Delivery Timeframes",
          body: (
            <p>
              Standard delivery is estimated at <Pending label="standard delivery estimate" /> and
              express delivery at <Pending label="express delivery estimate" />. Until these are
              confirmed we do not quote a delivery timeframe, and no timeframe shown anywhere on this
              website should be treated as a guarantee.
            </p>
          ),
        },
        {
          heading: "Delivery Charges",
          body: <p>{DELIVERY_COPY} Delivery charges are not advertised in advance of checkout.</p>,
        },
        {
          heading: "Delivery Method",
          body: (
            <p>
              Deliveries will be made by an appointed third-party delivery partner:{" "}
              <Pending label="delivery partner" />. We do not currently commit to any particular
              delivery method, service level or tracking capability.
            </p>
          ),
        },
        {
          heading: "Receiving Your Order",
          body: (
            <p>
              Someone aged 18 or older must be available to receive the delivery, and proof of age may
              be requested on hand-over. If a delivery cannot be completed, the delivery partner will
              attempt to contact you on the number you supplied. Repeat failed attempts may result in
              the order being returned to us and additional charges being payable.
            </p>
          ),
        },
        {
          heading: "Risk and Ownership",
          body: (
            <p>
              Risk in the goods passes to you on delivery to the address you supplied, or to any
              person at that address who accepts the delivery on your behalf.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Delivery queries:{" "}
              <a href={`mailto:${email}`} className="ghost-link">
                {email}
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
