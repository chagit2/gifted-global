import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronUp,
  Gift,
  Minus,
  Package,
  PenLine,
  Plus,
  Puzzle,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FitImage } from "@/components/FadeImage";
import { ProductModal } from "@/components/ProductModal";
import {
  CatalogFilters,
  parseCatalogSearch,
  useFilteredProducts,
  type CatalogSearch,
} from "@/components/CatalogFilters";
import { ChoiceView } from "@/components/ChoiceView";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { Ornament } from "@/components/Reveal";
import { BOX_DRAFT, boxCount, boxItemKey, boxPrice, type BoxItem } from "@/lib/box";
import { lineKey, useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { choiceLabels, useProducts, validChoice, type Product } from "@/lib/products";
import { useSettings } from "@/lib/settings";

type BuildSearch = CatalogSearch & {
  // Key of a designed box in the cart that is being changed.
  edit?: string | undefined;
};

export const Route = createFileRoute("/build")({
  // Search and filters live in the address, as on "all gift boxes".
  validateSearch: (s: Record<string, unknown>): BuildSearch => ({
    ...parseCatalogSearch(s),
    edit: typeof s["edit"] === "string" && s["edit"] ? s["edit"].slice(0, 2000) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "מארז בעיצוב אישי · מתנות" },
      {
        name: "description",
        content: "בוחרים פריטים וכמה מכל אחד, ואנחנו אורזים הכול יחד במארז אחד עם מכתב אישי.",
      },
    ],
  }),
  component: BuildPage,
});

// The box being designed survives a reload or a visit to another page.
const DRAFT = BOX_DRAFT;

