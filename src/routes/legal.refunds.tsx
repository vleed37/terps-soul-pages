import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { MailValue, Value } from "@/components/layout/LegalDraftNotice";
import { seoHead } from "@/lib/seo";
import { useBusiness } from "@/hooks/useBusiness";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/legal/refunds")({
  head: () =>
    seoHead({
      title: "Refund and Returns Policy · Terps",
      description: "How returns, refunds and order issues are handled by Terps.",
      path: "/legal/refunds",
    }),
  component: RefundsPage,
});

function RefundsPage() {
  const b = useBusiness();
  const email = b.refundEmail ?? b.salesEmail;
  const Mail = () => <MailValue v={email} label="refunds email address" />;
  const Period = () => (
    <Value v={b.returnNotificationPeriod} label="return notification period" />
  );

  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund and Returns Policy"
      intro={
        <p>
          This policy explains when you can return a {b.tradingName} order and how refunds are
          handled. It is a draft pending legal review, and the return notification period has not yet
          been confirmed.
        </p>
      }
      sections={[
        {
          heading: "Contact Us Before Returning Anything",
          body: (
            <p>
              Our products are consumables. Do not send anything back before contacting us. Email{" "}
              <Mail /> with your order number and, where relevant, photographs of the problem, and we
              will confirm in writing whether and how the item should be returned. Unauthorised
              returns cannot be processed or refunded.
            </p>
          ),
        },
        {
          heading: "Your Rights Under the Consumer Protection Act",
          body: (
            <p>
              Nothing in this policy limits your rights under the Consumer Protection Act, 2008,
              including your right to receive goods that are of good quality, in working order and
              free of defects, and your statutory right to return goods that fail to meet that
              standard within the period the Act allows. Where this policy and the Act differ, the Act
              applies.
            </p>
          ),
        },
        {
          heading: "Damaged, Defective or Incorrect Items",
          body: (
            <p>
              If your order arrives damaged, defective or is not what you ordered, notify us within{" "}
              <Period /> of delivery. Once we have confirmed the problem, we will replace the item or
              refund it, and we will carry the cost of returning it.
            </p>
          ),
        },
        {
          heading: "Change of Mind",
          body: (
            <p>
              Because these are consumable cannabis products, we cannot accept the return of any item
              whose seal or packaging has been opened, for reasons of product integrity and safety.
              Where an unopened item may be returned, the notification period is <Period /> and return
              shipping is for your account.
            </p>
          ),
        },
        {
          heading: "Refund Method and Timing",
          body: (
            <p>
              Approved refunds are made in {BUSINESS.currency} to the original payment method through
              our payment provider. We will confirm the refund by email once it has been submitted;
              the time it takes to reflect depends on your bank. We do not issue cash refunds.
            </p>
          ),
        },
        {
          heading: "Cancelling an Order",
          body: (
            <p>
              You may cancel an order before it has been handed to the delivery partner by emailing{" "}
              <Mail />. Once an order has been dispatched it falls under the return process above.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Returns and refunds: <Mail />. Telephone: <Value v={b.phone} label="phone number" />.
            </p>
          ),
        },
      ]}
    />
  );
}
