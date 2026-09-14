import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PUBLIC_SITE_URL } from "@/lib/seo";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);

        const staticEntries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
          { path: "/shop", changefreq: "weekly", priority: "0.9", lastmod: today },
          { path: "/strains", changefreq: "weekly", priority: "0.8", lastmod: today },
          { path: "/stockists", changefreq: "weekly", priority: "0.8", lastmod: today },
          { path: "/about", changefreq: "monthly", priority: "0.6", lastmod: today },
          { path: "/wholesale", changefreq: "monthly", priority: "0.6", lastmod: today },
          { path: "/legal/terms", changefreq: "yearly", priority: "0.3", lastmod: today },
          { path: "/legal/privacy", changefreq: "yearly", priority: "0.3", lastmod: today },
          { path: "/legal/refunds", changefreq: "yearly", priority: "0.3", lastmod: today },
          { path: "/legal/shipping", changefreq: "yearly", priority: "0.3", lastmod: today },
          { path: "/legal/cannabis-disclaimer", changefreq: "yearly", priority: "0.3", lastmod: today },
        ];

        let strainEntries: SitemapEntry[] = [];
        try {
          const { data } = await supabaseAdmin
            .from("strains")
            .select("slug, updated_at")
            .eq("is_active", true);
          strainEntries = (data ?? []).map((s) => ({
            path: `/strain/${s.slug}`,
            changefreq: "weekly",
            priority: "0.9",
            lastmod: s.updated_at ? new Date(s.updated_at).toISOString().slice(0, 10) : today,
          }));
        } catch (e) {
          console.error("sitemap: failed to load strains", e);
        }

        const entries = [...staticEntries, ...strainEntries];
        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${PUBLIC_SITE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});