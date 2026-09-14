import { ReactNode } from "react";

import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";
import { LegalDraftNotice } from "@/components/layout/LegalDraftNotice";
import { SALES_EMAIL } from "@/lib/brand";
import { BUSINESS } from "@/lib/business";

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface Props {
  eyebrow: string;
  title: string;
  /** Confirmed effective date, or null while the owner has not supplied one. */
  lastUpdated?: string | null;
  intro?: ReactNode;
  sections: LegalSection[];
}

export function LegalPage({ eyebrow, title, lastUpdated, intro, sections }: Props) {
  const effective = lastUpdated ?? BUSINESS.effectiveDate;

  return (
    <div className="px-6 py-20 md:px-12 md:py-28">
      <article className="mx-auto max-w-[760px]">
        <header className="text-center">
          <MetaLabel gold>✦ {eyebrow}</MetaLabel>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">{title}</h1>
          <p className="meta-xs mt-6 text-[color:var(--text-tertiary)]">
            {effective ? `Effective: ${effective}` : "Effective date to be confirmed"}
          </p>
        </header>

        <LegalDraftNotice />

        {intro && (
          <div className="mt-12 font-body text-lg leading-[1.85] text-[color:var(--text-primary)]">
            {intro}
          </div>
        )}

        <Hairline className="my-16" />


        <div className="space-y-14">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-2xl md:text-3xl">{s.heading}</h2>
              <div className="prose-legal mt-5 space-y-4 font-body text-base leading-[1.85] text-[color:var(--text-secondary)]">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        <Hairline className="my-16" />

        <p className="text-center font-display text-lg italic text-[color:var(--text-secondary)]">
          Questions? Reach us at{" "}
          <a href={`mailto:${SALES_EMAIL}`} className="ghost-link">{SALES_EMAIL}</a>
          .
        </p>
      </article>
    </div>
  );
}