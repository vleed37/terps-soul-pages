export const PUBLIC_SITE_URL = "https://terps2.carbonmediasolutions.com";
export const DEFAULT_OG_IMAGE = `${PUBLIC_SITE_URL}/og/default.jpg`;

export interface SeoMetaInput {
  title: string;
  description: string;
  path: string; // e.g. "/shop"
  ogType?: "website" | "product" | "article";
  image?: string; // absolute or root-relative
}

/** Returns a meta[] array suitable for TanStack `head().meta`. */
export function seoMeta({
  title,
  description,
  path,
  ogType = "website",
  image,
}: SeoMetaInput) {
  const url = `${PUBLIC_SITE_URL}${path}`;
  const img = image
    ? image.startsWith("http")
      ? image
      : `${PUBLIC_SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`
    : DEFAULT_OG_IMAGE;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:url", content: url },
    { property: "og:image", content: img },
    { property: "og:site_name", content: "Terps" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
  ];
}

/** Absolute canonical URL for a public route path. */
export function canonicalUrl(path: string): string {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${PUBLIC_SITE_URL}${clean}`;
}

/**
 * Full head object for an indexable public page: social/meta tags plus a single
 * canonical link pointing at the configured production origin.
 */
export function seoHead(input: SeoMetaInput) {
  return {
    meta: seoMeta(input),
    links: [{ rel: "canonical", href: canonicalUrl(input.path) }],
  };
}

/**
 * Head object for private/transactional routes: titled, but never indexed and
 * never carrying a canonical or social/product preview.
 */
export function privateHead(title: string) {
  return {
    meta: [
      { title },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  };
}