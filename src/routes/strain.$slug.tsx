import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getStrainBySlug } from "@/lib/strains.functions";
import { getStrainImage, getStrainProductImage } from "@/lib/strain-assets";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { FeatureBand } from "@/components/brand/FeatureBand";
import { EffectChip, FlavorChip } from "@/components/brand/Chips";
import { QuantityStepper } from "@/components/brand/QuantityStepper";
import { useCart } from "@/lib/store/cart";
import { useState } from "react";
import type { Strain } from "@/lib/types";

export const Route = createFileRoute("/strain/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["strain", params.slug],
      queryFn: () => getStrainBySlug({ data: { slug: params.slug } }),
    }),
  head: ({ params }) => ({ meta: [{ title: `Terps — ${params.slug}` }] }),
  component: StrainDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl py-40 text-center">
      <p className="font-display italic text-4xl">Strain not found.</p>
      <Link to="/shop" className="ghost-link mt-8">Back to collection</Link>
    </div>
  ),
  errorComponent: () => <div className="py-40 text-center">Something went wrong.</div>,
});

function StrainDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["strain", slug], queryFn: () => getStrainBySlug({ data: { slug } }) });
  const s = data as unknown as Strain | null;
  const [qty, setQty] = useState(1);
  const addItem = useCart((st) => st.addItem);
  if (!s) return null;
  const img = getStrainProductImage(s.slug);
  const bgImg = getStrainImage(s.slug);
  const videoSrc = `/strains/${s.slug}.mp4`;
  const posterSrc = `/strains/${s.slug}-poster.jpg`;
  const soldOut = s.stock_quantity <= 0;
  const handleAdd = () => {
    if (soldOut) return;
    addItem(
      {
        strainId: s.id,
        slug: s.slug,
        name: s.name,
        priceZar: Number(s.price_zar),
        weightGrams: Number(s.weight_grams ?? 0.75),
        imageUrl: img,
        accentPrimary: s.accent_color_primary ?? undefined,
        accentAccent: s.accent_color_accent ?? undefined,
        maxStock: s.stock_quantity,
      },
      qty,
    );
  };

  return (
    <>
      {/* HERO */}
      <section className="relative h-[70vh] overflow-hidden">
        <video
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          className="hero-video absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--bg-rich)]/30 via-[color:var(--bg-rich)]/70 to-[color:var(--bg-rich)]" />
        <div className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-16 md:px-12">
          <Link to="/shop" className="ghost-link self-start">← The collection</Link>
          <div className="mt-8">
            {s.effect_category && <MetaLabel gold className="capitalize">{s.effect_category} strain</MetaLabel>}
            <h1 className="mt-4 font-display text-6xl leading-none md:text-8xl">{s.name}</h1>
            <Hairline w="120px" className="my-6" />
            <p className="font-display text-2xl italic text-[color:var(--text-secondary)]">{s.tagline}</p>
            <p className="meta-xs mt-6 text-[color:var(--text-tertiary)]">
              {s.weight_grams ?? 0.75}G · Live Rosin Infused · Lab Verified · Batch {s.batch_number}
            </p>
          </div>
        </div>
      </section>

      {/* BUY ZONE */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 md:grid-cols-2">
          <div className="rounded-lg bg-[color:var(--bg-surface)] p-12">
            {img && <img src={img} alt={s.name} className="mx-auto max-h-[520px] rounded-xl" />}
          </div>
          <div>
            <h2 className="font-display text-4xl md:text-5xl">{s.name}</h2>
            <p className="mt-4 font-body text-3xl font-bold">R{Number(s.price_zar).toFixed(0)}</p>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">Free delivery on orders over R500</p>
            <p className="meta-xs mt-4 text-gold">{s.stock_quantity} in stock · Limited</p>
            <Hairline className="my-8" />
            <div className="mb-6"><QuantityStepper value={qty} onChange={setQty} /></div>
            <GoldButton onClick={handleAdd} disabled={soldOut} className="w-full">
              {soldOut ? "Sold Out" : "Add to Cart"}
            </GoldButton>
            <p className="mt-4 text-center text-sm">
              <a href="https://instagram.com/terps.official_" className="ghost-link">Or message us on Instagram</a>
            </p>
            <Hairline className="my-8" />
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              {["Lab Verified", "Batch Numbered", "Secure Checkout", "Couriered in SA"].map((t) => (
                <MetaLabel key={t}>{t}</MetaLabel>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FeatureBand />

      {/* STORY */}
      {s.story && (
        <section className="px-6 py-24 md:px-12">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-16 md:grid-cols-2">
            <div>
              <MetaLabel gold>The Story</MetaLabel>
              <h3 className="mt-4 font-display text-3xl md:text-4xl">{s.tagline}</h3>
              <p className="mt-6 text-lg leading-relaxed text-[color:var(--text-secondary)]">{s.story}</p>
            </div>
            <div className="flex items-center">
              <p className="font-display text-3xl italic text-[color:var(--accent-gold)] md:text-4xl">
                "{s.description}"
                <span className="mt-4 block meta-xs">— Terps</span>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* PROFILE + LAB */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-px bg-[color:var(--border-luxe)] md:grid-cols-3">
          <div className="bg-[color:var(--bg-surface)] p-10">
            <MetaLabel gold>Effect</MetaLabel>
            <h4 className="mt-4 font-display text-2xl capitalize">{s.effect_category}</h4>
            <p className="mt-3 text-sm text-[color:var(--text-secondary)]">{s.description}</p>
          </div>
          <div className="bg-[color:var(--bg-surface)] p-10">
            <MetaLabel gold>Flavor Profile</MetaLabel>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.flavor_tags?.map((f, i) => <FlavorChip key={f} dominant={i === 0}>{f}</FlavorChip>)}
            </div>
          </div>
          <div className="bg-[color:var(--bg-surface)] p-10">
            <MetaLabel gold>Terpenes</MetaLabel>
            <div className="mt-4 space-y-3">
              {s.terpene_breakdown?.map((t) => (
                <div key={t.name} className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-lg">{t.name}</span>
                  <span className="meta-xs text-[color:var(--text-secondary)]">{t.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-[1200px]">
          <MetaLabel gold>Lab Verified</MetaLabel>
          <h3 className="mt-4 font-display text-3xl md:text-4xl">Tested. Numbered. Transparent.</h3>
          <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2">
            <dl className="space-y-3 text-sm">
              {[
                ["Batch Number", s.batch_number],
                ["Test Date", s.test_date],
                ["THC", `${s.thc_percentage}%`],
                ["CBD", `${s.cbd_percentage}%`],
                ["Total Terpenes", `${s.total_terpenes_percentage}%`],
                ["Lab", s.lab_name],
              ].map(([k, v]) => (
                <div key={k as string} className="flex items-baseline justify-between border-b border-dashed border-[color:var(--border-luxe)] pb-2">
                  <dt className="font-display italic text-[color:var(--text-secondary)]">{k}</dt>
                  <dd className="font-body font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-4">
              {s.terpene_breakdown?.map((t) => (
                <div key={t.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-display">{t.name}</span>
                    <span className="meta-xs">{t.percentage}%</span>
                  </div>
                  <div className="mt-2 h-px w-full bg-[color:var(--border-subtle)]">
                    <div className="h-px bg-[color:var(--accent-gold)]" style={{ width: `${Math.min(100, t.percentage * 20)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
