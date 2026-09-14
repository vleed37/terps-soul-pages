import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { Pending } from "@/components/layout/LegalDraftNotice";
import { seoMeta } from "@/lib/seo";
import { BUSINESS, contactEmail } from "@/lib/business";

export const Route = createFileRoute("/legal/cannabis-disclaimer")({
  head: () => ({
    meta: seoMeta({
      title: "Cannabis Product Disclaimer · Terps",
      description:
        "Important information about Terps cannabis products, age restrictions and responsible use.",
      path: "/legal/cannabis-disclaimer",
    }),
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  const email = contactEmail("sales");
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cannabis Product Disclaimer"
      intro={
        <p>
          Please read this before buying or using any {BUSINESS.tradingName} product. It is a draft
          pending legal review.
        </p>
      }
      sections={[
        {
          heading: "Strictly 18 and Over",
          body: (
            <p>
              These products are intended for adults aged 18 years or older. They must be kept away
              from children and pets. Do not supply them to anyone under 18.
            </p>
          ),
        },
        {
          heading: "No Medical or Therapeutic Claims",
          body: (
            <p>
              Nothing on this website is medical advice, and no product sold here is offered to
              diagnose, treat, cure or prevent any condition. We make no claim about any physical or
              psychological effect, and no effect is guaranteed. If you are pregnant, breastfeeding,
              taking medication or have any health condition, consult a healthcare professional before
              use.
            </p>
          ),
        },
        {
          heading: "No Potency or Laboratory Claims",
          body: (
            <p>
              We do not publish THC, CBD, cannabinoid or terpene percentages, batch numbers or
              laboratory results on this website, and we make no representation about the potency of
              any product. Flavour and terpene names given in our{" "}
              <Link to="/strains" className="ghost-link">
                Strain Library
              </Link>{" "}
              are descriptive only.
            </p>
          ),
        },
        {
          heading: "Effects and Responsible Use",
          body: (
            <p>
              Cannabis affects people differently. Do not drive, operate machinery or perform any task
              requiring alertness after use. Do not combine with alcohol or other substances. Start
              low, go slow, and use only in a private and lawful setting.
            </p>
          ),
        },
        {
          heading: "Your Legal Responsibility",
          body: (
            <p>
              Laws about cannabis possession, use and transport differ by territory and change over
              time. You are responsible for knowing and complying with the law that applies to you,
              including any restriction on quantity, transport or public use. We do not give legal
              advice and we make no statement about the legality of these products in your
              circumstances. Do not carry these products across any border.
            </p>
          ),
        },
        {
          heading: "Workplace and Testing",
          body: (
            <p>
              Use may result in a positive drug test. If you are subject to workplace testing,
              professional licensing conditions or any similar obligation, take that into account
              before purchasing.
            </p>
          ),
        },
        {
          heading: "Storage",
          body: (
            <p>
              Store in the original packaging, sealed, out of direct sunlight, and out of reach of
              children and pets.
            </p>
          ),
        },
        {
          heading: "Questions",
          body: (
            <p>
              Product queries:{" "}
              <a href={`mailto:${email}`} className="ghost-link">
                {email}
              </a>
              . Telephone: <Pending label="phone number" />.
            </p>
          ),
        },
      ]}
    />
  );
}
