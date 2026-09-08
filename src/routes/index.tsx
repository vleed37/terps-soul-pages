import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { listStrains } from "@/lib/strains.functions";
import { GoldButton } from "@/components/brand/GoldButton";
import { GhostLink } from "@/components/brand/GhostLink";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ScrollReveal } from "@/components/brand/ScrollReveal";
import { CaviarStixTeaser } from "@/components/brand/CaviarStixTeaser";
import { subscribeEmail } from "@/lib/forms.functions";
import heroImage from "@/assets/hero-mindspark.jpg";
import { getStrainProductImage } from "@/lib/strain-assets";
import type { Strain } from "@/lib/types";
import { seoMeta } from "@/lib/seo";

/** Swap-in point for the hero visual — replace with a new still or a <video> source. */
const HERO_MEDIA = heroImage;


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
          <h1 className="max-w-3xl font-display text-[3rem] font-semibold leading-[1.02] md:text-[5.5rem]">

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
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-[2.5rem] font-semibold leading-[1.03] md:text-[4.5rem]">
              Infused Pre-Rolls
            </h2>
            <p className="mt-5 font-display text-[1.35rem] italic text-[color:var(--text-secondary)] md:text-[1.6rem]">
              The only premium infused pre-roll you need.
            </p>
            <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-[color:var(--text-secondary)] md:text-lg">
              Premium flower, hand-infused with cured hash and crumble. Every pre-roll is checked by hand
              before it's sealed in its tube.
            </p>
          </ScrollReveal>
          {teaserTiles.length > 0 && (
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {teaserTiles.map(({ strain, image }, i) => (
                <ScrollReveal key={strain.id} delay={i * 0.08}>
                  <div className="aspect-[4/5] overflow-hidden rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]">
                    <img
                      src={image}
                      alt={strain.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
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

      {/* 4. DROP ALERTS */}


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
          <h2 className="font-display text-4xl font-semibold md:text-5xl">Get word when the next drop lands.</h2>

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
