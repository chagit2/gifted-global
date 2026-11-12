import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Package, Plus, Puzzle } from "lucide-react";
import { useEffect, useState } from "react";
import { FitImage } from "@/components/FadeImage";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { getCategory } from "@/lib/catalog";
import { useProducts, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { Ornament } from "@/components/Reveal";
import { addToBoxDraft, boxCount, BOX_DRAFT_EVENT, readBoxDraft } from "@/lib/box";

export const Route = createFileRoute("/c/$slug")({
  head: ({ params }) => {
    const cat = getCategory(params.slug);
    const title = cat ? `${cat.label.he} · מתנות` : "קטגוריה · מתנות";
    const description = "מתנות יוקרה באריזה מהודרת, עם מכתב אישי ומשלוח עד הבית.";
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
  component: CategoryPage,
});

// How many items are in the box being designed (kept in this browser).
function useBoxDraftCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const read = () => setCount(boxCount(readBoxDraft()));
    read();
    window.addEventListener(BOX_DRAFT_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(BOX_DRAFT_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return count;
}

// Everything in a category: ready-made boxes, then the single items that go
// into a custom box (added to the box from here, finished on the box page).
function CategoryPage() {
  const { slug } = Route.useParams();
  const { tl, t } = useI18n();
  const [preview, setPreview] = useState<Product | null>(null);
  const cat = getCategory(slug);
  const { byCategory, items: allItems, isLoading, isError } = useProducts();
  const boxes = byCategory(slug);
  const items = allItems.filter((p) => p.categories.includes(slug));
  const inBox = useBoxDraftCount();
  const [added, setAdded] = useState<string | null>(null);

  const addItem = (p: Product, choice: number[]) => {
    addToBoxDraft(p.id, choice);
    setAdded(p.id);
  };

  return (
    <main className={`relative overflow-hidden ${inBox > 0 ? "pb-24" : ""}`}>
      <div className="pointer-events-none absolute -top-40 -start-40 size-[520px] rounded-full bg-gold/20 blur-[140px] animate-glow" />
      <section className="relative mx-auto max-w-7xl px-6 pt-14 pb-20">
        <p className="text-xs tracking-wide text-navy/70">{t("giftsIn")}</p>
        <h1 className="mt-2 font-heb text-4xl font-bold text-navy sm:text-5xl">
          {cat ? tl(cat.label) : slug}
        </h1>
        <Ornament className="mt-3" />
        {isError ? (
          <p className="mt-10 text-sm text-red-600">{t("loadError")}</p>
        ) : isLoading ? (
          <ProductGridSkeleton className="mt-10" />
        ) : boxes.length === 0 && items.length === 0 ? (
          <p className="mt-10 text-sm text-navy/70">{t("noProducts")}</p>
        ) : null}

        {boxes.length > 0 && (
          <>
            {items.length > 0 && (
              <h2 className="mt-10 font-heb text-2xl font-bold text-navy">
                {t("entryReadyTitle")}
              </h2>
            )}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {boxes.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onPreview={setPreview}
                  categorySlug={slug}
                  index={i}
                />
              ))}
            </div>
          </>
        )}

        {items.length > 0 && (
          <section className={boxes.length > 0 ? "mt-16" : "mt-10"}>
            <h2 className="inline-flex items-center gap-2 font-heb text-2xl font-bold text-navy">
              <Puzzle className="size-6 text-gold-deep" />
              {t("itemsForCustomBox")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-navy/75">{t("itemsForCustomBoxHint")}</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <ItemTile
                  key={p.id}
                  product={p}
                  added={added === p.id}
                  onOpen={() => setPreview(p)}
                  onAdd={() => (p.options.length ? setPreview(p) : addItem(p, []))}
                />
              ))}
            </div>
          </section>
        )}
      </section>

      {/* The box being designed: how many items so far, and the way to finish it. */}
      {inBox > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[60] print:hidden" data-quiet>
          <div className="flex items-center justify-between gap-3 border-t-2 border-gold/60 bg-navy py-3 pr-20 pl-4 text-pearl sm:pl-6">
            <span className="inline-flex items-center gap-2 text-sm">
              <Package className="size-5 text-gold-2" />
              {t("myBox")}:{" "}
              {inBox === 1 ? t("boxCountOne") : t("boxCount").replace("{n}", String(inBox))}
            </span>
            <Link
              to="/build"
              className="min-h-11 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold-2"
            >
              {t("continueBox")}
            </Link>
          </div>
        </div>
      )}

      <ProductModal
        product={preview}
        onClose={() => setPreview(null)}
        onSelect={setPreview}
        onAddToBox={(choice) => preview && addItem(preview, choice)}
      />
    </main>
  );
}

function ItemTile({
  product: p,
  added,
  onOpen,
  onAdd,
}: {
  product: Product;
  added: boolean;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const { t, tl } = useI18n();
  const { money } = useCurrency();
  return (
    <article className="flex flex-col rounded-2xl border border-navy/10 bg-white/75 p-3 backdrop-blur-xl transition hover:border-gold/50">
      <button
        type="button"
        onClick={onOpen}
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
        {p.images.length > 1 && (
          <span className="absolute bottom-2 start-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] text-navy shadow">
            {t("photosCount").replace("{n}", String(p.images.length))}
          </span>
        )}
      </button>
      <h3 className="mt-3 font-heb text-base leading-snug text-navy">{tl(p.name)}</h3>
      <p className="mt-1 text-sm font-semibold text-gold-deep">{money(p.price)}</p>
      <div className="mt-auto pt-3">
        {!p.inStock ? (
          <p className="text-center text-xs text-navy/70">{t("outOfStock")}</p>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition active:scale-95 ${
              added ? "bg-gold text-navy hover:bg-gold-2" : "bg-navy text-pearl hover:bg-navy-3"
            }`}
          >
            {added ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" />}
            {added ? t("addedToBox") : t("addToBox")}
          </button>
        )}
      </div>
    </article>
  );
}
