import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { getCategory, productsByCategory, type Product } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/c/$slug")({
  head: ({ params }) => {
    const cat = getCategory(params.slug);
    const title = cat ? `${cat.label.he} · מתנות` : "קטגוריה · מתנות";
    const description = "מתנות יוקרה ארוזות בעבודת יד, עם מכתב אישי ומשלוח עד הבית.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { tl, t } = useI18n();
  const [preview, setPreview] = useState<Product | null>(null);
  const cat = getCategory(slug);
  const items = productsByCategory(slug);

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -start-40 size-[520px] rounded-full bg-gold/20 blur-[140px] animate-glow" />
      <section className="relative mx-auto max-w-7xl px-6 pt-14 pb-20">
        <p className="text-xs text-ivory/50">{t("giftsIn")}</p>
        <h1 className="mt-2 font-heb text-4xl font-bold text-ivory">
          {cat ? tl(cat.label) : slug}
        </h1>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} onPreview={setPreview} />
          ))}
        </div>
      </section>
      <ProductModal product={preview} onClose={() => setPreview(null)} />
    </main>
  );
}
