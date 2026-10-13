import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useCart } from "@/lib/cart";
import { LetterField } from "@/components/Letter";
import { useProducts } from "@/lib/products";
import { useCurrency } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "סל הקניות · מתנות" },
      { name: "description", content: "הסל שלכם: מתנות, מכתבים אישיים וסכום לתשלום." },
      { property: "og:title", content: "סל הקניות · מתנות" },
      { property: "og:description", content: "הסל שלכם: מתנות, מכתבים אישיים וסכום לתשלום." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { t, tl, lang } = useI18n();
  const { money } = useCurrency();
  const { lines, total, remove, setQty, setLetter } = useCart();
  const { getProduct } = useProducts();
  const { shippingFee: fee } = useSettings();
  // Shipping is charged only when there is at least one gift.
  const shippingFee = lines.length > 0 ? fee : 0;

  return (
    <main className="relative mx-auto max-w-5xl px-6 pt-14 pb-24">
      <h1 className="font-heb text-4xl font-bold text-navy">{t("cart")}</h1>

      {lines.length === 0 ? (
        <p className="mt-10 text-navy/65">{t("emptyCart")}</p>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {lines.map((line) => {
              const p = getProduct(line.productId);
              if (!p) return null;
              return (
                <div
                  key={line.productId}
                  className="rounded-2xl border border-navy/10 bg-white/70 p-4 backdrop-blur-xl"
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
                          <h2 className="font-heb text-lg text-navy">{tl(p.name)}</h2>
                          <p className="mt-1 text-xs text-navy/60">{tl(p.subtitle)}</p>
                          {!p.inStock && <p className="mt-1 text-xs text-red-600">{t("outOfStock")}</p>}
                        </div>
                        <span className="font-semibold text-gold-deep">
                          {money(p.price * line.qty)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-xs text-navy/75">
                        <span>{t("qty")}</span>
                        <div className="flex items-center rounded-full border border-navy/10">
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
                          className="text-navy/60 hover:text-gold-deep"
                        >
                          {t("remove")}
                        </button>
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
                          onChange={(v) => setLetter(line.productId, i, v)}
                          categories={p.categories}
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
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-navy/10 bg-white/70 p-6 backdrop-blur-xl">
            <div>
              <p className="text-xs text-navy/60">
                {t("subtotal")}: {money(total)} · {t("shipping")}: {money(shippingFee)}
              </p>
              <p className="mt-1 font-heb text-xl text-navy">
                {t("total")}: <span className="text-gold-deep">{money(total + shippingFee)}</span>
              </p>
            </div>
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
