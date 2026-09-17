import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getStrainBySlug } from "@/lib/strains.functions";
import { getStrainImage, getStrainProductImage, getStrain3DModel } from "@/lib/strain-assets";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { EffectChip, FlavorChip } from "@/components/brand/Chips";
import { QuantityStepper } from "@/components/brand/QuantityStepper";
import { NotifyMeModal } from "@/components/brand/NotifyMeModal";
import { FindClosestStockistModal } from "@/components/brand/FindClosestStockistModal";
import { ProductGallery } from "@/components/brand/ProductGallery";
import { ReviewsSection } from "@/components/brand/ReviewsSection";
import { InlineRating } from "@/components/brand/InlineRating";
import { MapPin } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useState } from "react";
import type { Strain } from "@/lib/types";
import { PUBLIC_SITE_URL, seoMeta, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { canonicalSlug, lineMeta } from "@/lib/product-lines";
import { DELIVERY_COPY } from "@/lib/brand";

export const Route = createFileRoute("/strain/$slug")({
  loader: async ({ context, params }) => {
    // Newer spellings ("caviar-stick-*", "girl-scout-cookies") resolve to the
    // existing database slug so shared and indexed links never break.
    const canonical = canonicalSlug(params.slug);
    if (canonical !== params.slug) {
      throw redirect({ to: "/strain/$slug", params: { slug: canonical } });
    }
    const strain = await context.queryClient.ensureQueryData({
      queryKey: ["strain", canonical],
      queryFn: () => getStrainBySlug({ data: { slug: canonical } }),
    });
    if (!strain) throw notFound();
    return strain;
  },
  head: ({ params, loaderData }) => {
    const s = loaderData as unknown as Strain | null;
    if (!s) {
      return {
        meta: seoMeta({
          title: "Strain · Terps",
          description:
            "Explore the Terps strain library — flavour-first infused pre-rolls made in South Africa.",
          path: `/strain/${params.slug}`,
        }),
      };
    }
    const meta = lineMeta(s.product_line);
    const description = `${s.name} — ${meta.name} by Terps.${
      s.tagline ? ` ${s.tagline}.` : ""
    }`;
    // Social previews need an absolute URL, so only uploaded photography can be
    // used here — bundled assets resolve relative and would break the preview.
    const uploaded = s.product_image_url || s.hero_image_url;
    const image = uploaded && uploaded.startsWith("http") ? uploaded : DEFAULT_OG_IMAGE;
    return {
      meta: seoMeta({
        title: `${s.name} · Terps`,
        description,
        path: `/strain/${params.slug}`,
        ogType: "product",
        image,
      }),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: s.name,
            description: s.description ?? s.tagline ?? "",
            image: image.startsWith("http") ? image : `${PUBLIC_SITE_URL}${image}`,
            sku: s.slug,
            brand: { "@type": "Brand", name: "Terps" },
            category: meta.name,
            offers: {
              "@type": "Offer",
              url: `${PUBLIC_SITE_URL}/strain/${s.slug}`,
              priceCurrency: "ZAR",
              price: Number(s.price_zar).toFixed(2),
              availability:
                (s.stock_quantity ?? 0) > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          }),
        },
      ],
    };
  },
  component: StrainDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl py-40 text-center">
      <p className="font-display italic text-4xl">Product not found.</p>
      <Link to="/shop" className="ghost-link mt-8">
        Back to the collection
      </Link>
    </div>
  ),
  errorComponent: () => <div className="py-40 text-center">Something went wrong.</div>,
});

function StrainDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["strain", slug],
    queryFn: () => getStrainBySlug({ data: { slug } }),
  });
  const s = data as unknown as Strain | null;
  const [qty, setQty] = useState(1);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [stockistOpen, setStockistOpen] = useState(false);
  const addItem = useCart((st) => st.addItem);
  if (!s) return null;

  const meta = lineMeta(s.product_line);
  const img = getStrainProductImage(s.slug);
  const extra = ((s as unknown as { gallery_image_urls?: string[] | null })
    .gallery_image_urls ?? []) as string[];
  const gallery = [img, ...extra].filter(Boolean) as string[];

  const soldOut = s.stock_quantity <= 0;
  const isCaviar = s.product_line === "caviar_stix";

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

  const terpeneNames = (s.terpene_breakdown ?? []).map((t) => t.name).filter(Boolean);

  return (
    <div className="px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1200px]">
        {/* 1 — Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-[color:var(--text-tertiary)]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-[color:var(--text-primary)]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to={meta.path} className="hover:text-[color:var(--text-primary)]">
                {meta.plural}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[color:var(--text-primary)]">
              {s.name}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* 2 — Gallery */}
          <ProductGallery
            images={gallery}
            name={s.name}
            lineName={meta.name}
            modelUrl={getStrain3DModel(s.slug)}
          />

          <div>
            {/* 3 — Name and category */}
            <MetaLabel gold>{meta.name}</MetaLabel>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] md:text-6xl">{s.name}</h1>

            {/* 4 — Short summary */}
            {s.tagline && (
              <p className="mt-4 font-display italic text-lg text-[color:var(--text-secondary)]">
                {s.tagline}
              </p>
            )}

            {/* 5 — Rating, only once approved reviews exist */}
            <InlineRating strainId={s.id} />

            <Hairline className="my-8" />

            {/* 6 — Price, stock state, quantity, buy */}
            <div className="flex flex-wrap items-baseline gap-4">
              <p className="font-body text-3xl font-bold">R{Number(s.price_zar).toFixed(0)}</p>
              <span className="meta-xs text-[color:var(--text-tertiary)]">
                {s.weight_grams ?? 0.75}g
              </span>
              <span className="meta-xs text-[color:var(--text-secondary)]">
                {soldOut ? "Out of stock" : "In stock"}
              </span>
              {s.is_limited && !soldOut && <span className="meta-xs text-gold">Limited release</span>}
            </div>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{DELIVERY_COPY}</p>

            {soldOut ? (
              <GoldButton onClick={() => setNotifyOpen(true)} className="mt-6 w-full">
                Notify me when back
              </GoldButton>
            ) : (
              <>
                <div className="mt-6">
                  <QuantityStepper value={qty} onChange={setQty} />
                </div>
                <GoldButton onClick={handleAdd} className="mt-4 w-full">
                  Add to Cart
                </GoldButton>
              </>
            )}

            <NotifyMeModal
              open={notifyOpen}
              onOpenChange={setNotifyOpen}
              strainId={s.id}
              strainName={s.name}
            />
            <FindClosestStockistModal
              open={stockistOpen}
              onOpenChange={setStockistOpen}
              strainId={s.id}
              strainName={s.name}
            />
          </div>
        </div>

        {/* 7 — About this product */}
        {s.description && (
          <section className="mt-20 max-w-3xl">
            <MetaLabel gold>✦ About this product</MetaLabel>
            <p className="mt-4 font-body text-base leading-[1.9] text-[color:var(--text-secondary)]">
              {s.description}
            </p>
          </section>
        )}

        {/* 8 — Flavour words, effect classification, terpene names */}
        {(s.effect_category || (s.flavor_tags?.length ?? 0) > 0 || terpeneNames.length > 0) && (
          <section className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {(s.flavor_tags?.length ?? 0) > 0 && (
              <div>
                <MetaLabel>Flavour</MetaLabel>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.flavor_tags!.map((f, i) => (
                    <FlavorChip key={f} dominant={i === 0}>
                      {f}
                    </FlavorChip>
                  ))}
                </div>
              </div>
            )}
            {s.effect_category && (
              <div>
                <MetaLabel>Classification</MetaLabel>
                <div className="mt-3">
                  <EffectChip>{s.effect_category}</EffectChip>
                </div>
                <p className="mt-3 text-xs leading-[1.7] text-[color:var(--text-tertiary)]">
                  A flavour grouping, not a promise of any physical effect.
                </p>
              </div>
            )}
            {terpeneNames.length > 0 && (
              <div>
                <MetaLabel>Terpenes</MetaLabel>
                <div className="mt-3 flex flex-wrap gap-2">
                  {terpeneNames.map((t) => (
                    <span
                      key={t}
                      className="inline-block rounded-full border border-[color:var(--border-strong)] px-3 py-1 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <Link to="/strains" className="ghost-link mt-3 inline-block text-xs">
                  Understanding terpenes
                </Link>
              </div>
            )}
          </section>
        )}

        {/* 9 — Caviar infusion components */}
        {isCaviar && (s.infusion_components?.length ?? 0) > 0 && (
          <section className="mt-12">
            <MetaLabel>Infusion components</MetaLabel>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.infusion_components!.map((c) => (
                <span
                  key={c}
                  className="inline-block rounded-full border border-[color:var(--accent-gold)] px-3 py-1 text-xs uppercase tracking-[0.12em] text-[color:var(--accent-gold)]"
                >
                  {c}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 10 — Customer reviews */}
        <ReviewsSection strainId={s.id} strainName={s.name} />

        {/* 11 — Stockist finder and collection links */}
        <Hairline className="my-12" />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
          <button
            type="button"
            onClick={() => setStockistOpen(true)}
            className="inline-flex items-center gap-2 rounded-[4px] border border-[color:var(--border-strong)] px-6 py-3 font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] transition-colors hover:border-[color:var(--accent-sage,#7d9b76)] hover:text-[color:var(--accent-sage,#7d9b76)]"
          >
            <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Find this product near you
          </button>
          <Link to={meta.path} className="ghost-link">
            All {meta.plural}
          </Link>
          <Link to="/strains" className="ghost-link">
            Strain Library
          </Link>
          <Link to="/shop" className="ghost-link">
            Our Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
