import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Minus, Plus } from "lucide-react";
import { EmptyCart } from "@/components/EmptyCart";
import { Ornament } from "@/components/Reveal";
import { useCart, useLineViews } from "@/lib/cart";
import { boxCount } from "@/lib/box";
import { LetterField } from "@/components/Letter";
import { ChoiceView } from "@/components/ChoiceView";
import { BoxContents, LineThumb } from "@/components/BoxParts";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "סל הקניות · מתנות" },
      { name: "description", content: "הסל שלכם: מארזים, מכתבים אישיים וסכום לתשלום." },
      { property: "og:title", content: "סל הקניות · מתנות" },
      { property: "og:description", content: "הסל שלכם: מארזים, מכתבים אישיים וסכום לתשלום." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { t, tl } = useI18n();
  const { money } = useCurrency();
  const { lines, total, remove, setQty, setLetter } = useCart();
  const views = useLineViews();
  const { shippingFee: fee, boxMinItems } = useSettings();
  // Shipping is charged only when there is at least one gift.
  const shippingFee = lines.length > 0 ? fee : 0;

  return (
    <main className="relative mx-auto max-w-5xl px-6 pt-14 pb-24">
      <h1 className="font-heb text-4xl font-bold text-navy">{t("cart")}</h1>
      <Ornament className="mt-3" />

      {lines.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-navy/10 bg-white/70 backdrop-blur-xl">
          <EmptyCart />
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {views.map((view) => {
              const { line, key } = view;
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-navy/10 bg-white/70 p-4 backdrop-blur-xl transition hover:border-gold/40 hover:shadow-lg hover:shadow-navy/5"
                >
                  <div className="flex gap-4">
                    <LineThumb view={view} className="size-24 rounded-xl" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-heb text-lg text-navy">{tl(view.name)}</h2>
                          {view.subtitle && <p className="mt-1 text-xs text-navy/70">{tl(view.subtitle)}</p>}
                          <ChoiceView choice={view.choice} className="mt-1 text-xs font-semibold text-navy" />
                          <BoxContents view={view} className="mt-1 text-xs text-navy/75" />
                          {!view.inStock && <p className="mt-1 text-xs text-red-600">{t("outOfStock")}</p>}
                          {line.items && boxCount(line.items) < boxMinItems && (
                            <p className="mt-1 text-xs text-red-600">
                              {t("buildMinNote").replace("{n}", String(boxMinItems))}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-gold-deep">
                          {money(view.unitPrice * line.qty)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-xs text-navy/75">
                        <span>{t("qty")}</span>
                        <div className="flex items-center rounded-full border border-navy/15 bg-white/60">
                          <button
                            aria-label={t("qtyDown")}
                            className="grid size-10 place-items-center rounded-full transition hover:bg-navy/5 hover:text-gold-deep active:scale-90"
                            onClick={() => setQty(key, line.qty - 1)}
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm text-navy">{line.qty}</span>
                          <button
                            aria-label={t("qtyUp")}
                            className="grid size-10 place-items-center rounded-full transition hover:bg-navy/5 hover:text-gold-deep active:scale-90"
                            onClick={() => setQty(key, line.qty + 1)}
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(key)}
                          className="min-h-10 px-1 text-navy/70 underline-offset-4 hover:text-gold-deep hover:underline"
                        >
                          {t("remove")}
                        </button>
                        {view.contents && (
                          <Link
                            to="/build"
                            search={{ edit: key }}
                            className="min-h-10 px-1 py-3 text-gold-deep underline-offset-4 hover:underline"
                          >
                            {t("boxEdit")}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {line.letters.map((letter, i) => (
                      <div key={i} className="rounded-xl border border-navy/10 bg-white/50 p-3">
                        <p className="text-xs font-semibold text-gold-deep">
                          {line.qty > 1 ? t("letterN").replace("{n}", String(i + 1)) : t("letterTitle")}
                        </p>
                        <LetterField
                          value={letter}
                          onChange={(v) => setLetter(key, i, v)}
                          categories={view.categories}
                          className="mt-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-8 inline-flex items-center gap-2 text-xs text-gold-deep">
            <MapPin className="size-3.5" />
            {t("shipsIsraelOnly")}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-white/80 p-5 shadow-lg shadow-navy/5 backdrop-blur-xl sm:p-6">
            <div>
              <p className="text-xs text-navy/70">
                {t("subtotal")}: {money(total)} · {t("shipping")}: {money(shippingFee)}
              </p>
              <p className="mt-1 font-heb text-xl text-navy">
                {t("total")}: <span className="text-gold-deep">{money(total + shippingFee)}</span>
              </p>
            </div>
            <Link
              to="/checkout"
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy shadow-md shadow-gold/25 transition hover:bg-gold-2 active:scale-[0.97]"
            >
              {t("toCheckout")}
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
