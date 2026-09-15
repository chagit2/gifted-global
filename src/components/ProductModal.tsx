import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatPrice, useI18n } from "@/lib/i18n";

export function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { t, tl, lang, dir } = useI18n();
  const { add } = useCart();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [letter, setLetter] = useState("");

  useEffect(() => {
    setActive(0);
    setLetter("");
  }, [product?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4" dir={dir}>
      <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative my-8 grid w-full max-w-5xl grid-cols-1 gap-10 rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute top-4 end-4 grid size-9 place-items-center rounded-full border border-white/15 bg-navy-2/70 text-ivory hover:border-gold/50"
          aria-label="close"
        >
          ✕
        </button>

        <div>
          <img
            src={product.images[active]}
            alt={tl(product.name)}
            width={1024}
            height={1024}
            className="aspect-square w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-white/10"
          />
          <div className="mt-3 grid grid-cols-3 gap-3">
            {product.images.slice(1).map((img, i) => (
              <button key={img} onClick={() => setActive(i + 1)}>
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  width={512}
                  height={512}
                  className={`aspect-square w-full rounded-xl object-cover outline-1 -outline-offset-1 ${
                    active === i + 1 ? "outline-gold" : "outline-white/10"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] text-gold-2">
            <span className="size-1 rounded-full bg-gold-2" />
            {t("inStock")}
          </span>
          <h2 className="mt-4 font-heb text-4xl font-bold text-ivory">{tl(product.name)}</h2>
          <p className="mt-4 text-sm leading-relaxed text-ivory/70">{tl(product.description)}</p>

          <div className="mt-5 flex items-end gap-4">
            <span className="text-3xl font-bold text-gold-2">{formatPrice(product.price, lang)}</span>
            <span className="text-xs text-ivory/50">{tl(product.subtitle)}</span>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-navy-2/50 p-4">
            <p className="text-xs font-semibold text-gold-2">{t("letterTitle")}</p>
            <p className="mt-0.5 text-[11px] text-ivory/50">{t("letterNote")}</p>
            <textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value.slice(0, 500))}
              rows={2}
              maxLength={500}
              placeholder={t("letterPlaceholder")}
              className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-transparent p-3 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => {
                add(product, letter);
                onClose();
              }}
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy hover:bg-gold-2 transition"
            >
              + {t("addToCart")}
            </button>
            <button
              onClick={() => {
                add(product, letter);
                onClose();
                navigate({ to: "/checkout" });
              }}
              className="rounded-full border border-white/20 px-6 py-3 text-sm text-ivory transition hover:border-gold/60 hover:text-gold-2"
            >
              {t("buyNow")}
            </button>
          </div>
          <p className="mt-4 text-[11px] text-ivory/50">{t("reviews")}</p>
        </div>
      </div>
    </div>
  );
}
