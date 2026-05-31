import { Link } from "@tanstack/react-router";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";

const cards = [
  {
    to: "/shop" as const,
    label: "The Collection",
    copy: "Browse every drop, every flavour.",
  },
  {
    to: "/strains" as const,
    label: "Strain Library",
    copy: "Terpenes, effects, and lineage.",
  },
  {
    to: "/stockists" as const,
    label: "Find a Stockist",
    copy: "Premium retailers across South Africa.",
  },
];

export function BrandNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1200px] flex-col items-center justify-center px-6 py-24 text-center md:px-12 md:py-32">
      <MetaLabel gold>✦ 404</MetaLabel>
      <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
        Lost in the <em className="text-[color:var(--accent-gold)]">field.</em>
      </h1>
      <Hairline w="120px" className="my-8" />
      <p className="mx-auto max-w-md text-base text-[color:var(--text-secondary)] md:text-lg">
        This page doesn't exist — but our strains do. Take a look:
      </p>
      <div className="mt-12 grid w-full grid-cols-1 gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group block rounded-lg border border-[color:var(--border-luxe)] bg-[color:var(--bg-surface)] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--accent-gold)]"
          >
            <h3 className="font-display text-2xl">{c.label}</h3>
            <p className="mt-3 text-sm text-[color:var(--text-secondary)]">{c.copy}</p>
            <p className="mt-6 font-display text-sm italic text-[color:var(--accent-gold)]">
              Explore →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}