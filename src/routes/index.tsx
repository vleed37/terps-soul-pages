import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { listStrains } from "@/lib/strains.functions";
import { Hairline } from "@/components/brand/Hairline";
import { GoldButton } from "@/components/brand/GoldButton";
import { GhostLink } from "@/components/brand/GhostLink";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { StrainCard } from "@/components/brand/StrainCard";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import { PullQuote } from "@/components/brand/PullQuote";
import { subscribeEmail } from "@/lib/forms.functions";
import lifestyle1 from "@/assets/lifestyle-1.webp";
import lifestyle3 from "@/assets/lifestyle-3.webp";
import lifestyle4 from "@/assets/lifestyle-4.webp";
import greenCrack from "@/assets/strain-green-crack.webp";
import { getStrainProductImage } from "@/lib/strain-assets";
import { useState } from "react";
import type { Strain } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["strains"],
      queryFn: () => listStrains(),
    }),
  component: Home,
});

function Home() {
  const { data: strains } = useSuspenseQuery({ queryKey: ["strains"], queryFn: () => listStrains() });
  const list = (strains ?? []) as unknown as Strain[];
  const featured = list.find((s) => s.slug === "green-crack") ?? list[0];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  return (
    <>
      {/* 1. HERO */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0">
          <video
            src="/hero.mp4"
            poster="/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            className="hero-video h-[120%] w-full object-cover opacity-60"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--bg-rich)]/50 via-[color:var(--bg-rich)]/65 to-[color:var(--bg-rich)]" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 md:px-12">
          <Hairline w="120px" className="mb-8" />
          <h1 className="max-w-3xl font-display text-[2.75rem] font-normal leading-[1.05] md:text-[5rem]">
            The depth of the inhale.<br />
            <em className="not-italic text-[color:var(--accent-gold)]">The truth of the flavor.</em>
          </h1>
          <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-[color:var(--text-secondary)] md:text-lg">
            South African–bred. Hand-infused with live hash rosin. Built for the moment, not the noise.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="/shop"><GoldButton>Discover the collection</GoldButton></a>
            <a href="/about"><GoldButton variant="tertiary">Our story</GoldButton></a>
          </div>
        </div>
      </section>

      {/* 2. THE COLLECTION */}
      <section className="px-6 py-32 md:py-40">
        <div className="mx-auto max-w-[1400px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>The Collection</MetaLabel>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
              Four drops. Four flavors. <em className="text-[color:var(--accent-gold)]">One standard.</em>
            </h2>
            <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-[color:var(--text-secondary)] md:text-lg">
              Every Terps strain is selected for its terpene profile, slow-cured, and hand-infused with live hash rosin. No shortcuts. No fillers.
            </p>
          </ScrollReveal>
          <div className="mx-auto mt-20 grid max-w-[900px] grid-cols-1 gap-8 sm:grid-cols-2">
            {list.map((s, i) => (
              <ScrollReveal key={s.id} delay={i * 0.08}>
                <StrainCard strain={s} />
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-16 text-center">
            <GhostLink to="/shop">Explore all strains</GhostLink>
          </div>
        </div>
      </section>

      {/* 3. FEATURED — Green Crack */}
      {featured && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src={greenCrack} alt="" className="h-full w-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--bg-rich)] via-[color:var(--bg-rich)]/92 to-[color:var(--bg-rich)]/70" />
            {/* soft sage gradient blob behind product */}
            <div
              className="absolute right-[8%] top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 rounded-full md:block"
              style={{
                background: "radial-gradient(circle, rgba(164,178,133,0.12), transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          </div>
          <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-6 py-32 md:grid-cols-5 md:py-48">
            <ScrollReveal className="md:col-span-3">
              <MetaLabel gold>Featured · Daytime</MetaLabel>
              <h2 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">{featured.name}</h2>
              <p className="mt-4 font-display text-2xl italic text-[color:var(--text-secondary)]">{featured.tagline}</p>
              <p className="mt-8 max-w-lg font-body text-lg leading-relaxed text-[color:var(--text-primary)]">
                {featured.story}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15} className="hidden md:col-span-2 md:block">
              <img src={getStrainProductImage(featured.slug) ?? greenCrack} alt={featured.name} className="mx-auto max-h-[520px] w-auto rounded-xl drop-shadow-[0_28px_60px_rgba(0,0,0,0.8)]" />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* 4. THE CRAFT */}
      <section className="px-6 py-32 md:py-40">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>The Craft</MetaLabel>
            <h2 className="mt-6 font-display text-4xl leading-tight md:text-5xl">Built slowly. <em className="text-[color:var(--accent-gold)]">Built once.</em></h2>
          </ScrollReveal>
          <div className="mt-20 grid grid-cols-1 gap-px bg-[color:var(--border-subtle)] md:grid-cols-3">
            {[
              { t: "Selected Strains", d: "Hand-picked for terpene profile. Only the cultivars that earn their flavor." },
              { t: "Extended Curing", d: "Slow-cured to lock in the depth and the body. Patience over volume, every batch." },
              { t: "Live Hash Rosin", d: "Solventless, top-tier live rosin in every joint. The cleanest infusion we know." },
            ].map((c, i) => (
              <ScrollReveal key={c.t} delay={i * 0.1} className="bg-[color:var(--bg-base)] p-10 md:p-12">
                <div className="h-px w-12 bg-[color:var(--accent-gold)]" />
                <h3 className="mt-6 font-display text-2xl">{c.t}</h3>
                <p className="mt-4 font-body text-base leading-relaxed text-[color:var(--text-secondary)]">{c.d}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LIFESTYLE QUOTE */}
      <section className="relative h-[80vh] overflow-hidden">
        <img src={lifestyle3} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-[color:var(--bg-rich)]/65" />
        <div className="relative mx-auto flex h-full max-w-3xl items-center justify-center px-6">
          <PullQuote attribution="Terps">We don't chase hype. We chase flavor.</PullQuote>
        </div>
      </section>

      {/* 6. STRAIN LIBRARY TEASER */}
      <section className="px-6 py-32 md:py-40">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>The Strain Library</MetaLabel>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">Know what you're tasting.</h2>
            <p className="mx-auto mt-6 max-w-xl text-[color:var(--text-secondary)] md:text-lg">
              Terpenes shape the flavor, the high, and the experience. Learn what's in each drop and why it matters.
            </p>
          </ScrollReveal>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { name: "Limonene", taste: "tastes like citrus", d: "Bright, lifted, sharp. The terpene behind sharp citrus pop." },
              { name: "Myrcene", taste: "tastes like mango", d: "Tropical, sweet, mellow. Behind the smooth body of balanced strains." },
              { name: "Pinene", taste: "tastes like pine", d: "Sharp, fresh, clarifying. Associated with mental clarity and alertness." },
            ].map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.08} className="rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-8">
                <h3 className="font-display text-2xl">{t.name}</h3>
                <p className="mt-2 font-display italic text-[color:var(--accent-gold)]">{t.taste}</p>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">{t.d}</p>
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-12 text-center">
            <GhostLink to="/strains">Explore the library</GhostLink>
          </div>
        </div>
      </section>

      {/* 7. DROP ALERTS */}
      <DropAlerts />

      {/* 8. CLOSING */}
      <section className="relative overflow-hidden px-6 py-32 md:py-48">
        <img src={lifestyle4} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-[color:var(--bg-rich)]/80" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-display text-5xl italic leading-tight md:text-7xl">
            Flavour first. <em className="text-[color:var(--accent-gold)]">Always.</em>
          </p>
          <div className="mt-10"><GhostLink to="/shop">Explore the collection</GhostLink></div>
        </div>
      </section>
    </>
  );
}

function DropAlerts() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await subscribeEmail({ data: { email, source: "drop-alerts" } });
      setDone(true);
    } catch {
      setErr("Try a valid email.");
    }
  }

  return (
    <section className="px-6 py-32 md:py-40">
      <div className="mx-auto max-w-2xl text-center">
        <ScrollReveal>
          <MetaLabel gold>Stay Close</MetaLabel>
          <h2 className="mt-6 font-display text-4xl md:text-5xl">Get word when the next drop lands.</h2>
          <p className="mx-auto mt-6 max-w-md text-[color:var(--text-secondary)]">
            Quiet emails. New flavors. The occasional batch story.
          </p>
          {done ? (
            <p className="mt-10 font-display italic text-2xl text-[color:var(--accent-gold)]">You're on the list.</p>
          ) : (
            <form onSubmit={submit} className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-[4px] border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] px-5 py-4 text-sm outline-none focus:border-[color:var(--accent-gold)]"
              />
              <GoldButton type="submit">Notify me</GoldButton>
            </form>
          )}
          {err && <p className="mt-3 text-sm text-[color:var(--status-error)]">{err}</p>}
        </ScrollReveal>
      </div>
    </section>
  );
}
