import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  CatalogFilters,
  parseCatalogSearch,
  useFilteredProducts,
  type CatalogSearch,
} from "@/components/CatalogFilters";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { ProductModal } from "@/components/ProductModal";
import { Ornament } from "@/components/Reveal";
import { useI18n } from "@/lib/i18n";
import { useProducts, type Product } from "@/lib/products";

export const Route = createFileRoute("/gifts")({
  // Filters live in the address so a search can be shared or bookmarked.
  validateSearch: (s: Record<string, unknown>): CatalogSearch => parseCatalogSearch(s),
  head: () => ({
    meta: [
      { title: "כל המארזים · מתנות" },
      { name: "description", content: "כל המארזים באתר, עם חיפוש וסינון לפי אירוע, מחיר ועוד." },
    ],
  }),
  component: GiftsPage,
});

function GiftsPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/gifts" });
  const { live, isLoading, isError } = useProducts();
  const [preview, setPreview] = useState<Product | null>(null);

  const set = (patch: Partial<CatalogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });
  const clear = () => navigate({ search: {}, replace: true, resetScroll: false });
  const results = useFilteredProducts(live, search);

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -end-40 size-[520px] rounded-full bg-gold/20 blur-[140px] animate-glow" />
      <section className="relative mx-auto max-w-7xl px-6 pt-14 pb-20">
        <h1 className="font-heb text-4xl font-bold text-navy">{t("allGifts")}</h1>
        <Ornament className="mt-3" />

        <div className="mt-8">
          <CatalogFilters
            search={search}
            set={set}
            clear={clear}
            products={live}
            count={results.length}
            showCount={!isLoading && !isError}
            searchLabel={t("searchLabel")}
          />
        </div>

        {isError ? (
          <p className="mt-8 text-sm text-red-600">{t("loadError")}</p>
        ) : isLoading ? (
          <ProductGridSkeleton className="mt-6" />
        ) : results.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-gold/30 bg-white/80 p-10 text-center">
            <p className="font-heb text-2xl text-navy">{t("noResults")}</p>
            <button
              type="button"
              onClick={clear}
              className="mt-6 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-2"
            >
              {t("showAllGifts")}
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p, i) => (
              <ProductCard key={p.id} product={p} onPreview={setPreview} index={i} />
            ))}
          </div>
        )}
      </section>

      <ProductModal product={preview} onClose={() => setPreview(null)} onSelect={setPreview} />
    </main>
  );
}
