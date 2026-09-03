import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Instagram, Mail } from "lucide-react";
import { listStrains } from "@/lib/strains.functions";
import { Hairline } from "@/components/brand/Hairline";
import { GoldButton } from "@/components/brand/GoldButton";
import { GhostLink } from "@/components/brand/GhostLink";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import { PullQuote } from "@/components/brand/PullQuote";
import { Logo } from "@/components/brand/Logo";
import { CaviarStixTeaser } from "@/components/brand/CaviarStixTeaser";
import { subscribeEmail } from "@/lib/forms.functions";
import { SALES_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/brand";
import lifestyle3 from "@/assets/lifestyle-3.webp";
import stockistDisplay from "@/assets/stockist-display.jpg";
import heroImage from "@/assets/hero-mindspark.jpg";
import { getStrainProductImage } from "@/lib/strain-assets";
import type { Strain } from "@/lib/types";
import { seoMeta } from "@/lib/seo";

/** Swap-in point for the hero visual — replace with a new still or a <video> source. */
const HERO_MEDIA = heroImage;
/** Swap-in point for the stockist programme photo. */
const STOCKIST_IMAGE = stockistDisplay;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: seoMeta({
      title: "Terps · Flavour-First Infused Pre-Rolls",
      description:
        "Premium infused pre-rolls bred in South Africa. Four signature strains, lab-tested, available at select stockists nationwide.",
      path: "/",
    }),
  }),
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
  // listStrains() already filters is_active and orders by display_order.
  const teaserTiles = list
    .filter((s) => s.product_line === "pre_roll")
    .map((s) => ({ strain: s, image: getStrainProductImage(s.slug) }))
    .filter((t): t is { strain: Strain; image: string } => Boolean(t.image))
    .slice(0, 3);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  return (
    <>
      {/* 1. HERO */}
      <section ref={heroRef} className="tone-dark relative h-screen w-full overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0">
          <img
            src={HERO_MEDIA}
            alt="Terps premium infused pre-roll"
            className="h-[120%] w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0A08]/50 via-[#0B0A08]/65 to-[#0B0A08]" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 md:px-12">
          <Logo onTone="dark" height={39} className="mb-8" />
          <h1 className="max-w-3xl font-display text-[3rem] font-normal leading-[1.02] md:text-[5.5rem]">
            Flavour first.
          </h1>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-[color:var(--text-secondary)] md:text-lg">
            South Africa's premium handcrafted infused pre-rolls.
          </p>
          <div className="mt-10 flex flex-col items-start gap-5">
            <a href="/shop">
              <GoldButton variant="cream">Discover the collection</GoldButton>
            </a>
            <GhostLink to="/about">Our story</GhostLink>
          </div>
        </div>
      </section>

      {/* 2. INFUSED PRE-ROLLS TEASER */}
      <section className="px-6 py-32 md:py-40">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>✦ Infused Pre-Rolls</MetaLabel>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
              The only premium infused pre-roll you need.
            </h2>
            <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-[color:var(--text-secondary)] md:text-lg">
              Premium flower, hand-infused with cured hash and crumble. Every pre-roll is checked by hand
              before it's sealed in its tube.
            </p>
          </ScrollReveal>
          {teaserTiles.length > 0 && (
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {teaserTiles.map(({ strain, image }, i) => (
                <ScrollReveal key={strain.id} delay={i * 0.08}>
                  <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-8">
                    <img
                      src={image}
                      alt={strain.name}
                      loading="lazy"
                      className="max-h-full w-auto object-contain"
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
          <div className="mt-16 text-center">
            <a href="/shop">
              <GoldButton>Shop the collection</GoldButton>
            </a>
          </div>
        </div>
      </section>

      {/* 3. CAVIAR STICKS */}
      <CaviarStixTeaser />

      {/* 4. SOCIALS */}
      <section className="px-6 py-32 md:py-40">
        <div className="mx-auto max-w-[900px] text-center">
          <ScrollReveal>
            <MetaLabel gold>✦ Follow Terps</MetaLabel>
            <Hairline w="120px" className="mx-auto my-10" />
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-16">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-3 font-display text-2xl italic text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--accent-gold)] md:text-3xl"
              >
                <Instagram strokeWidth={1.5} className="h-6 w-6 shrink-0" />
                <span className="break-all">{INSTAGRAM_HANDLE}</span>
              </a>
              <a
                href={`mailto:${SALES_EMAIL}`}
                className="inline-flex items-center gap-3 font-display text-2xl italic text-[color:var(--text-primary)] transition-colors hover:text-[color:var(--accent-gold)] md:text-3xl"
              >
                <Mail strokeWidth={1.5} className="h-6 w-6 shrink-0" />
                <span className="break-all">{SALES_EMAIL}</span>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. THE CRAFT */}
      <section className="px-6 py-32 md:py-40">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>✦ The Craft</MetaLabel>
            <h2 className="mt-6 font-display text-4xl leading-tight md:text-5xl">Built slowly. <em className="text-[color:var(--accent-gold)]">Built once.</em></h2>
          </ScrollReveal>
          <div className="mt-20 grid grid-cols-1 gap-px bg-[color:var(--border-subtle)] md:grid-cols-3">
            {[
              { t: "Selected Strains", d: "Hand-picked for terpene profile. Only the cultivars that earn their flavour." },
              { t: "Extended Curing", d: "Slow-cured to lock in the depth and the body. Patience over volume, every batch." },
              { t: "Hand Infusion", d: "Premium flower, cured hash and crumble, brought together by hand." },
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

      {/* 6. LIFESTYLE QUOTE */}
      <section className="tone-dark relative h-[80vh] overflow-hidden">
        <img src={lifestyle3} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-[#0B0A08]/65" />
        <div className="relative mx-auto flex h-full max-w-3xl items-center justify-center px-6">
          <PullQuote attribution="Terps">Every pre-roll is checked by hand before it's sealed.</PullQuote>
        </div>
      </section>

      {/* 7. STRAIN LIBRARY TEASER */}
      <section className="px-6 py-32 md:py-40">
        <div className="mx-auto max-w-[1200px]">
          <ScrollReveal className="text-center">
            <MetaLabel gold>✦ The Strain Library</MetaLabel>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">Know what you're tasting.</h2>
            <p className="mx-auto mt-6 max-w-xl text-[color:var(--text-secondary)] md:text-lg">
              Terpenes shape the flavour, the high, and the experience. Learn what's in each drop and why it matters.
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

      {/* 8. BECOME A STOCKIST */}
      <section className="relative overflow-hidden bg-[color:var(--bg-contrast)] px-6 py-32 md:py-40">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 md:grid-cols-5">
          <div className="md:col-span-3">
            <ScrollReveal>
              <p className="meta-xs text-[color:var(--accent-gold)]">✦ Stockist Program</p>
              <h2 className="mt-6 font-display text-5xl leading-[1.05] text-[color:var(--text-on-dark)] md:text-6xl lg:text-7xl">
                Stock Terps in your store.
              </h2>
              <p className="mt-8 max-w-xl font-body text-lg leading-relaxed text-[color:var(--text-on-dark)] opacity-80">
                Sign up to become a stockist and get wholesale pricing, early access to new drops and
                marketing support.
              </p>
              <div className="mt-12">
                <a href="/wholesale">
                  <GoldButton>Become a stockist</GoldButton>
                </a>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.15} className="md:col-span-2">
            <img
              src={STOCKIST_IMAGE}
              alt="Curated Terps retail display"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-lg object-cover shadow-[var(--shadow-card-hover)]"
            />
          </ScrollReveal>
        </div>
      </section>

      <DropAlerts />
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
    <section className="tone-dark px-6 py-32 md:py-40">
      <div className="mx-auto max-w-2xl text-center">
        <ScrollReveal>
          <MetaLabel gold>✦ Stay Close</MetaLabel>
          <h2 className="mt-6 font-display text-4xl md:text-5xl">Get word when the next drop lands.</h2>
          <p className="mx-auto mt-6 max-w-md text-[color:var(--text-secondary)]">
            Quiet emails. New flavours. The occasional strain story.
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
              <GoldButton type="submit" variant="cream">Notify me</GoldButton>
            </form>
          )}
          {err && <p className="mt-3 text-sm text-[color:var(--status-error)]">{err}</p>}
        </ScrollReveal>
      </div>
    </section>
  );
}
