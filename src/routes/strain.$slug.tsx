import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getStrainBySlug } from "@/lib/strains.functions";
import { getStrainProductImage } from "@/lib/strain-assets";
import { GoldButton } from "@/components/brand/GoldButton";
import { Hairline } from "@/components/brand/Hairline";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { EffectChip, FlavorChip } from "@/components/brand/Chips";
import { QuantityStepper } from "@/components/brand/QuantityStepper";
import { NotifyMeModal } from "@/components/brand/NotifyMeModal";
import { FindClosestStockistModal } from "@/components/brand/FindClosestStockistModal";
import { MapPin } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useState } from "react";
import type { Strain } from "@/lib/types";
import { PUBLIC_SITE_URL, seoMeta, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/brand";

import { productLineDescription } from "@/lib/collections";

function productDescription(strain: Pick<Strain, "product_line">) {
  return productLineDescription(strain.product_line);
}

export const Route = createFileRoute("/strain/$slug")({
  loader: async ({ context, params }) => {
    const strain = await context.queryClient.ensureQueryData({
      queryKey: ["strain", params.slug],
      queryFn: () => getStrainBySlug({ data: { slug: params.slug } }),
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
          description: "Explore the Terps strain library — flavour-first infused pre-rolls bred in South Africa.",
          path: `/strain/${params.slug}`,
        }),
      };
    }
    const description = productDescription(s);
    const localImg = getStrainProductImage(s.slug);
    const image = localImg || DEFAULT_OG_IMAGE;
    const title = `${s.name} · Terps`;
    return {
      meta: seoMeta({
        title,
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
            description,
            image: image.startsWith("http") ? image : `${PUBLIC_SITE_URL}${image}`,
            sku: s.slug,
            brand: { "@type": "Brand", name: "Terps" },
            category: s.product_line === "caviar_stix" ? "Caviar Stix" : "Infused Pre-Roll",
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
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [stockistOpen, setStockistOpen] = useState(false);
  const addItem = useCart((st) => st.addItem);
  if (!s) return null;
  const img = getStrainProductImage(s.slug);
  const soldOut = s.stock_quantity <= 0;
  const isCaviar = s.product_line === "caviar_stix";
  const description = productDescription(s);
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
    <section className="px-6 pb-20 pt-8 md:px-12 md:pb-28 md:pt-12">
      <div className="mx-auto max-w-[1120px]">
        <Link to="/shop" className="ghost-link">← The collection</Link>

        <div className="mt-8 overflow-hidden rounded-[8px] bg-[color:var(--bg-elevated)]">
          {img ? (
            <img
              src={img}
              alt={`${s.name} product`}
              className="mx-auto aspect-[4/5] max-h-[780px] w-full object-contain p-4 sm:p-8"
            />
          ) : (
            <div className="aspect-[4/5]" aria-hidden="true" />
          )}
        </div>

        <div className="mx-auto max-w-[760px] py-12 md:py-16">
          <h1 className="font-display text-[2.75rem] leading-[1.02] sm:text-6xl">{s.name}</h1>
          <p className="mt-5 font-body text-3xl font-semibold">R{Number(s.price_zar).toFixed(0)}</p>
          <p className="mt-6 text-base leading-[1.75] text-[color:var(--text-secondary)] sm:text-lg">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {s.effects?.map((effect) => <EffectChip key={effect}>{effect}</EffectChip>)}
            {s.flavor_tags?.map((flavour, index) => (
              <FlavorChip key={flavour} dominant={index === 0}>{flavour}</FlavorChip>
            ))}
          </div>

          <p className="mt-6 text-sm text-[color:var(--text-secondary)]">
            Free delivery on orders of R{FREE_DELIVERY_THRESHOLD} or more
          </p>
            {s.is_limited && !soldOut && (
              <p className="meta-xs mt-4 text-gold">Limited release</p>
            )}
            {soldOut && (
              <p className="meta-xs mt-4 text-[color:var(--text-secondary)]">Currently out of stock</p>
            )}
            <Hairline className="my-8" />
            {!soldOut && (
              <div className="mb-6"><QuantityStepper value={qty} onChange={setQty} /></div>
            )}
            {soldOut ? (
              <GoldButton onClick={() => setNotifyOpen(true)} className="w-full">
                Notify me when back
              </GoldButton>
            ) : (
              <GoldButton onClick={handleAdd} className="w-full">
                Add to Cart
              </GoldButton>
            )}
          <div className="mt-12 border-y border-[color:var(--border-subtle)] py-8">
            <MetaLabel gold>Where to find {s.name}</MetaLabel>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              Find a nearby retailer carrying this product, or browse every Terps stockist.
            </p>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <GoldButton onClick={() => setStockistOpen(true)}>
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
                Find closest stockist
              </GoldButton>
              <Link to="/stockists" className="ghost-link">View all stockists →</Link>
            </div>
          </div>

          {isCaviar && s.infusion_components && s.infusion_components.length > 0 && (
            <div className="pt-10">
              <MetaLabel gold>Infusion components</MetaLabel>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.infusion_components.map((component) => (
                  <FlavorChip key={component}>{component}</FlavorChip>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
    </section>
  );
}
