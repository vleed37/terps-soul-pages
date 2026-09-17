import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { MailValue, Pending, Value } from "@/components/layout/LegalDraftNotice";
import { seoHead } from "@/lib/seo";
import { useBusiness } from "@/hooks/useBusiness";

export const Route = createFileRoute("/legal/privacy")({
  head: () =>
    seoHead({
      title: "Privacy Policy · Terps",
      description:
        "How Terps collects, uses and protects your personal information under POPIA.",
      path: "/legal/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const b = useBusiness();
  const seller = b.legalEntityName ?? `The operator of ${b.tradingName}`;
  const MailLink = ({ purpose }: { purpose: "privacy" | "sales" }) =>
    purpose === "privacy" ? (
      <MailValue v={b.privacyEmail ?? b.salesEmail} label="privacy email address" />
    ) : (
      <MailValue v={b.salesEmail} label="sales email address" />
    );

  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={
        <p>
          {seller}, trading as {b.tradingName}, respects your privacy. This
          policy describes how we collect, use, share and protect personal information in line
          with the Protection of Personal Information Act, 2013 (POPIA). It is a draft pending
          legal review.
        </p>
      }
      sections={[
        {
          heading: "Who Is Responsible",
          body: (
            <p>
              The responsible party for this processing is {b.tradingName}. The registered legal
              entity is <Value v={b.legalEntityName} label="legal entity name" /> and the registered
              address is <Value v={b.address} label="business address" />. Privacy queries can be sent to{" "}
              <MailLink purpose="privacy" />.
            </p>
          ),
        },
        {
          heading: "Information We Collect",
          body: (
            <>
              <p>We collect only what the site actually needs:</p>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  <strong>Order details</strong> — name, email address, phone number and delivery
                  address you enter at checkout, plus the items and amounts of your order.
                </li>
                <li>
                  <strong>Account details</strong> — your email address, password (stored only as a
                  secure hash by our authentication provider), and any saved delivery addresses.
                </li>
                <li>
                  <strong>Wholesale application details</strong> — business name, trading name,
                  contact person, business address and any registration or VAT number you choose to
                  supply.
                </li>
                <li>
                  <strong>Marketing sign-ups</strong> — the email address you submit to our
                  newsletter or to a "notify me when back in stock" request.
                </li>
                <li>
                  <strong>Product reviews</strong> — the star rating and review text you choose to
                  submit for a product you have bought. Reviews are checked before publication and,
                  once approved, are displayed publicly on that product's page alongside your first
                  name and the initial of your surname. Your email address, account identifier and
                  order number are never shown. You can ask us to remove a review at any time by
                  writing to <MailLink purpose="privacy" />.
                </li>
                <li>
                  <strong>Technical data</strong> — server logs of requests, including IP address and
                  browser type, used to operate and secure the site.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Age Verification",
          body: (
            <p>
              This website does not collect or store identity documents. When you first visit, we ask
              you to confirm that you are 18 or older and we store that confirmation as a preference
              in your own browser for 30 days. We do not verify your age against any external record
              through this website.
            </p>
          ),
        },
        {
          heading: "Location Access",
          body: (
            <p>
              Your device location is requested only when you actively choose "Use my location" in
              the stockist finder, and only to sort nearby stockists by distance. You can decline the
              browser prompt and search by town or suburb instead. We do not store your coordinates.
            </p>
          ),
        },
        {
          heading: "Newsletter and Back-in-Stock Notifications",
          body: (
            <p>
              Submitting your email address to our newsletter or to a back-in-stock request is
              consent to be contacted for that purpose only. Duplicate submissions are ignored rather
              than stored twice. You can ask us to remove your address at any time by emailing{" "}
              <MailLink purpose="privacy" />, and we will delete the record.
            </p>
          ),
        },
        {
          heading: "Cookies and Local Storage",
          body: (
            <p>
              Strictly necessary storage keeps your cart, your signed-in session, your age
              confirmation and your cookie choice working. Optional analytics or marketing storage is
              only used where you have accepted it in the cookie banner, and you can change that
              choice at any time. Declining optional storage does not affect your ability to shop.
            </p>
          ),
        },
        {
          heading: "Service Providers We Use",
          body: (
            <>
              <p>
                We share personal information with the following processors, strictly so they can
                perform their function for us:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  <strong>Supabase</strong> — database, authentication and file storage for accounts,
                  orders and product data.
                </li>
                <li>
                  <strong>Lovable / Cloudflare</strong> — application hosting and content delivery.
                </li>
                <li>
                  <strong>Resend</strong> — transactional email delivery (order confirmations,
                  account emails).
                </li>
                <li>
                  <strong>BobPay</strong> — payment processing. Card details are entered with the
                  payment provider and are never stored on our servers.
                </li>
                <li>
                  <strong>Courier partner</strong> — <Pending label="courier" />, to deliver your
                  order once a delivery partner is appointed.
                </li>
              </ul>
              <p>We do not sell personal information.</p>
            </>
          ),
        },
        {
          heading: "Your Rights Under POPIA",
          body: (
            <p>
              You may request access to the personal information we hold about you, ask us to correct
              it, object to processing, or ask us to delete it. Contact{" "}
              <MailLink purpose="privacy" />. You also have the right to lodge a complaint with the
              Information Regulator of South Africa.
            </p>
          ),
        },
        {
          heading: "Deleting Your Account",
          body: (
            <p>
              When you delete your account, your profile is anonymised: your name, phone number and
              saved addresses are removed and your sign-in credentials are revoked. Records of
              completed orders are retained in anonymised form because we are legally required to
              keep transaction records. This means a deleted account cannot be restored, and past
              orders can no longer be linked back to you through this website.
            </p>
          ),
        },
        {
          heading: "Retention",
          body: (
            <p>
              We keep personal information only as long as needed for the purpose it was collected
              for, or as long as the law requires us to keep it. Order and tax records are retained
              for the statutory period; marketing sign-ups are kept until you unsubscribe.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Privacy queries: <MailLink purpose="privacy" />. General queries:{" "}
              <MailLink purpose="sales" />. Telephone: <Value v={b.phone} label="phone number" />.
            </p>
          ),
        },
      ]}
    />
  );
}
