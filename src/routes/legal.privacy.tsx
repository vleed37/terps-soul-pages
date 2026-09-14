import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { seoMeta } from "@/lib/seo";
import {
  COMPANY_ADDRESS,
  COMPANY_PHONE,
  EFFECTIVE_DATE,
  LAST_UPDATED,
  LEGAL_ENTITY,
  PRIVACY_EMAIL,
} from "@/lib/legal";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: seoMeta({
      title: "Privacy Policy · Terps",
      description:
        "How Terps collects, uses, stores, protects and discloses your personal information.",
      path: "/legal/privacy",
    }),
    links: [{ rel: "canonical", href: "https://terps2.carbonmediasolutions.com/legal/privacy" }],
  }),
  component: PrivacyPage,
});

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-2 pl-5">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
);

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={
        <>
          <p className="meta-xs text-[color:var(--text-tertiary)]">
            Effective date: {EFFECTIVE_DATE}
          </p>
          <p className="mt-6">
            At {LEGAL_ENTITY} (“we”, “us”, “our”), we respect your privacy and are committed to
            protecting the personal information you provide when using our website, purchasing our
            products, or interacting with our services. This Privacy Policy explains how we
            collect, use, store, protect and disclose your personal information.
          </p>
        </>
      }
      sections={[
        {
          heading: "1. Information We Collect",
          body: (
            <>
              <p>
                Depending on how you interact with our website, we may collect information
                including:
              </p>
              <Bullets
                items={[
                  "Full name",
                  "Email address",
                  "Telephone or mobile number",
                  "Billing and delivery address",
                  "Order and transaction information",
                  "Account information",
                  "Website usage and technical information",
                  "IP address and device information",
                  "Communications you have with us",
                  "Information required to verify your age or eligibility to purchase our products",
                ]}
              />
              <p>
                We only collect information that is reasonably necessary for legitimate business
                purposes.
              </p>
            </>
          ),
        },
        {
          heading: "2. How We Use Your Information",
          body: (
            <>
              <p>We may use your personal information to:</p>
              <Bullets
                items={[
                  "Process and fulfil orders",
                  "Verify age and eligibility where required",
                  "Communicate with you regarding your orders",
                  "Process payments and refunds",
                  "Arrange delivery",
                  "Provide customer support",
                  "Maintain and improve our website and services",
                  "Prevent fraud, abuse and unlawful activity",
                  "Comply with applicable laws and regulations",
                  "Send marketing communications where legally permitted and where you have provided the necessary consent",
                ]}
              />
            </>
          ),
        },
        {
          heading: "3. Payment Information",
          body: (
            <>
              <p>
                Payments may be processed through third-party payment providers. We do not
                intentionally retain complete payment-card details where those details are processed
                securely by our payment provider.
              </p>
              <p>
                Your use of a third-party payment service may also be subject to that provider’s own
                privacy policy and terms.
              </p>
            </>
          ),
        },
        {
          heading: "4. Sharing Personal Information",
          body: (
            <>
              <p>We do not sell your personal information.</p>
              <p>
                Where reasonably necessary, we may share information with trusted third-party
                service providers, including payment processors, delivery providers, website and
                hosting providers, technology providers, professional advisers and regulatory or
                law-enforcement authorities where required by law.
              </p>
              <p>
                We require service providers handling personal information on our behalf to take
                appropriate steps to protect that information.
              </p>
            </>
          ),
        },
        {
          heading: "5. Data Security",
          body: (
            <>
              <p>
                We take reasonable technical and organisational measures to protect personal
                information against unauthorised access, loss, misuse, alteration or disclosure.
              </p>
              <p>
                However, no online transmission or storage system can be guaranteed to be completely
                secure.
              </p>
            </>
          ),
        },
        {
          heading: "6. Retention",
          body: (
            <p>
              We retain personal information only for as long as reasonably necessary for the
              purposes described in this Privacy Policy, including where retention is required by
              law, accounting requirements, dispute resolution or legitimate business purposes.
            </p>
          ),
        },
        {
          heading: "7. Your Rights",
          body: (
            <>
              <p>
                Subject to applicable law, you may have rights regarding your personal information,
                including the right to request access to, correction of, or deletion of certain
                personal information and to object to or restrict certain processing.
              </p>
              <p>
                Requests may be submitted to{" "}
                <a href={`mailto:${PRIVACY_EMAIL}`} className="ghost-link">
                  {PRIVACY_EMAIL}
                </a>
                {COMPANY_ADDRESS ? `, or by post to ${LEGAL_ENTITY}, ${COMPANY_ADDRESS}` : ""}.
              </p>
            </>
          ),
        },
        {
          heading: "8. Cookies",
          body: (
            <>
              <p>
                Our website may use cookies and similar technologies to operate the website,
                remember preferences, understand website usage and improve our services.
              </p>
              <p>You may be able to control cookies through your browser settings.</p>
            </>
          ),
        },
        {
          heading: "9. Children",
          body: (
            <>
              <p>
                Our products are not intended for children or persons who are not legally permitted
                to purchase or possess them.
              </p>
              <p>
                We do not knowingly collect personal information from children for the purpose of
                facilitating unlawful or ineligible purchases.
              </p>
            </>
          ),
        },
        {
          heading: "10. Changes to This Policy",
          body: (
            <p>
              We may update this Privacy Policy from time to time. Any updated version will be
              published on this page with a revised “Last Updated” date.
            </p>
          ),
        },
        {
          heading: "11. Contact",
          body: (
            <>
              <p>For privacy-related questions or requests, contact {LEGAL_ENTITY}:</p>
              <p>
                Email:{" "}
                <a href={`mailto:${PRIVACY_EMAIL}`} className="ghost-link">
                  {PRIVACY_EMAIL}
                </a>
                {COMPANY_PHONE ? ` · Telephone: ${COMPANY_PHONE}` : ""}
                {COMPANY_ADDRESS ? ` · Address: ${COMPANY_ADDRESS}` : ""}
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
