import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { useProducts, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { GiftBanner } from "@/components/GiftBanner";

export const Route = createFileRoute("/")({
  head: () => {
    const title = "מתנות · מתנות יוקרה עם מכתב אישי, משלוח עד הבית";
    const description =
      "בוחרים מתנה לחג, ליומולדת, לבר ובת מצווה או לתינוק, כותבים מכתב אישי, ואנחנו שולחים באריזת יוקרה עד הבית.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Index,
});

function Index() {
  const { t } = useI18n();
  const [preview, setPreview] = useState<Product | null>(null);
  const { live: gifts, isLoading, isError } = useProducts();

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-48 -end-40 size-[560px] rounded-full bg-gold/20 blur-[150px] animate-glow" />

      <GiftBanner />

      <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-20">
        <h2 className="font-heb text-3xl font-bold text-ivory">{t("allGifts")}</h2>
        {isError ? (
          <p className="mt-8 text-sm text-red-300">{t("loadError")}</p>
        ) : isLoading ? (
          <p className="mt-8 text-sm text-ivory/50">{t("loading")}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gifts.map((p) => (
              <ProductCard key={p.id} product={p} onPreview={setPreview} />
            ))}
          </div>
        )}
      </section>

      <ProductModal product={preview} onClose={() => setPreview(null)} />
    </main>
  );
}
