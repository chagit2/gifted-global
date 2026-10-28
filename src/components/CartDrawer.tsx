import { Link, useRouterState } from "@tanstack/react-router";
import { Minus, PenLine, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmptyCart } from "@/components/EmptyCart";
import { lineKey, useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { choiceLabels, choiceText, useProducts } from "@/lib/products";

// Slide-in cart opened by "add to cart": the shopper sees what is in the bag
// and can keep browsing without leaving the page.
export function CartDrawer() {
  const { t, tl, lang } = useI18n();
  const { money } = useCurrency();
  const { lines, total, setQty, remove, drawerOpen: open, setDrawerOpen } = useCart();
  const { getProduct } = useProducts();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const close = () => setDrawerOpen(false);

  // Remember which gift was just added, so its row can glow for a moment.
  const prevQty = useRef<Map<string, number> | null>(null);
  const [justAdded, setJustAdded] = useState<{ id: string; n: number } | null>(null);
  useEffect(() => {
    const next = new Map(lines.map((l) => [lineKey(l), l.qty]));
    const prev = prevQty.current;
    prevQty.current = next;
    if (!prev) return; // first read of the saved cart
    const grown = lines.find((l) => l.qty > (prev.get(lineKey(l)) ?? 0));
    if (grown) setJustAdded((j) => ({ id: lineKey(grown), n: (j?.n ?? 0) + 1 }));
  }, [lines]);

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
        className={`absolute inset-y-0 end-0 flex w-full max-w-sm flex-col border-s border-navy/10 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b-2 border-gold/60 bg-navy px-5 py-4">
          <h2 className="inline-flex items-center gap-2 font-heb text-xl text-pearl">
            <ShoppingBag className="size-5 text-gold-2" />
            {t("cart")}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="grid size-10 place-items-center rounded-full text-pearl/75 transition hover:rotate-90 hover:bg-white/10 hover:text-pearl motion-reduce:hover:rotate-0"
          >
            <X className="size-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyCart compact onNavigate={close} />
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {lines.map((line) => {
                const p = getProduct(line.productId);
                if (!p) return null;
                const key = lineKey(line);
                const choice = choiceText(choiceLabels(p, line.choice), tl);
                return (
                  <li key={key} className="relative -mx-2 flex gap-3 rounded-xl p-2">
                    {justAdded?.id === key && (
                      <span
                        key={justAdded.n}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-xl animate-flash"
                      />
                    )}
                    <img
                      src={p.images[0]}
                      alt=""
                      className="size-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-navy">{tl(p.name)}</p>
                      {choice && <p className="truncate text-xs text-navy/70">{choice}</p>}
                      <p className="text-xs text-gold-deep">{money(p.price * line.qty)}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-navy/15">
                          <button
                            type="button"
                            onClick={() => setQty(key, line.qty - 1)}
                            aria-label={t("qtyDown")}
                            className="grid size-9 place-items-center rounded-full text-navy/75 transition hover:bg-navy/5 hover:text-gold-deep active:scale-90"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs text-navy">{line.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(key, line.qty + 1)}
                            aria-label={t("qtyUp")}
                            className="grid size-9 place-items-center rounded-full text-navy/75 transition hover:bg-navy/5 hover:text-gold-deep active:scale-90"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(key)}
                          className="min-h-9 px-1 text-xs text-navy/70 underline-offset-4 hover:text-red-600 hover:underline"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="space-y-3 border-t border-navy/10 px-5 py-4">
              <p className="inline-flex items-center gap-1.5 text-xs text-navy/65">
                <PenLine className="size-3.5 text-gold-deep" />
                {t("drawerLetterHint")}
              </p>
              <div className="flex items-center justify-between font-heb text-lg text-navy">
                <span>{t("total")}</span>
                <span className="text-gold-deep">{money(total)}</span>
              </div>
              <Link
                to="/cart"
                className="block rounded-full bg-gold px-5 py-3 text-center text-sm font-semibold text-navy shadow-md shadow-gold/25 transition hover:bg-gold-2 active:scale-[0.98]"
              >
                {t("drawerToCart")}
              </Link>
              <button
                type="button"
                onClick={close}
                className="block w-full rounded-full border border-navy/15 px-5 py-2.5 text-sm text-navy transition hover:border-gold/50 hover:text-gold-deep"
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
