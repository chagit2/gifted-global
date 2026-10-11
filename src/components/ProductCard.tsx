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
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-gold/40">
      <button className="relative block w-full" onClick={() => onPreview(product)}>
        <FadeImage
          src={product.images[0]}
          alt={tl(product.name)}
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-square w-full rounded-xl object-cover outline-1 -outline-offset-1 outline-white/10"
        />
        {cat && (
          <span className="absolute top-2 start-2 rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-bold text-navy">
            {tl(cat.label)}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-2 end-2 rounded-full bg-navy/90 px-2.5 py-1 text-[10px] font-bold text-ivory">
            {t("outOfStock")}
          </span>
        )}
      </button>
      <h3 className="mt-4 font-heb text-lg text-ivory">{tl(product.name)}</h3>
      <p className="mt-1 text-xs text-ivory/50">{tl(product.subtitle)}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="font-semibold text-gold-2">{money(product.price)}</span>
        {product.inStock ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                add(product);
                setDrawerOpen(true);
              }}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-ivory hover:bg-white/20 transition"
            >
              {t("addToCart")}
            </button>
            <button
              onClick={() => {
                add(product);
                navigate({ to: "/checkout" });
              }}
              className="rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-navy hover:bg-gold-2 transition"
            >
              {t("buyNow")}
            </button>
          </div>
        ) : (
          <span className="text-xs text-ivory/50">{t("outOfStock")}</span>
        )}
      </div>
    </article>
  );
}
