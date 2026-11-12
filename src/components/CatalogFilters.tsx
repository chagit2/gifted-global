import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { categories, type Category } from "@/lib/catalog";
import { budgetOptions } from "@/lib/finder";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/products";

// Search and filters shared by "all gift boxes" and the custom box page; the
// choices live in the address so a search can be shared or bookmarked.

export const SORTS = ["recommended", "priceUp", "priceDown", "name"] as const;
export type Sort = (typeof SORTS)[number];

export type CatalogSearch = {
  q?: string | undefined;
  cat?: string | undefined;
  // A subcategory of `cat` (e.g. menorahs under Hanukkah).
  sub?: string | undefined;
  price?: string | undefined;
  stock?: boolean | undefined;
  sort?: Sort | undefined;
};

export const parseCatalogSearch = (s: Record<string, unknown>): CatalogSearch => {
  const { q, cat, sub, price, stock, sort } = s;
  const top =
    typeof cat === "string" && categories.some((c) => c.slug === cat && !c.parent)
      ? cat
      : undefined;
  // Links from the menu may name a subcategory as `cat`: file it under its parent.
  const asSub =
    typeof cat === "string" ? categories.find((c) => c.slug === cat && c.parent) : undefined;
  const subOk = (v: unknown) =>
    typeof v === "string" &&
    categories.some((c) => c.slug === v && c.parent === (top ?? asSub?.parent));
  return {
    q: typeof q === "string" && q ? q.slice(0, 80) : undefined,
    cat: top ?? asSub?.parent,
    sub: asSub ? asSub.slug : subOk(sub) ? (sub as string) : undefined,
    price:
      typeof price === "string" && budgetOptions.some((b) => b.id === price && b.id !== "any")
        ? price
        : undefined,
    stock: stock === true || stock === "true" ? true : undefined,
    sort: SORTS.includes(sort as Sort) && sort !== "recommended" ? (sort as Sort) : undefined,
  };
};

// Lower-case, no Hebrew vowel marks or quote signs, so "ט״ו" finds "טו".
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[֑-ׇ̀-ͯ"'״׳`]/g, "")
    .trim();

export function useFilteredProducts(list: Product[], search: CatalogSearch) {
  const { tl } = useI18n();
  return useMemo(() => {
    const words = norm(search.q ?? "")
      .split(/\s+/)
      .filter(Boolean);
    const budget = budgetOptions.find((b) => b.id === search.price);
    const sort = search.sort ?? "recommended";
    const out = list.filter((p) => {
      if (search.cat && !p.categories.includes(search.cat)) return false;
      if (search.sub && !p.categories.includes(search.sub)) return false;
      if (budget && (p.price < budget.min || p.price > budget.max)) return false;
      if (search.stock && !p.inStock) return false;
      if (!words.length) return true;
      // Search every language, and the categories' names too.
      const hay = norm(
        [
          ...Object.values(p.name),
          ...Object.values(p.subtitle),
          ...Object.values(p.description),
          ...p.categories.flatMap((c) =>
            Object.values(categories.find((x) => x.slug === c)?.label ?? {}),
          ),
        ].join(" "),
      );
      return words.every((w) => hay.includes(w));
    });
    if (sort === "priceUp") out.sort((a, b) => a.price - b.price);
    if (sort === "priceDown") out.sort((a, b) => b.price - a.price);
    if (sort === "name") out.sort((a, b) => tl(a.name).localeCompare(tl(b.name)));
    return out;
  }, [list, search.q, search.cat, search.sub, search.price, search.stock, search.sort, tl]);
}

// Categories offered in the filter: those some product in the list belongs to
// (or every category, for an empty list).
const usedCategories = (list: Product[]): Category[] =>
  list.length
    ? categories.filter((c) => list.some((p) => p.categories.includes(c.slug)))
    : categories;

const field =
  "w-full rounded-full border border-navy/15 bg-white/90 px-4 py-2.5 text-sm text-navy focus:border-gold focus:outline-none";

export function CatalogFilters({
  search,
  set,
  clear,
  products,
  count,
  showCount,
  searchLabel,
  items,
}: {
  search: CatalogSearch;
  set: (patch: Partial<CatalogSearch>) => void;
  clear: () => void;
  // The list being filtered, for the categories worth offering.
  products: Product[];
  count: number;
  showCount: boolean;
  searchLabel: string;
  // Counting single items ("5 items") rather than gift boxes.
  items?: boolean;
}) {
  const { t, tl } = useI18n();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const active = [search.q, search.cat, search.price, search.stock].filter(Boolean).length;
  const used = useMemo(() => usedCategories(products), [products]);
  // Main categories only; a chosen one's subcategories get a field of their own.
  const tops = used.filter((c) => !c.parent);
  const subs = search.cat ? used.filter((c) => c.parent === search.cat) : [];

  return (
    <>
      <div className="rounded-2xl border border-navy/10 bg-white/80 p-4 shadow-sm backdrop-blur-xl sm:p-5">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">{searchLabel}</span>
            <Search className="pointer-events-none absolute top-1/2 start-4 size-4 -translate-y-1/2 text-navy/50" />
            <input
              type="search"
              value={search.q ?? ""}
              onChange={(e) => set({ q: e.target.value || undefined })}
              placeholder={t("searchPlaceholder")}
              className={`${field} ps-10`}
            />
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            aria-controls="catalog-filters"
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
          id="catalog-filters"
          className={`mt-3 grid gap-3 sm:grid ${subs.length ? "sm:grid-cols-5" : "sm:grid-cols-4"} ${filtersOpen ? "grid" : "hidden"}`}
        >
          <label className="block">
            <span className="mb-1 block text-xs text-navy/70">{t("filterOccasion")}</span>
            <select
              value={search.cat ?? ""}
              onChange={(e) => set({ cat: e.target.value || undefined, sub: undefined })}
              className={field}
            >
              <option value="">{t("allCategories")}</option>
              {tops.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {tl(c.label)}
                </option>
              ))}
            </select>
          </label>
          {subs.length > 0 && (
            <label className="block">
              <span className="mb-1 block text-xs text-navy/70">{t("filterSubcategory")}</span>
              <select
                value={search.sub ?? ""}
                onChange={(e) => set({ sub: e.target.value || undefined })}
                className={field}
              >
                <option value="">{t("allSubcategories")}</option>
                {subs.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {tl(c.label)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-xs text-navy/70">{t("filterPrice")}</span>
            <select
              value={search.price ?? "any"}
              onChange={(e) =>
                set({ price: e.target.value === "any" ? undefined : e.target.value })
              }
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
              value={search.sort ?? "recommended"}
              onChange={(e) =>
                set({
                  sort: e.target.value === "recommended" ? undefined : (e.target.value as Sort),
                })
              }
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
        {showCount && (
          <p className="text-sm text-navy/70">
            {count === 1
              ? t(items ? "boxCountOne" : "resultsOne")
              : t(items ? "boxCount" : "resultsCount").replace("{n}", String(count))}
          </p>
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
    </>
  );
}
