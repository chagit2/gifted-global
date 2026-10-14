import { useNavigate } from "@tanstack/react-router";
import { FadeImage } from "@/components/FadeImage";
import type { Product } from "@/lib/products";
import { getCategory } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";

export function ProductCard({
  product,
  onPreview,
  categorySlug,
}: {
  product: Product;
  onPreview: (p: Product) => void;
  // Category page the card is shown on; elsewhere the badge only appears for
  // gifts that belong to a single category.
  categorySlug?: string;
}) {
  const { tl, t, lang } = useI18n();
  const { money } = useCurrency();
  const { add, setDrawerOpen } = useCart();
  const navigate = useNavigate();
  const cat = getCategory(
    categorySlug ?? (product.categories.length === 1 ? product.category : ""),
  );

  return (
    <article className="rounded-2xl border border-navy/10 bg-white/70 p-4 backdrop-blur-xl transition hover:border-gold/40">
      <button className="relative block w-full" onClick={() => onPreview(product)}>
        <FadeImage
          src={product.images[0]}
          alt={tl(product.name)}
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-square w-full rounded-xl object-cover outline-1 -outline-offset-1 outline-navy/10"
        />
        {cat && (
          <span className="absolute top-2 start-2 rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-bold text-navy">
            {tl(cat.label)}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-2 end-2 rounded-full bg-navy/90 px-2.5 py-1 text-[10px] font-bold text-pearl">
            {t("outOfStock")}
          </span>
        )}
      </button>
      <h3 className="mt-4 font-heb text-lg text-navy">{tl(product.name)}</h3>
      <p className="mt-1 text-xs text-navy/70">{tl(product.subtitle)}</p>
      <p className="mt-3 font-semibold text-gold-deep">{money(product.price)}</p>
      {product.inStock ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              add(product);
              setDrawerOpen(true);
            }}
            className="whitespace-nowrap rounded-full bg-navy px-2 py-2 text-xs text-pearl transition hover:bg-navy-3"
          >
            {t("addToCart")}
          </button>
          <button
            onClick={() => {
              add(product);
              navigate({ to: "/checkout" });
            }}
            className="whitespace-nowrap rounded-full bg-gold px-2 py-2 text-xs font-semibold text-navy transition hover:bg-gold-2"
          >
            {t("buyNow")}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-navy/70">{t("outOfStock")}</p>
      )}
    </article>
  );
}
