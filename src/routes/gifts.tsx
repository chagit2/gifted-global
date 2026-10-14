import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { ProductModal } from "@/components/ProductModal";
import { Ornament } from "@/components/Reveal";
import { categories } from "@/lib/catalog";
import { budgetOptions } from "@/lib/finder";
import { useI18n } from "@/lib/i18n";
import { useProducts, type Product } from "@/lib/products";

const SORTS = ["recommended", "priceUp", "priceDown", "name"] as const;
type Sort = (typeof SORTS)[number];

type GiftsSearch = {
  q?: string | undefined;
  cat?: string | undefined;
  price?: string | undefined;
  stock?: boolean | undefined;
  sort?: Sort | undefined;
};

export const Route = createFileRoute("/gifts")({
  // Filters live in the address so a search can be shared or bookmarked.
  validateSearch: (s: Record<string, unknown>): GiftsSearch => {
    const { q, cat, price, stock, sort } = s;
    return {
      q: typeof q === "string" && q ? q.slice(0, 80) : undefined,
      cat: typeof cat === "string" && categories.some((c) => c.slug === cat) ? cat : undefined,
      price:
        typeof price === "string" && budgetOptions.some((b) => b.id === price && b.id !== "any")
          ? price
          : undefined,
      stock: stock === true || stock === "true" ? true : undefined,
      sort: SORTS.includes(sort as Sort) && sort !== "recommended" ? (sort as Sort) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "כל המתנות · מתנות" },
      { name: "description", content: "כל המתנות באתר, עם חיפוש וסינון לפי אירוע, מחיר ועוד." },
    ],
  }),
  component: GiftsPage,
});

// Lower-case, no Hebrew vowel marks or quote signs, so "ט״ו" finds "טו".
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[֑-ׇ̀-ͯ"'״׳`]/g, "")
    .trim();

const field =
  "w-full rounded-full border border-navy/15 bg-white/90 px-4 py-2.5 text-sm text-navy focus:border-gold focus:outline-none";

function GiftsPage() {
  const { t, tl } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/gifts" });
  const { live, isLoading, isError } = useProducts();
  const [preview, setPreview] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const set = (patch: Partial<GiftsSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });

  const q = search.q ?? "";
  const sort: Sort = search.sort ?? "recommended";
  const budget = budgetOptions.find((b) => b.id === search.price);
  const active = [search.q, search.cat, search.price, search.stock].filter(Boolean).length;

  const results = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    const list = live.filter((p) => {
      if (search.cat && !p.categories.includes(search.cat)) return false;
      if (budget && (p.price < budget.min || p.price > budget.max)) return false;
      if (search.stock && !p.inStock) return false;
      if (!words.length) return true;
      // Search every language, and the categories' names too.
      const hay = norm(
        [
          ...Object.values(p.name),
          ...Object.values(p.subtitle),
          ...Object.values(p.description),
          ...p.categories.flatMap((c) => Object.values(categories.find((x) => x.slug === c)?.label ?? {})),
        ].join(" "),
      );
      return words.every((w) => hay.includes(w));
    });
    if (sort === "priceUp") list.sort((a, b) => a.price - b.price);
    if (sort === "priceDown") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => tl(a.name).localeCompare(tl(b.name)));
    return list;
  }, [live, q, search.cat, budget, search.stock, sort, tl]);

  const clear = () => navigate({ search: {}, replace: true, resetScroll: false });

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -end-40 size-[520px] rounded-full bg-gold/20 blur-[140px] animate-glow" />
      <section className="relative mx-auto max-w-7xl px-6 pt-14 pb-20">
        <h1 className="font-heb text-4xl font-bold text-navy">{t("allGifts")}</h1>
        <Ornament className="mt-3" />

        <div className="mt-8 rounded-2xl border border-navy/10 bg-white/80 p-4 shadow-sm backdrop-blur-xl sm:p-5">
          <div className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">{t("searchLabel")}</span>
              <Search className="pointer-events-none absolute top-1/2 start-4 size-4 -translate-y-1/2 text-navy/50" />
              <input
                type="search"
                value={q}
                onChange={(e) => set({ q: e.target.value || undefined })}
                placeholder={t("searchPlaceholder")}
                className={`${field} ps-10`}
              />
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              aria-controls="gift-filters"
              className="relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 text-sm text-navy transition hover:border-gold sm:hidden"
            >
              <SlidersHorizontal className="size-4" />
              {t("filters")}
              {active > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-navy">
                  {active}
                </span>
              )}
            </button>
          </div>

          <div
            id="gift-filters"
            className={`mt-3 grid gap-3 sm:grid sm:grid-cols-4 ${filtersOpen ? "grid" : "hidden"}`}
          >
            <label className="block">
              <span className="mb-1 block text-xs text-navy/70">{t("filterOccasion")}</span>
              <select
                value={search.cat ?? ""}
                onChange={(e) => set({ cat: e.target.value || undefined })}
                className={field}
              >
                <option value="">{t("allCategories")}</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {tl(c.label)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-navy/70">{t("filterPrice")}</span>
              <select
                value={search.price ?? "any"}
                onChange={(e) => set({ price: e.target.value === "any" ? undefined : e.target.value })}
                className={field}
              >
                {budgetOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id === "any" ? t("allPrices") : tl(b.label)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-navy/70">{t("sortBy")}</span>
              <select
                value={sort}
                onChange={(e) => set({ sort: e.target.value === "recommended" ? undefined : (e.target.value as Sort) })}
                className={field}
              >
                {SORTS.map((s) => (
                  <option key={s} value={s}>
                    {t(`sort_${s}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 self-end rounded-full border border-navy/15 bg-white/90 px-4 py-2.5 text-sm text-navy">
              <input
                type="checkbox"
                checked={!!search.stock}
                onChange={(e) => set({ stock: e.target.checked || undefined })}
                className="size-4 accent-[var(--gold-deep)]"
              />
              {t("inStockOnly")}
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
          {!isLoading && !isError && (
            <p className="text-sm text-navy/70">{results.length === 1 ? t("resultsOne") : t("resultsCount").replace("{n}", String(results.length))}</p>
          )}
          {active > 0 && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 text-sm text-gold-deep underline-offset-4 hover:underline"
            >
              <X className="size-4" />
              {t("clearFilters")}
            </button>
          )}
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
