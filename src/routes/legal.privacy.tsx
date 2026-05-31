import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { seoMeta } from "@/lib/seo";

const LAST_UPDATED = "31 May 2026";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: seoMeta({
      title: "Privacy Policy · Terps",
      description:
        "How Terps collects, uses, and protects your personal information under POPIA. Placeholder copy — under legal review.",
      path: "/legal/privacy",
    }),
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={
        <p>
          Terps respects your privacy. This policy describes how we collect, use, share, and
          protect personal information in compliance with the Protection of Personal Information
          Act, 2013 (POPIA).
        </p>
      }
      sections={[
        {
          heading: "Information We Collect",
          body: (
            <p>
              We collect information you provide directly (name, email, phone, delivery address,
              order details) and information collected automatically (device, browser, approximate
              location, pages visited).
            </p>
          ),
        },
        {
          heading: "How We Use It",
          body: (
            <p>
              We use your information to process and deliver orders, manage your account,
              communicate with you about purchases, improve the site, and meet legal obligations.
            </p>
          ),
        },
        {
          heading: "Cookies & Tracking",
          body: (
            <p>
              We use essential cookies to operate the site and optional cookies for analytics and
              marketing. You can manage your preferences via the cookie banner at any time.
            </p>
          ),
        },
        {
          heading: "Sharing & Service Providers",
          body: (
            <p>
              We share information with service providers acting on our behalf — payment processor,
              email delivery, hosting, courier — strictly to fulfil orders. We do not sell personal
              information.
            </p>
          ),
        },
        {
          heading: "Your Rights Under POPIA",
          body: (
            <p>
              You have the right to access, correct, or delete your personal information, and to
              object to processing. Contact us at{" "}
              <a href="mailto:sales@terpnation.co.za" className="ghost-link">
                sales@terpnation.co.za
              </a>{" "}
              to exercise these rights.
            </p>
          ),
        },
        {
          heading: "Retention",
          body: (
            <p>
              We retain personal information only as long as necessary for the purposes set out
              above or as required by law.
            </p>
          ),
        },
        {
          heading: "Contact Us",
          body: (
            <p>
              For any privacy-related queries, please email{" "}
              <a href="mailto:sales@terpnation.co.za" className="ghost-link">
                sales@terpnation.co.za
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}