function BuildPage() {
  const { t, tl } = useI18n();
  const { money } = useCurrency();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/build" });
  const { items: catalog, getProduct, isLoading, isError } = useProducts();
  const { boxMinItems: min } = useSettings();
  const { lines, addBox, setDrawerOpen } = useCart();
  const [box, setBox] = useState<BoxItem[]>([]);
  const [trayOpen, setTrayOpen] = useState(false);
  // An item opened in the popup (all its photos and details).
  const [preview, setPreview] = useState<Product | null>(null);
  const loadedFor = useRef<string | null>(null);

  // Start from the box being edited, else from the saved draft.
  const editing = search.edit
    ? lines.find((l) => l.items && lineKey(l) === search.edit)
    : undefined;
  useEffect(() => {
    const id = search.edit ?? "";
    if (loadedFor.current === id) return;
    if (search.edit && !editing && lines.length === 0) return; // cart not read yet
    loadedFor.current = id;
    if (editing?.items) return setBox(editing.items);
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT) ?? "[]");
      if (Array.isArray(saved)) setBox(saved);
    } catch {
      /* ignore */
    }
  }, [search.edit, editing, lines.length]);
  useEffect(() => {
    if (loadedFor.current === null || editing) return;
    try {
      localStorage.setItem(DRAFT, JSON.stringify(box));
    } catch {
      /* storage blocked: the draft lives for this page only */
    }
  }, [box, editing]);

  // Only items still on the site count (one may have been hidden meanwhile).
  const kept = useMemo(
    () =>
      box.filter((i) => {
        const p = getProduct(i.productId);
        return p && p.kind === "item" && p.inStock && validChoice(p, i.choice);
      }),
    [box, getProduct],
  );
  const count = boxCount(kept);
  const total = boxPrice(kept, getProduct);
  const missing = Math.max(0, min - count);

  const qtyOf = (productId: string, choice: number[]) =>
    box.find((i) => boxItemKey(i) === boxItemKey({ productId, choice }))?.qty ?? 0;
  const setQty = (productId: string, choice: number[], qty: number) =>
    setBox((prev) => {
      const key = boxItemKey({ productId, choice });
      const rest = prev.filter((i) => boxItemKey(i) !== key);
      if (qty <= 0) return rest;
      const at = prev.findIndex((i) => boxItemKey(i) === key);
      const item = { productId, choice, qty: Math.min(qty, 99) };
      return at === -1 ? [...prev, item] : [...rest.slice(0, at), item, ...rest.slice(at)];
    });

  const done = () => {
    if (missing > 0 || kept.length === 0) return;
    addBox(kept, editing ? search.edit : undefined);
    setBox([]);
    try {
      localStorage.removeItem(DRAFT);
    } catch {
      /* ignore */
    }
    if (editing) {
      navigate({ to: "/cart" });
      return;
    }
    navigate({ search: {} });
    setDrawerOpen(true);
  };

  const shown = useFilteredProducts(catalog, search);
  // Clearing the filters keeps the box being edited.
  const setFilters = (patch: Partial<CatalogSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });
  const clearFilters = () =>
    navigate({ search: { edit: search.edit }, replace: true, resetScroll: false });

  const tray = (
    <BoxTray
      box={kept}
      min={min}
      count={count}
      missing={missing}
      total={total}
      editing={!!editing}
      onQty={setQty}
      onClear={() => setBox([])}
      onDone={done}
    />
  );

  return (
    <main className="relative overflow-hidden pb-40 lg:pb-20">
      <div className="pointer-events-none absolute -top-40 -end-40 size-[520px] rounded-full bg-gold/20 blur-[140px] animate-glow" />
      <section className="relative mx-auto max-w-7xl px-6 pt-14">
        <h1 className="font-heb text-4xl font-bold text-navy">{t("buildTitle")}</h1>
        <Ornament className="mt-3" />
        <p className="mt-4 max-w-2xl text-navy/80">{t("buildIntro")}</p>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {(
            [
              [Puzzle, "buildStep1"],
              [Plus, "buildStep2"],
              [PenLine, "buildStep3"],
            ] as const
          ).map(([Icon, key], i) => (
            <li
              key={key}
              className="flex items-center gap-3 rounded-2xl border border-navy/10 bg-white/75 p-3 backdrop-blur-xl"
            >
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-navy text-gold-2">
                <Icon className="size-5" />
                <span className="absolute -top-1 -end-1 grid size-5 place-items-center rounded-full bg-gold text-[11px] font-bold text-navy">
                  {i + 1}
                </span>
              </span>
              <span className="text-sm font-semibold text-navy">{t(key)}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-gold-deep">
          {t("buildMinNote").replace("{n}", String(min))}
        </p>

        {editing && (
          <p className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold-deep">
            {t("boxEdit")}
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            {catalog.length > 0 && (
              <div className="mb-6">
                <CatalogFilters
                  search={search}
                  set={setFilters}
                  clear={clearFilters}
                  products={catalog}
                  count={shown.length}
                  showCount={!isLoading && !isError}
                  searchLabel={t("searchItemsLabel")}
                  items
                />
              </div>
            )}

            {isError ? (
              <p className="text-sm text-red-600">{t("loadError")}</p>
            ) : isLoading ? (
              <ProductGridSkeleton />
            ) : catalog.length === 0 ? (
              <div className="rounded-2xl border border-gold/30 bg-white/80 p-10 text-center">
                <p className="font-heb text-xl text-navy">{t("buildEmpty")}</p>
                <Link
                  to="/gifts"
                  className="mt-6 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-2"
                >
                  {t("entryReadyCta")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {shown.length === 0 && (
                  <p className="col-span-full rounded-2xl border border-gold/30 bg-white/80 p-8 text-center text-navy">
                    {t("noItemsMatch")}
                  </p>
                )}
                {shown.map((p) => (
                  <ItemCard
                    key={p.id}
                    product={p}
                    qtyOf={qtyOf}
                    onQty={setQty}
                    onPreview={setPreview}
                  />
                ))}
              </div>
            )}

            <Link
              to="/gifts"
              className="mt-8 inline-flex items-center gap-2 text-sm text-gold-deep underline-offset-4 hover:underline"
            >
              <Gift className="size-4" />
              {t("crossToReady")}
            </Link>
          </div>

          {/* Desktop: the box stays beside the items. */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">{tray}</div>
          </aside>
        </div>
      </section>

      {/* Phones: a bar at the bottom that opens into the full box. */}
      <div className="fixed inset-x-0 bottom-0 z-[60] lg:hidden print:hidden" data-quiet>
        {trayOpen && (
          <div className="max-h-[60vh] overflow-y-auto border-t border-gold/40 bg-white px-4 pt-4 pb-2 shadow-2xl">
            {tray}
          </div>
        )}
        <div className="flex items-center gap-3 border-t-2 border-gold/60 bg-navy py-3 pr-20 pl-4 text-pearl">
          <button
            type="button"
            onClick={() => setTrayOpen((o) => !o)}
            aria-expanded={trayOpen}
            className="flex min-h-11 flex-1 items-center gap-2 text-start"
          >
            <span className="relative">
              <Package className="size-6 text-gold-2" />
              <span className="absolute -top-2 -end-2 grid size-5 place-items-center rounded-full bg-gold text-[11px] font-bold text-navy">
                {count}
              </span>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                {t("myBox")} · {money(total)}
              </span>
              <span className="block truncate text-xs text-pearl/75">
                {missing === 0 && count > 0
                  ? t("boxReady")
                  : missing === 1
                    ? t("boxNeedOne")
                    : t("boxNeedMore").replace("{n}", String(missing))}
              </span>
            </span>
            <ChevronUp className={`ms-auto size-5 transition ${trayOpen ? "rotate-180" : ""}`} />
            <span className="sr-only">{trayOpen ? t("boxHide") : t("boxShow")}</span>
          </button>
          <button
            type="button"
            onClick={done}
            disabled={missing > 0 || count === 0}
            className="min-h-11 shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-navy transition hover:bg-gold-2 disabled:bg-pearl/20 disabled:text-pearl/60"
          >
            <ShoppingBag className="inline size-4" />{" "}
            {editing ? t("boxUpdateShort") : t("boxAddShort")}
          </button>
        </div>
      </div>
      <ProductModal
        product={preview}
        onClose={() => setPreview(null)}
        onSelect={setPreview}
        onAddToBox={(choice) => preview && setQty(preview.id, choice, qtyOf(preview.id, choice) + 1)}
      />
    </main>
  );
}

// One item: photo, name, price, its options (if any) and a − n + stepper for
// how many of it (with the chosen options) go in the box.
function ItemCard({
  product: p,
  qtyOf,
  onQty,
  onPreview,
}: {
  product: Product;
  qtyOf: (productId: string, choice: number[]) => number;
  onQty: (productId: string, choice: number[], qty: number) => void;
  onPreview: (p: Product) => void;
}) {
  const { t, tl } = useI18n();
  const { money } = useCurrency();
  // Options with a single value are chosen already.
  const [choice, setChoice] = useState<(number | null)[]>(() =>
    p.options.map((o) => (o.values.length === 1 ? 0 : null)),
  );
  const picked = choice.every((v) => v !== null) ? (choice as number[]) : null;
  const qty = picked ? qtyOf(p.id, picked) : 0;

  return (
    <article className="flex flex-col rounded-2xl border border-navy/10 bg-white/75 p-3 backdrop-blur-xl transition hover:border-gold/50">
      <button
        type="button"
        onClick={() => onPreview(p)}
        aria-label={`${t("itemDetails")}: ${tl(p.name)}`}
        className="relative block w-full cursor-zoom-in rounded-xl"
      >
        <FitImage
          src={p.images[0]}
          alt={tl(p.name)}
          loading="lazy"
          width={600}
          height={600}
          className="aspect-square w-full rounded-xl outline-1 -outline-offset-1 outline-navy/10"
        />
        {qty > 0 && (
          <span className="absolute top-2 end-2 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-navy shadow">
            <Check className="size-3" strokeWidth={3} />
            {t("inBox").replace("{n}", String(qty))}
          </span>
        )}
        {p.images.length > 1 && (
          <span className="absolute bottom-2 start-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] text-navy shadow">
            {t("photosCount").replace("{n}", String(p.images.length))}
          </span>
        )}
      </button>
      <h3 className="mt-3 font-heb text-base leading-snug text-navy">{tl(p.name)}</h3>
      {tl(p.subtitle) && <p className="mt-0.5 text-xs text-navy/70">{tl(p.subtitle)}</p>}
      <p className="mt-1 text-sm font-semibold text-gold-deep">{money(p.price)}</p>

      {p.options.map((o, i) =>
        o.values.length > 1 ? (
          <div key={i} className="mt-2">
            <p className="text-[11px] text-navy/70">{tl(o.name)}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {o.values.map((v, j) => (
                <button
                  key={j}
                  type="button"
                  aria-pressed={choice[i] === j}
                  onClick={() => setChoice((c) => c.map((x, k) => (k === i ? j : x)))}
                  title={tl(v)}
                  className={`flex min-h-9 items-center gap-1 rounded-full border px-2.5 text-xs transition ${
                    choice[i] === j
                      ? "border-gold bg-gold/20 text-navy"
                      : "border-navy/15 text-navy/75 hover:border-gold/60"
                  }`}
                >
                  {v.image && (
                    <img src={v.image} alt="" className="size-6 rounded-full object-cover" />
                  )}
                  {tl(v) || (v.image ? "" : "—")}
                </button>
              ))}
            </div>
          </div>
        ) : null,
      )}

      <div className="mt-auto pt-3">
        {!p.inStock ? (
          <p className="text-center text-xs text-navy/70">{t("outOfStock")}</p>
        ) : !picked ? (
          <p className="text-center text-xs text-gold-deep">
            {t("pickOptionFirst")}{" "}
            {p.options
              .filter((_, i) => choice[i] === null)
              .map((o) => tl(o.name))
              .join(", ")}
          </p>
        ) : qty === 0 ? (
          <button
            type="button"
            onClick={() => onQty(p.id, picked, 1)}
            className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-navy text-sm font-semibold text-pearl transition hover:bg-navy-3 active:scale-95"
          >
            <Plus className="size-4" />
            {t("addToBox")}
          </button>
        ) : (
          <Stepper
            qty={qty}
            name={tl(p.name)}
            onChange={(n) => onQty(p.id, picked, n)}
            className="w-full justify-between"
          />
        )}
      </div>
    </article>
  );
}

function Stepper({
  qty,
  name,
  onChange,
  className = "",
}: {
  qty: number;
  name: string;
  onChange: (qty: number) => void;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={`flex items-center rounded-full border border-gold/60 bg-gold/10 ${className}`}>
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        aria-label={`${t("qtyDown")}: ${name}`}
        className="grid size-11 place-items-center rounded-full text-navy transition hover:bg-gold/20 active:scale-90"
      >
        <Minus className="size-4" />
      </button>
      <span
        className="min-w-6 text-center text-sm font-semibold tabular-nums text-navy"
        aria-live="polite"
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= 99}
        aria-label={`${t("qtyUp")}: ${name}`}
        className="grid size-11 place-items-center rounded-full text-navy transition hover:bg-gold/20 active:scale-90 disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

// "My box": what is in it so far, how many more are needed, the total and
// the add-to-cart button (lit only once the box holds enough items).
function BoxTray({
  box,
  min,
  count,
  missing,
  total,
  editing,
  onQty,
  onClear,
  onDone,
}: {
  box: BoxItem[];
  min: number;
  count: number;
  missing: number;
  total: number;
  editing: boolean;
  onQty: (productId: string, choice: number[], qty: number) => void;
  onClear: () => void;
  onDone: () => void;
}) {
  const { t, tl } = useI18n();
  const { money } = useCurrency();
  const { getProduct } = useProducts();
  const ready = missing === 0 && count > 0;

  return (
    <div className="rounded-2xl border border-gold/40 bg-white/90 p-5 shadow-lg shadow-navy/5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 font-heb text-xl text-navy">
          <Package className="size-5 text-gold-deep" />
          {t("myBox")}
        </h2>
        <span className="text-xs text-navy/70">
          {count === 1 ? t("boxCountOne") : t("boxCount").replace("{n}", String(count))}
        </span>
      </div>

      {/* Progress towards the minimum. */}
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-navy/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={min}
        aria-valuenow={Math.min(count, min)}
        aria-label={t("myBox")}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${ready ? "bg-emerald-500" : "bg-gold"}`}
          style={{ width: `${Math.min(100, (count / Math.max(1, min)) * 100)}%` }}
        />
      </div>
      <p
        className={`mt-2 text-sm ${ready ? "font-semibold text-emerald-700" : "text-gold-deep"}`}
        aria-live="polite"
      >
        {ready
          ? t("boxReady")
          : missing === 1
            ? t("boxNeedOne")
            : t("boxNeedMore").replace("{n}", String(missing))}
      </p>

      {box.length === 0 ? (
        <p className="mt-4 text-sm text-navy/70">{t("boxEmptyHint")}</p>
      ) : (
        <ul className="mt-4 space-y-3 border-t border-navy/10 pt-4">
          {box.map((i) => {
            const p = getProduct(i.productId)!;
            return (
              <li key={boxItemKey(i)} className="flex items-center gap-3">
                <img
                  src={p.images[0]}
                  alt=""
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-navy">{tl(p.name)}</p>
                  <ChoiceView
                    choice={choiceLabels(p, i.choice)}
                    className="text-[11px] text-navy/65"
                  />
                  <p className="text-xs text-gold-deep">{money(p.price * i.qty)}</p>
                </div>
                <Stepper
                  qty={i.qty}
                  name={tl(p.name)}
                  onChange={(n) => onQty(i.productId, i.choice, n)}
                />
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-navy/10 pt-4 font-heb text-lg text-navy">
        <span>{t("total")}</span>
        <span className="text-gold-deep">{money(total)}</span>
      </div>
      <button
        type="button"
        onClick={onDone}
        disabled={!ready}
        className="mt-4 w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-navy shadow-md shadow-gold/25 transition hover:bg-gold-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-navy/10 disabled:text-navy/50 disabled:shadow-none"
      >
        {editing ? t("boxUpdate") : t("boxAdd")}
      </button>
      {box.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 w-full py-2 text-xs text-navy/65 underline-offset-4 hover:text-red-600 hover:underline"
        >
          {t("boxClear")}
        </button>
      )}
    </div>
  );
}
