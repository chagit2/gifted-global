import { useNavigate } from "@tanstack/react-router";
import { FadeImage } from "@/components/FadeImage";
import type { Product } from "@/lib/products";
import { getCategory } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { useReveal } from "@/hooks/use-reveal";

export function ProductCard({
  product,
  onPreview,
  categorySlug,
  index = 0,
}: {
  product: Product;
  onPreview: (p: Product) => void;
  // Category page the card is shown on; elsewhere the badge only appears for
  // gifts that belong to a single category.
  categorySlug?: string;
  // Position in the grid: cards in one row arrive one after another.
  index?: number;
}) {
  const { tl, t, lang } = useI18n();
  const { money } = useCurrency();
  const { add, setDrawerOpen } = useCart();
  const navigate = useNavigate();
  const cat = getCategory(
    categorySlug ?? (product.categories.length === 1 ? product.category : ""),
  );
  const ref = useReveal<HTMLDivElement>((index % 3) * 90);

  return (
    <div ref={ref} className="reveal h-full">
    <article className="group flex h-full flex-col rounded-2xl border border-navy/10 bg-white/70 p-4 backdrop-blur-xl transition duration-300 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/15 motion-safe:hover:-translate-y-1">
      <button className="relative block w-full rounded-xl" onClick={() => onPreview(product)}>
        <span className="block overflow-hidden rounded-xl outline-1 -outline-offset-1 outline-navy/10">
          <span className="block transition-transform duration-700 ease-out motion-safe:group-hover:scale-105">
            <FadeImage
              src={product.images[0]}
              alt={tl(product.name)}
              loading="lazy"
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </span>
        </span>
        {cat && (
          <span className="absolute top-2.5 start-2.5 rounded-full border border-gold-2/70 bg-gold/95 px-3 py-1 text-[11px] font-bold text-navy shadow-md shadow-navy/20">
            {tl(cat.label)}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-2.5 end-2.5 rounded-full bg-navy/90 px-3 py-1 text-[11px] font-bold text-pearl shadow-md shadow-navy/20">
            {t("outOfStock")}
          </span>
        )}
      </button>
      <h3 className="mt-4 font-heb text-lg leading-snug text-navy transition-colors group-hover:text-gold-deep">{tl(product.name)}</h3>
      <p className="mt-1 text-xs text-navy/70">{tl(product.subtitle)}</p>
      <p className="mt-auto pt-3 font-semibold text-gold-deep">{money(product.price)}</p>
      {product.inStock ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              add(product);
              setDrawerOpen(true);
            }}
            className="min-h-10 whitespace-nowrap rounded-full bg-navy px-2 py-2 text-xs text-pearl transition hover:bg-navy-3 active:scale-95"
          >
            {t("addToCart")}
          </button>
          <button
            onClick={() => {
              add(product);
              navigate({ to: "/checkout" });
            }}
            className="min-h-10 whitespace-nowrap rounded-full bg-gold px-2 py-2 text-xs font-semibold text-navy transition hover:bg-gold-2 hover:shadow-md hover:shadow-gold/30 active:scale-95"
          >
            {t("buyNow")}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-navy/70">{t("outOfStock")}</p>
      )}
    </article>
    </div>
  );
}
