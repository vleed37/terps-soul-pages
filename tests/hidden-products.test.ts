import { expect, test } from "bun:test";

const origin = "http://localhost:8080";

for (const slug of ["sour-diesel", "northern-lights"]) {
  test(`${slug} remains hidden from public product pages and sitemap`, async () => {
    const [product, sitemap] = await Promise.all([
      fetch(`${origin}/strain/${slug}`),
      fetch(`${origin}/sitemap.xml`),
    ]);
    expect(product.status).toBe(404);
    expect(sitemap.status).toBe(200);
    expect(await sitemap.text()).not.toContain(`/strain/${slug}`);
  });
}