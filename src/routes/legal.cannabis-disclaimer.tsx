import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { seoMeta } from "@/lib/seo";

const LAST_UPDATED = "31 May 2026";

export const Route = createFileRoute("/legal/cannabis-disclaimer")({
  head: () => ({
    meta: seoMeta({
      title: "Cannabis Disclaimer · Terps",
      description:
        "Responsible consumption, legal age, and health information for Terps cannabis products. Placeholder copy — under legal review.",
      path: "/legal/cannabis-disclaimer",
    }),
  }),
  component: CannabisDisclaimerPage,
});

function CannabisDisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Important"
      title="Cannabis Disclaimer"
      lastUpdated={LAST_UPDATED}
      intro={
        <p>
          Terps products contain cannabis. Please read this disclaimer carefully before purchasing
          or consuming any Terps product.
        </p>
      }
      sections={[
        {
          heading: "Adults Only — 18+",
          body: (
            <p>
              Terps products are intended for adults aged 18 years or older. We do not sell to or
              market to minors. ID may be required on delivery or collection.
            </p>
          ),
        },
        {
          heading: "No Medical Claims",
          body: (
            <p>
              Terps products are not intended to diagnose, treat, cure, or prevent any disease.
              Statements on this site have not been evaluated by SAHPRA or any equivalent
              regulator. Consult a qualified healthcare practitioner before use, especially if you
              are pregnant, breastfeeding, or on prescription medication.
            </p>
          ),
        },
        {
          heading: "Responsible Consumption",
          body: (
            <p>
              Cannabis affects everyone differently. Start with a low dose, go slow, and never
              combine with alcohol or other substances. Keep all products out of reach of children
              and pets.
            </p>
          ),
        },
        {
          heading: "Do Not Drive or Operate Machinery",
          body: (
            <p>
              Do not drive, operate heavy machinery, or perform any activity requiring full
              attention or coordination after consuming cannabis. Driving under the influence is
              illegal and dangerous.
            </p>
          ),
        },
        {
          heading: "Legal Status",
          body: (
            <p>
              Terps operates within South African law for adult-use cannabis. Laws differ by
              region — please ensure you understand and comply with the laws applicable to you
              before purchasing or consuming.
            </p>
          ),
        },
        {
          heading: "Storage",
          body: (
            <p>
              Store Terps products in a cool, dry place, sealed in their original packaging, and
              well out of reach of children, pets, and anyone under 18.
            </p>
          ),
        },
      ]}
    />
  );
}