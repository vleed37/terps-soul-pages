import { createFileRoute } from "@tanstack/react-router";

/**
 * Public read-only delivery for product photography stored in the private
 * `product-images` bucket. Only paths inside that bucket are served, and only
 * image files — no listing, no writes, no credentials leave the server.
 */
export const Route = createFileRoute("/api/public/product-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = params._splat ?? "";
        // Reject traversal and anything that is not a plain nested object key.
        if (!/^[A-Za-z0-9/_-]+\.(jpg|jpeg|png|webp|avif)$/.test(raw) || raw.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("product-images")
          .download(raw);
        if (error || !data) return new Response("Not found", { status: 404 });

        const ext = raw.split(".").pop()!.toLowerCase();
        const type =
          ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "avif" ? "image/avif" : "image/jpeg";

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": type,
            "Cache-Control": "public, max-age=86400, immutable",
          },
        });
      },
    },
  },
});
