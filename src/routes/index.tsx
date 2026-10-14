import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { useProducts, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { GiftBanner } from "@/components/GiftBanner";
import { HomeHero, PerksTicker } from "@/components/HomeHero";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { Ornament, Reveal } from "@/components/Reveal";

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

      <HomeHero />
      <GiftBanner />
      <PerksTicker />

      <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-20">
        <Reveal className="mb-14">
          <Link
            to="/find"
            className="group relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-gold/40 bg-navy p-6 shadow-xl shadow-navy/15 transition duration-300 hover:border-gold/80 hover:shadow-2xl hover:shadow-navy/25 sm:p-8"
          >
            {/* A soft gold light drifts across the band on hover. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -start-1/3 w-1/3 bg-gradient-to-r from-transparent via-gold-2/15 to-transparent opacity-0 transition-all duration-1000 group-hover:opacity-100 motion-safe:group-hover:start-full"
            />
            <div className="relative">
              <p className="font-heb text-2xl text-pearl sm:text-3xl">{t("finderCtaTitle")}</p>
              <p className="mt-1 text-sm text-gold-2/90">{t("finderCtaText")}</p>
            </div>
            <span className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-black/20 transition group-hover:bg-gold-2 group-active:scale-95">
              <Sparkles className="size-4 transition-transform duration-500 motion-safe:group-hover:rotate-12 motion-safe:group-hover:scale-110" />
              {t("finderTitle")}
            </span>
          </Link>
        </Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heb text-3xl font-bold text-navy sm:text-4xl">{t("allGifts")}</h2>
            <Ornament className="mt-3" />
          </div>
          <Link to="/gifts" className="text-sm font-semibold text-gold-deep underline-offset-4 hover:underline">
            {t("searchAndFilter")}
          </Link>
        </div>
        {isError ? (
          <p className="mt-8 text-sm text-red-600">{t("loadError")}</p>
        ) : isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gifts.map((p, i) => (
              <ProductCard key={p.id} product={p} onPreview={setPreview} index={i} />
            ))}
          </div>
        )}
      </section>

      <ProductModal product={preview} onClose={() => setPreview(null)} onSelect={setPreview} />
    </main>
  );
}
