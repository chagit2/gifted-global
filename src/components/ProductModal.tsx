import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  useEffect(() => {
    setActive(0);
  }, [product?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Freeze the page behind the popup while it is open.
  const isOpen = product !== null;
  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    const scrollbar = window.innerWidth - html.clientWidth;
    const prev = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
    html.style.overflow = "hidden";
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;
    return () => {
      html.style.overflow = prev.overflow;
      html.style.paddingRight = prev.paddingRight;
    };
  }, [isOpen]);

  if (!product) return null;

  const count = product.images.length;
  const step = (delta: number) => setActive((i) => (i + delta + count) % count);
  // In RTL the "next" arrow sits on the left and points left.
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;
  const arrowCls =
    "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-navy-2/70 text-ivory backdrop-blur transition hover:border-gold/50 hover:text-gold-2";

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
          <div className="relative">
            <img
              src={product.images[active]}
              alt={tl(product.name)}
              width={1024}
              height={1024}
              className="aspect-square w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-white/10"
            />
            {count > 1 && (
              <>
                <button aria-label="previous" onClick={() => step(-1)} className={`${arrowCls} start-3`}>
                  <PrevIcon className="size-5" />
                </button>
                <button aria-label="next" onClick={() => step(1)} className={`${arrowCls} end-3`}>
                  <NextIcon className="size-5" />
                </button>
              </>
            )}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {product.images.map((img, i) => (
              <button key={img} onClick={() => setActive(i)} aria-current={active === i}>
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  width={512}
                  height={512}
                  className={`aspect-square w-full rounded-xl object-cover outline-2 -outline-offset-2 transition ${
                    active === i ? "outline-gold" : "outline-white/10 opacity-60 hover:opacity-100"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:self-center">
          <h2 className="font-heb text-4xl font-bold text-ivory">{tl(product.name)}</h2>
          <p className="mt-4 text-sm leading-relaxed text-ivory/70">{tl(product.description)}</p>

          <div className="mt-5 flex items-end gap-4">
            <span className="text-3xl font-bold text-gold-2">{formatPrice(product.price, lang)}</span>
            <span className="text-xs text-ivory/50">{tl(product.subtitle)}</span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => {
                add(product);
                onClose();
              }}
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy hover:bg-gold-2 transition"
            >
              + {t("addToCart")}
            </button>
            <button
              onClick={() => {
                add(product);
                onClose();
                navigate({ to: "/checkout" });
              }}
              className="rounded-full border border-white/20 px-6 py-3 text-sm text-ivory transition hover:border-gold/60 hover:text-gold-2"
            >
              {t("buyNow")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
