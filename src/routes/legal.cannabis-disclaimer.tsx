import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { seoMeta } from "@/lib/seo";
import { LAST_UPDATED, LEGAL_ENTITY } from "@/lib/legal";

export const Route = createFileRoute("/legal/cannabis-disclaimer")({
  head: () => ({
    meta: seoMeta({
      title: "Cannabis Product Disclaimer · Terps",
      description:
        "Important information about cannabis products, effects, age and eligibility requirements, and legal responsibility.",
      path: "/legal/cannabis-disclaimer",
    }),
    links: [
      {
        rel: "canonical",
        href: "https://terps2.carbonmediasolutions.com/legal/cannabis-disclaimer",
      },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cannabis Product Disclaimer"
      lastUpdated={LAST_UPDATED}
      intro={
        <>
          <p>
            The products offered by {LEGAL_ENTITY} may contain cannabis, cannabinoids and/or other
            cannabis-derived ingredients.
          </p>
          <p className="mt-4">
            Cannabis products may affect individuals differently. Products containing cannabinoids
            may cause impairment and may not be suitable for everyone.
          </p>
        </>
      }
      sections={[
        {
          heading: "Important",
          body: (
            <>
              <p>
                You must not purchase, possess, consume, use, transport, resell or otherwise handle
                any cannabis product unless doing so is lawful in your jurisdiction and you satisfy
                all applicable age and eligibility requirements.
              </p>
              <p>
                {LEGAL_ENTITY} does not encourage or promote unlawful possession, use, distribution
                or transportation of cannabis products.
              </p>
              <p>
                Do not operate a motor vehicle, operate machinery or perform activities requiring
                full alertness after consuming a product that may cause impairment.
              </p>
              <p>
                Do not combine cannabis products with alcohol or other substances where doing so may
                create additional risks.
              </p>
              <p>
                Pregnant or breastfeeding individuals, individuals taking medication, and individuals
                with medical conditions should consult an appropriately qualified healthcare
                professional before using cannabis or cannabinoid products.
              </p>
              <p>
                Cannabis products are not intended to diagnose, treat, cure or prevent any disease
                unless expressly authorised and lawfully marketed for such purposes.
              </p>
              <p>
                Effects may vary depending on the individual, product, dosage, tolerance, method of
                consumption and other factors.
              </p>
            </>
          ),
        },
        {
          heading: "Age and Eligibility",
          body: (
            <>
              <p>
                By purchasing from our website, you confirm that you meet the minimum legal age and
                all other applicable requirements for purchasing and possessing the relevant product
                in the jurisdiction in which you are located.
              </p>
              <p>
                We reserve the right to request proof of age or eligibility and to refuse or cancel
                an order where we reasonably believe that applicable requirements have not been
                satisfied.
              </p>
            </>
          ),
        },
        {
          heading: "Legal Responsibility",
          body: (
            <>
              <p>Cannabis laws vary between jurisdictions and may change over time.</p>
              <p>
                It is your responsibility to understand and comply with the laws applicable to you,
                including laws relating to possession, consumption, transportation, importation,
                exportation and resale.
              </p>
              <p>
                {LEGAL_ENTITY} is not responsible for a customer’s decision to purchase, possess,
                transport or use a product in a manner that is unlawful in the customer’s
                jurisdiction.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
