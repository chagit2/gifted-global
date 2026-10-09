import { Link, useRouterState } from "@tanstack/react-router";
import { Minus, PenLine, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice, useI18n } from "@/lib/i18n";
import { useProducts } from "@/lib/products";

// Slide-in cart opened by "add to cart": the shopper sees what is in the bag
// and can keep browsing without leaving the page.
export function CartDrawer() {
  const { t, tl, lang } = useI18n();
  const { lines, total, setQty, remove, drawerOpen: open, setDrawerOpen } = useCart();
  const { getProduct } = useProducts();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const close = () => setDrawerOpen(false);

  // Navigating anywhere closes the panel.
  useEffect(() => {
    setDrawerOpen(false);
  }, [path, setDrawerOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const scrollbar = window.innerWidth - html.clientWidth;
    const prev = { overflow: html.style.overflow, paddingRight: html.style.paddingRight };
    html.style.overflow = "hidden";
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev.overflow;
      html.style.paddingRight = prev.paddingRight;
    };
  }, [open, setDrawerOpen]);

  return (
    <div className={`fixed inset-0 z-[70] print:hidden ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("cart")}
        className={`absolute inset-y-0 end-0 flex w-full max-w-sm flex-col border-s border-white/10 bg-navy-2 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="inline-flex items-center gap-2 font-heb text-xl text-ivory">
            <ShoppingBag className="size-5 text-gold-2" />
            {t("cart")}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="grid size-8 place-items-center rounded-full text-ivory/60 transition hover:bg-white/10 hover:text-ivory"
          >
            <X className="size-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <p className="p-6 text-sm text-ivory/60">{t("emptyCart")}</p>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {lines.map((line) => {
                const p = getProduct(line.productId);
                if (!p) return null;
                return (
                  <li key={line.productId} className="flex gap-3">
                    <img
                      src={p.images[0]}
                      alt=""
                      className="size-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ivory">{tl(p.name)}</p>
                      <p className="text-xs text-gold-2">{formatPrice(p.price * line.qty, lang)}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-white/15">
                          <button
                            type="button"
                            onClick={() => setQty(line.productId, line.qty - 1)}
                            aria-label="−"
                            className="grid size-7 place-items-center text-ivory/70 hover:text-gold-2"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs text-ivory">{line.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(line.productId, line.qty + 1)}
                            aria-label="+"
                            className="grid size-7 place-items-center text-ivory/70 hover:text-gold-2"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.productId)}
                          className="text-xs text-ivory/40 hover:text-red-300"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="space-y-3 border-t border-white/10 px-5 py-4">
              <p className="inline-flex items-center gap-1.5 text-xs text-ivory/60">
                <PenLine className="size-3.5 text-gold-2" />
                {t("drawerLetterHint")}
              </p>
              <div className="flex items-center justify-between font-heb text-lg text-ivory">
                <span>{t("total")}</span>
                <span className="text-gold-2">{formatPrice(total, lang)}</span>
              </div>
              <Link
                to="/cart"
                className="block rounded-full bg-gold px-5 py-3 text-center text-sm font-semibold text-navy transition hover:bg-gold-2"
              >
                {t("drawerToCart")}
              </Link>
              <button
                type="button"
                onClick={close}
                className="block w-full rounded-full border border-white/15 px-5 py-2.5 text-sm text-ivory transition hover:border-gold/50 hover:text-gold-2"
              >
                {t("drawerContinue")}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
