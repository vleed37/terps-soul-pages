import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { seoMeta } from "@/lib/seo";
import {
  COMPANY_ADDRESS,
  COMPANY_PHONE,
  CURRENCY,
  EFFECTIVE_DATE,
  GOVERNING_LAW,
  LAST_UPDATED,
  LEGAL_ENTITY,
  SUPPORT_EMAIL,
  WEBSITE_URL,
} from "@/lib/legal";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: seoMeta({
      title: "Terms of Sale · Terps",
      description:
        "The terms that govern purchases made through the Terps online store, including eligibility, orders, prices and delivery.",
      path: "/legal/terms",
    }),
    links: [{ rel: "canonical", href: "https://terps2.carbonmediasolutions.com/legal/terms" }],
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
        <>
          <p className="meta-xs text-[color:var(--text-tertiary)]">
            Effective date: {EFFECTIVE_DATE}
          </p>
          <p className="mt-6">
            These Terms of Sale govern purchases made through {WEBSITE_URL}, operated by{" "}
            {LEGAL_ENTITY} (“we”, “us”, “our”). By placing an order through our website, you agree to
            these Terms of Sale.
          </p>
        </>
      }
      sections={[
        {
          heading: "1. Eligibility",
          body: (
            <>
              <p>
                You may only purchase our products if you are legally permitted to do so under the
                laws applicable to you.
              </p>
              <p>
                You confirm that the information you provide during checkout is accurate and complete
                and that you satisfy all applicable age and eligibility requirements.
              </p>
              <p>
                We may require proof of age or eligibility before accepting or dispatching an order.
              </p>
            </>
          ),
        },
        {
          heading: "2. Products",
          body: (
            <>
              <p>
                We make reasonable efforts to ensure that product descriptions, photographs,
                specifications and other information displayed on our website are accurate.
              </p>
              <p>
                Product appearance, packaging and other non-material characteristics may vary.
              </p>
              <p>
                Nothing on our website should be interpreted as medical advice or as a guarantee of a
                particular physical or psychological effect.
              </p>
            </>
          ),
        },
        {
          heading: "3. Orders",
          body: (
            <>
              <p>Submitting an order constitutes an offer to purchase the selected products.</p>
              <p>
                An order is not necessarily accepted merely because you receive an automated order
                confirmation.
              </p>
              <p>
                We reserve the right to accept, reject or cancel an order where permitted by law,
                including where:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>A product is unavailable;</li>
                <li>Payment cannot be processed;</li>
                <li>Required age or eligibility verification is unsuccessful;</li>
                <li>Delivery is unlawful or unavailable;</li>
                <li>There is an apparent pricing or listing error;</li>
                <li>Fraudulent or suspicious activity is suspected; or</li>
                <li>We are otherwise legally unable to fulfil the order.</li>
              </ul>
              <p>
                If we cancel an order after payment has been received, any applicable refund will be
                processed in accordance with our{" "}
                <Link to="/legal/refunds" className="ghost-link">
                  Refund Policy
                </Link>{" "}
                and applicable law.
              </p>
            </>
          ),
        },
        {
          heading: "4. Prices",
          body: (
            <>
              <p>
                Prices displayed on the website are stated in {CURRENCY} and are subject to change
                without notice.
              </p>
              <p>
                The price applicable to an order is the price displayed at the time the order is
                submitted, except where an obvious pricing error has occurred or applicable law
                provides otherwise.
              </p>
              <p>
                Delivery charges, taxes or other applicable charges will be displayed where required.
              </p>
            </>
          ),
        },
        {
          heading: "5. Payment",
          body: (
            <>
              <p>Payment must be successfully received before an order is dispatched.</p>
              <p>
                We may use third-party payment providers to process transactions. Your use of those
                services may be subject to additional terms imposed by the relevant provider.
              </p>
            </>
          ),
        },
        {
          heading: "6. Delivery",
          body: (
            <>
              <p>
                Delivery is subject to our{" "}
                <Link to="/legal/shipping" className="ghost-link">
                  Shipping &amp; Delivery Policy
                </Link>
                .
              </p>
              <p>We only fulfil deliveries where doing so is lawful and reasonably possible.</p>
              <p>
                The customer is responsible for ensuring that the delivery information provided is
                accurate.
              </p>
            </>
          ),
        },
        {
          heading: "7. Cannabis Products",
          body: (
            <>
              <p>
                Products containing cannabis or cannabinoids must only be purchased, possessed and
                used in accordance with applicable law.
              </p>
              <p>
                You acknowledge that cannabis products may have intoxicating or impairing effects and
                that individual responses may vary.
              </p>
              <p>
                You are responsible for determining whether the purchase, possession and use of the
                relevant product is lawful and appropriate for you. See our{" "}
                <Link to="/legal/cannabis-disclaimer" className="ghost-link">
                  Cannabis Product Disclaimer
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          heading: "8. Prohibited Use",
          body: (
            <>
              <p>You may not use our website or products for any unlawful purpose.</p>
              <p>
                You may not knowingly purchase products for unlawful resale, redistribution, export,
                import or other prohibited activity.
              </p>
            </>
          ),
        },
        {
          heading: "9. Intellectual Property",
          body: (
            <>
              <p>
                All trademarks, logos, product names, designs, photographs, text, graphics and other
                content appearing on our website are owned by or licensed to {LEGAL_ENTITY}, unless
                otherwise stated.
              </p>
              <p>
                You may not reproduce, distribute, modify or commercially exploit our intellectual
                property without our prior written permission.
              </p>
            </>
          ),
        },
        {
          heading: "10. Website Availability",
          body: (
            <>
              <p>
                We aim to keep our website available and accurate but do not guarantee that the
                website will always be uninterrupted, error-free or free from technical problems.
              </p>
              <p>
                We may modify, suspend or discontinue parts of the website where reasonably necessary.
              </p>
            </>
          ),
        },
        {
          heading: "11. Limitation of Liability",
          body: (
            <>
              <p>
                To the maximum extent permitted by applicable law, {LEGAL_ENTITY} will not be
                responsible for losses arising from a customer’s unlawful use, possession,
                transportation, resale or distribution of our products.
              </p>
              <p>
                Nothing in these Terms excludes or limits liability that cannot lawfully be excluded
                or limited.
              </p>
            </>
          ),
        },
        {
          heading: "12. Indemnity",
          body: (
            <p>
              To the extent permitted by applicable law, you agree to be responsible for losses,
              claims or costs arising from your unlawful use of our website or products, your breach
              of these Terms, or your violation of applicable law.
            </p>
          ),
        },
        {
          heading: "13. Governing Law",
          body: (
            <p>
              These Terms are governed by the laws of {GOVERNING_LAW}, subject to any mandatory
              consumer protections or other applicable legal requirements.
            </p>
          ),
        },
        {
          heading: "14. Changes to These Terms",
          body: (
            <>
              <p>We may update these Terms from time to time.</p>
              <p>
                The version published on our website at the time of your purchase will generally apply
                to that transaction, subject to applicable law.
              </p>
            </>
          ),
        },
        {
          heading: "15. Contact",
          body: (
            <p>
              For questions regarding these Terms of Sale, contact {LEGAL_ENTITY} at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="ghost-link">
                {SUPPORT_EMAIL}
              </a>
              {COMPANY_PHONE ? ` · Telephone: ${COMPANY_PHONE}` : ""}
              {COMPANY_ADDRESS ? ` · Address: ${COMPANY_ADDRESS}` : ""}.
            </p>
          ),
        },
      ]}
    />
  );
}
