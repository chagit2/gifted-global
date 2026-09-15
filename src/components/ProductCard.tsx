import { useNavigate } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog";
import { getCategory } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatPrice, useI18n } from "@/lib/i18n";

export function ProductCard({
  product,
  onPreview,
}: {
  product: Product;
  onPreview: (p: Product) => void;
}) {
  const { tl, t, lang } = useI18n();
  const { add } = useCart();
  const navigate = useNavigate();
  const cat = getCategory(product.category);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-gold/40">
      <button className="relative block w-full" onClick={() => onPreview(product)}>
        <img
          src={product.images[0]}
          alt={tl(product.name)}
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-square w-full rounded-xl object-cover outline-1 -outline-offset-1 outline-white/10"
        />
        <span className="absolute top-2 start-2 rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-bold text-navy">
          {cat ? tl(cat.label) : ""}
        </span>
      </button>
      <h3 className="mt-4 font-heb text-lg text-ivory">{tl(product.name)}</h3>
      <p className="mt-1 text-xs text-ivory/50">{tl(product.subtitle)}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="font-semibold text-gold-2">{formatPrice(product.price, lang)}</span>
        <div className="flex gap-2">
          <button
            onClick={() => add(product)}
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
      </div>
    </article>
  );
}
