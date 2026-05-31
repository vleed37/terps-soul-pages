import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface Props {
  eyebrow: string;
  title: string;
  lastUpdated: string; // e.g. "31 May 2026"
  intro?: ReactNode;
  sections: LegalSection[];
}

export function LegalPage({ eyebrow, title, lastUpdated, intro, sections }: Props) {
  return (
    <div className="px-6 py-20 md:px-12 md:py-28">
      <article className="mx-auto max-w-[760px]">
        <header className="text-center">
          <MetaLabel gold>✦ {eyebrow}</MetaLabel>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">{title}</h1>
          <p className="meta-xs mt-6 text-[color:var(--text-tertiary)]">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="mt-12 flex items-start gap-3 rounded-lg border border-[color:var(--accent-gold)]/40 bg-[color:var(--accent-gold-muted)] p-5">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--accent-gold)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="text-sm leading-relaxed text-[color:var(--text-primary)]">
            <strong className="font-semibold">This is a placeholder.</strong> Final legal copy to be
            reviewed by qualified counsel before launch.
          </p>
        </div>

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
          <a href="mailto:sales@terpnation.co.za" className="ghost-link">
            sales@terpnation.co.za
          </a>
          .
        </p>
      </article>
    </div>
  );
}