import { MetaLabel } from "@/components/brand/MetaLabel";
import { StrainTypePill } from "@/components/brand/StrainTypePill";
import { Sparkles, Leaf, HeartPulse, Wind } from "lucide-react";
import { getStrainProductImage } from "@/lib/strain-assets";
import type { Strain } from "@/lib/types";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-[color:var(--accent-sage,#7d9b76)]/15 px-3.5 py-1.5 text-[0.78rem] font-body font-medium text-[color:var(--text-primary)]">
      {children}
    </span>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-7">
      <div className="flex items-center gap-2 text-[color:var(--accent-sage,#7d9b76)]">
        {icon}
        <span className="meta-xs">{title}</span>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function StrainInformation({ strain }: { strain: Strain }) {
  const img = getStrainProductImage(strain.slug);
  const effects = strain.effects ?? [];
  const flavors = strain.flavor_tags ?? [];
  const helps = strain.helps_with ?? [];
  const negatives = strain.negatives ?? [];
  const terpenes = strain.terpene_breakdown?.slice(0, 3) ?? [];

  return (
    <section className="px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="meta-xs text-[color:var(--accent-sage,#7d9b76)]">
            ✦ STRAIN INFORMATION
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">About {strain.name}.</h2>
          {strain.description && (
            <p className="mx-auto mt-5 max-w-xl text-base text-[color:var(--text-secondary)]">
              {strain.description}
            </p>
          )}
        </div>

        {/* Two-column */}
        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-5 md:gap-16">
          <div className="md:col-span-2">
            <div className="rounded-2xl bg-[color:var(--bg-surface)] p-10">
              {img && (
                <img
                  src={img}
                  alt={strain.name}
                  className="mx-auto max-h-[360px] w-auto"
                  style={{ filter: "drop-shadow(0 24px 40px rgba(40,60,40,0.25))" }}
                />
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="meta-xs text-[color:var(--text-tertiary)]">
                {strain.weight_grams ?? 0.75}G
              </span>
              {strain.strain_type && <StrainTypePill type={strain.strain_type} />}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {effects.length > 0 && (
                <Card icon={<Sparkles className="h-4 w-4" strokeWidth={1.5} />} title="EFFECTS">
                  <div className="flex flex-wrap gap-2">
                    {effects.map((e) => <Pill key={e}>{e}</Pill>)}
                  </div>
                </Card>
              )}
              {flavors.length > 0 && (
                <Card icon={<Leaf className="h-4 w-4" strokeWidth={1.5} />} title="FLAVORS">
                  <div className="flex flex-wrap gap-2">
                    {flavors.map((f) => <Pill key={f}>{f}</Pill>)}
                  </div>
                </Card>
              )}
              {helps.length > 0 && (
                <Card icon={<HeartPulse className="h-4 w-4" strokeWidth={1.5} />} title="MAY HELP WITH">
                  <div className="flex flex-wrap gap-2">
                    {helps.map((h) => <Pill key={h}>{h}</Pill>)}
                  </div>
                  <p className="mt-5 font-display text-xs italic text-[color:var(--text-tertiary)]">
                    Not medical advice. Consult a healthcare professional.
                  </p>
                </Card>
              )}
              {negatives.length > 0 && (
                <Card icon={<Wind className="h-4 w-4" strokeWidth={1.5} />} title="COMMON FEELINGS">
                  <div className="flex flex-wrap gap-2">
                    {negatives.map((n) => <Pill key={n}>{n}</Pill>)}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Terpenes band */}
        {terpenes.length > 0 && (
          <div className="mt-20">
            <div className="text-center">
              <MetaLabel className="text-[color:var(--accent-sage,#7d9b76)]">
                TOP TERPENES
              </MetaLabel>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {terpenes.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-8 text-center"
                >
                  <p className="font-display text-2xl">{t.name}</p>
                  <p className="mt-3 font-display text-4xl text-[color:var(--accent-gold)]">
                    {t.percentage}%
                  </p>
                  <p className="mt-3 font-display italic text-base text-[color:var(--text-secondary)]">
                    {t.descriptor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lineage */}
        {strain.lineage && (
          <div className="mx-auto mt-20 max-w-2xl text-center">
            <MetaLabel className="text-[color:var(--accent-sage,#7d9b76)]">LINEAGE</MetaLabel>
            <p className="mt-5 text-base leading-relaxed text-[color:var(--text-secondary)]">
              {strain.lineage}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}