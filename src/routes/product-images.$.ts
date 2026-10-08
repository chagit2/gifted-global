import { createFileRoute } from "@tanstack/react-router";

// Product photos live in a private storage bucket; serve them through the site.
// Uploaded file names are random UUIDs, so each URL's content never changes.
export const Route = createFileRoute("/product-images/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!/^[\w-]+\.[a-z0-9]+$/i.test(path)) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("product-images").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(data, {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
