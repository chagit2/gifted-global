import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { getProduct } from "@/lib/catalog";
import { formatPrice, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "סל הקניות · מתנות" },
      { name: "description", content: "הסל שלכם: מתנות, מכתבים אישיים וסכום לתשלום." },
      { property: "og:title", content: "סל הקניות · מתנות" },
      { property: "og:description", content: "הסל שלכם: מתנות, מכתבים אישיים וסכום לתשלום." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { t, tl, lang } = useI18n();
  const { lines, total, remove, setQty, setLetter } = useCart();

  return (
    <main className="relative mx-auto max-w-5xl px-6 pt-14 pb-24">
      <h1 className="font-heb text-4xl font-bold text-ivory">{t("cart")}</h1>

      {lines.length === 0 ? (
        <p className="mt-10 text-ivory/60">{t("emptyCart")}</p>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {lines.map((line) => {
              const p = getProduct(line.productId);
              if (!p) return null;
              return (
                <div
                  key={line.productId}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <div className="flex gap-4">
                    <img
                      src={p.images[0]}
                      alt={tl(p.name)}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="size-24 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-heb text-lg text-ivory">{tl(p.name)}</h2>
                          <p className="mt-1 text-xs text-ivory/50">{tl(p.subtitle)}</p>
                        </div>
                        <span className="font-semibold text-gold-2">
                          {formatPrice(p.price * line.qty, lang)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-xs text-ivory/70">
                        <span>{t("qty")}</span>
                        <div className="flex items-center rounded-full border border-white/10">
                          <button className="px-3 py-1" onClick={() => setQty(line.productId, line.qty - 1)}>
                            −
                          </button>
                          <span className="px-2">{line.qty}</span>
                          <button className="px-3 py-1" onClick={() => setQty(line.productId, line.qty + 1)}>
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => remove(line.productId)}
                          className="text-ivory/50 hover:text-gold-2"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-white/10 bg-navy-2/50 p-3">
                    <p className="text-xs font-semibold text-gold-2">{t("letterTitle")}</p>
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={line.letter}
                      onChange={(e) => setLetter(line.productId, e.target.value.slice(0, 500))}
                      placeholder={t("letterPlaceholder")}
                      className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-transparent p-3 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <span className="font-heb text-xl text-ivory">
              {t("total")}: <span className="text-gold-2">{formatPrice(total, lang)}</span>
            </span>
            <Link
              to="/checkout"
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-2"
            >
              {t("checkout")}
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
