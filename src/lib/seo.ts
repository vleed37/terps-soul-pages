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