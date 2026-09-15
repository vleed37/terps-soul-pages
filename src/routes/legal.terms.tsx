import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { Pending } from "@/components/layout/LegalDraftNotice";
import { seoMeta } from "@/lib/seo";
import { BUSINESS, SELLER_REFERENCE, contactEmail } from "@/lib/business";
import { DELIVERY_COPY } from "@/lib/brand";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: seoMeta({
      title: "Terms of Sale · Terps",
      description: "The terms that govern your purchase from Terps.",
      path: "/legal/terms",
    }),
  }),
  component: TermsPage,
});

function TermsPage() {
  const email = contactEmail("sales");
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Sale"
      intro={
        <p>
          These terms govern purchases made through this website from {SELLER_REFERENCE}, trading as{" "}
          {BUSINESS.tradingName}. They are a draft pending legal review. By placing an order you
          confirm that you have read and accepted them.
        </p>
      }
      sections={[
        {
          heading: "Who You Are Contracting With",
          body: (
            <p>
              The seller is <Pending label="legal entity name" />, registration number{" "}
              <Pending label="registration number" />, of{" "}
              <Pending label="registered business address" />, trading as {BUSINESS.tradingName}.
              Contact:{" "}
              <a href={`mailto:${email}`} className="ghost-link">
                {email}
              </a>
              , telephone <Pending label="phone number" />.
            </p>
          ),
        },
        {
          heading: "Eligibility",
          body: (
            <p>
              You must be 18 years of age or older to place an order. We may refuse or cancel any
              order where we are not satisfied that this is the case. Please also read our{" "}
              <Link to="/legal/cannabis-disclaimer" className="ghost-link">
                Cannabis Product Disclaimer
              </Link>
              .
            </p>
          ),
        },
        {
          heading: "Orders and Acceptance",
          body: (
            <p>
              An order placed on this website is an offer to buy. We accept that offer when we confirm
              that the order has been prepared for delivery. Until then we may decline or limit an
              order — for example where stock is unavailable, where the delivery address cannot be
              serviced, or where payment cannot be verified — and we will refund any amount already
              paid.
            </p>
          ),
        },
        {
          heading: "Product Reviews",
          body: (
            <p>
              Reviews may be submitted only by account holders who have bought the product on a
              completed order, one review per product. Every review is checked before publication and
              we may decline or remove a review that is unlawful, abusive, misleading, off-topic or
              makes medical claims. Approved reviews are displayed publicly on the product page with
              your first name and the initial of your surname; editing a published review returns it
              for checking. Reviews are the opinions of the customers who wrote them and are not
              statements by {BUSINESS.tradingName}. By submitting a review you give us permission to
              publish it on this website.
            </p>
          ),
        },
        {
          heading: "Prices and Payment",
          body: (
            <p>
              All prices are in South African Rand ({BUSINESS.currency}) and may change at any time
              before you place an order. VAT is not currently charged on orders placed through this
              website; if that changes, the VAT treatment will be shown at checkout. Payment is
              processed by our third-party payment provider and we do not store card details.
            </p>
          ),
        },
        {
          heading: "Delivery",
          body: (
            <p>
              We deliver only; we do not offer collection. {DELIVERY_COPY} Delivery arrangements,
              timeframes and charges are set out in our{" "}
              <Link to="/legal/shipping" className="ghost-link">
                Shipping and Delivery Policy
              </Link>
              . Risk passes to you on delivery to the address you supplied.
            </p>
          ),
        },
        {
          heading: "Retail Purchases and Resale",
          body: (
            <p>
              If you buy as a retail customer, the products are for your own personal, lawful use. You
              may not purchase through the retail store for the purpose of unlawful resale or
              distribution.
            </p>
          ),
        },
        {
          heading: "Authorised Wholesale Purchases",
          body: (
            <p>
              This restriction does not apply to our wholesale programme. Customers registered as
              stockists through our{" "}
              <Link to="/wholesale" className="ghost-link">
                wholesale programme
              </Link>{" "}
              may purchase for lawful resale, subject to the wholesale terms applicable to their
              account, to any licensing or permit requirements that apply to them, and to the laws of
              the territory in which they trade. Wholesale pricing is confidential to the account it
              is issued to.
            </p>
          ),
        },
        {
          heading: "Returns and Refunds",
          body: (
            <p>
              Cancellations, returns and refunds are governed by our{" "}
              <Link to="/legal/refunds" className="ghost-link">
                Refund and Returns Policy
              </Link>
              , read together with your rights under the Consumer Protection Act, 2008.
            </p>
          ),
        },
        {
          heading: "Product Information",
          body: (
            <p>
              We describe our products as accurately as we can. We make no medicinal or therapeutic
              claims, and we do not publish potency, cannabinoid or laboratory figures on this website.
              Photographs are illustrative and natural product will vary in appearance.
            </p>
          ),
        },
        {
          heading: "Liability",
          body: (
            <p>
              To the extent permitted by South African law, our liability arising from an order is
              limited to the amount you paid for that order. Nothing in these terms excludes or limits
              any liability that cannot lawfully be excluded or limited, including liability under the
              Consumer Protection Act. This clause is subject to legal review.
            </p>
          ),
        },
        {
          heading: "Governing Law",
          body: (
            <p>
              These terms are intended to be governed by the laws of {BUSINESS.jurisdiction}, subject
              to legal review of the appropriate jurisdiction and forum.
            </p>
          ),
        },
      ]}
    />
  );
}
