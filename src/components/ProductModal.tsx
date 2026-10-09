import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { FadeImage } from "@/components/FadeImage";
import { useProducts, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { formatPrice, useI18n } from "@/lib/i18n";

export function ProductModal({
  product,
  onClose,
  onSelect,
}: {
  product: Product | null;
  onClose: () => void;
  // Opens another gift in the same popup (the "you may also like" row).
  onSelect?: (p: Product) => void;
}) {
  const { t, tl, lang, dir } = useI18n();
  const { add, setDrawerOpen } = useCart();
  const navigate = useNavigate();
  const { live } = useProducts();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(0);
    setZoom(false);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [product?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (zoom) setZoom(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, zoom]);

  // Gifts sharing the most categories, then the closest in price; in-stock first.
  const similar = useMemo(() => {
    if (!product) return [];
    const shared = (p: Product) => p.categories.filter((c) => product.categories.includes(c)).length;
    return live
      .filter((p) => p.id !== product.id)
      .map((p) => ({ p, score: shared(p), gap: Math.abs(p.price - product.price) }))
      .sort(
        (a, b) =>
          Number(b.p.inStock) - Number(a.p.inStock) || b.score - a.score || a.gap - b.gap,
      )
      .slice(0, 4)
      .map((x) => x.p);
  }, [live, product]);

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
    <div ref={scroller} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto overscroll-contain p-4" dir={dir}>
      <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm" onClick={onClose} />
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
            <button
              type="button"
              onClick={() => setZoom(true)}
              aria-label={t("zoomImage")}
              className="group relative block w-full cursor-zoom-in"
            >
              <FadeImage
                src={product.images[active]}
                alt={tl(product.name)}
                width={1024}
                height={1024}
                className="aspect-square w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-white/10"
              />
              <span className="absolute bottom-3 end-3 grid size-9 place-items-center rounded-full bg-navy-2/70 text-ivory opacity-0 backdrop-blur transition group-hover:opacity-100">
                <ZoomIn className="size-4" />
              </span>
            </button>
            {count > 1 && (
              <>
                <button
                  aria-label="previous"
                  onClick={() => step(-1)}
                  className={`${arrowCls} start-3`}
                >
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
            <span className="text-3xl font-bold text-gold-2">
              {formatPrice(product.price, lang)}
            </span>
            <span className="text-xs text-ivory/50">{tl(product.subtitle)}</span>
          </div>

          {!product.inStock ? (
            <p className="mt-6 inline-block rounded-full border border-white/15 px-5 py-2 text-sm text-ivory/70">
              {t("outOfStock")}
            </p>
          ) : (
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => {
                  add(product);
                  onClose();
                  setDrawerOpen(true);
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
          )}
        </div>

        {similar.length > 0 && (
          <section className="border-t border-white/10 pt-6 lg:col-span-2">
            <h3 className="font-heb text-xl text-ivory">{t("youMayLike")}</h3>
            <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {similar.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(p)}
                    disabled={!onSelect}
                    className="group block w-full text-start"
                  >
                    <FadeImage
                      src={p.images[0]}
                      alt=""
                      loading="lazy"
                      width={512}
                      height={512}
                      className="aspect-square w-full rounded-xl object-cover outline-1 -outline-offset-1 outline-white/10 transition group-hover:outline-gold/60"
                    />
                    <span className="mt-2 block truncate text-sm text-ivory group-hover:text-gold-2">
                      {tl(p.name)}
                    </span>
                    <span className="block text-xs text-gold-2">{formatPrice(p.price, lang)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {zoom && (
        <div
          role="dialog"
          aria-label={tl(product.name)}
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-[55] grid cursor-zoom-out place-items-center bg-black/90 p-4 animate-page-in"
        >
          <img
            src={product.images[active]}
            alt={tl(product.name)}
            className="max-h-full max-w-full rounded-xl object-contain"
          />
          <button
            type="button"
            aria-label={t("close")}
            className="absolute top-4 end-4 grid size-10 place-items-center rounded-full border border-white/20 bg-navy-2/70 text-ivory"
          >
            ✕
          </button>
          {count > 1 && (
            <>
              <button
                aria-label="previous"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className={`${arrowCls} start-4`}
              >
                <PrevIcon className="size-5" />
              </button>
              <button
                aria-label="next"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className={`${arrowCls} end-4`}
              >
                <NextIcon className="size-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
