import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getStrainBySlug } from "@/lib/strains.functions";
import { getStrainImage, getStrainProductImage } from "@/lib/strain-assets";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { EffectChip, FlavorChip } from "@/components/brand/Chips";
import { QuantityStepper } from "@/components/brand/QuantityStepper";
import { NotifyMeModal } from "@/components/brand/NotifyMeModal";
import { FindClosestStockistModal } from "@/components/brand/FindClosestStockistModal";
import { ProductGallery } from "@/components/brand/ProductGallery";
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
    const localImg = getStrainProductImage(s.slug) || getStrainImage(s.slug);
    const image = localImg || DEFAULT_OG_IMAGE;
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

  return (
    <div className="px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1200px]">
        <Link to={meta.path} className="ghost-link">
          ← {meta.plural}
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* 1 — Photography */}
          <ProductGallery images={gallery} name={s.name} lineName={meta.name} />

          <div>
            {/* 2 — Name */}
            <MetaLabel gold>{meta.name}</MetaLabel>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] md:text-6xl">{s.name}</h1>

            {/* 3 — Concise summary */}
            {s.description && (
              <p className="mt-5 font-body text-base leading-[1.8] text-[color:var(--text-secondary)]">
                {s.description}
              </p>
            )}

            {/* 4 — Effects and flavours, compact */}
            {(s.effect_category || (s.flavor_tags?.length ?? 0) > 0) && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {s.effect_category && <EffectChip>{s.effect_category}</EffectChip>}
                {s.flavor_tags?.map((f, i) => (
                  <FlavorChip key={f} dominant={i === 0}>
                    {f}
                  </FlavorChip>
                ))}
              </div>
            )}

            {/* 7 — Caviar infusion components */}
            {isCaviar && (s.infusion_components?.length ?? 0) > 0 && (
              <div className="mt-6">
                <p className="meta-xs text-[color:var(--text-tertiary)]">Infusion components</p>
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
              </div>
            )}

            <Hairline className="my-8" />

            {/* 5 — Price, quantity, buy */}
            <div className="flex flex-wrap items-baseline gap-4">
              <p className="font-body text-3xl font-bold">R{Number(s.price_zar).toFixed(0)}</p>
              <span className="meta-xs text-[color:var(--text-tertiary)]">
                {s.weight_grams ?? 0.75}g
              </span>
              {s.is_limited && !soldOut && <span className="meta-xs text-gold">Limited release</span>}
            </div>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{DELIVERY_COPY}</p>

            {soldOut ? (
              <>
                <p className="meta-xs mt-6 text-[color:var(--text-secondary)]">
                  Currently out of stock
                </p>
                <GoldButton onClick={() => setNotifyOpen(true)} className="mt-4 w-full">
                  Notify me when back
                </GoldButton>
              </>
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

            {/* 6 — Find this product near you */}
            <button
              type="button"
              onClick={() => setStockistOpen(true)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[4px] border border-[color:var(--border-strong)] bg-transparent px-8 py-4 font-body text-[0.8125rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--text-primary)] transition-all duration-300 hover:border-[color:var(--accent-sage,#7d9b76)] hover:text-[color:var(--accent-sage,#7d9b76)]"
            >
              <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Find this product near you
            </button>

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

            {/* 8 — Return to collection / library */}
            <Hairline className="my-8" />
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
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
      </div>
    </div>
  );
}
