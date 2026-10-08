import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Lock, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useProducts } from "@/lib/products";
import { formatPrice, useI18n } from "@/lib/i18n";
import { placeOrder } from "@/lib/orders.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/checkout")({
  head: () => {
    const title = "תשלום · מתנות";
    const description = "פרטי השולח, כתובת המשלוח ומכתב אישי לכל מתנה — ואנחנו שולחים.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CheckoutPage,
});

const field =
  "mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none";
const label = "text-xs text-ivory/60";

const Req = () => (
  <span aria-hidden className="text-gold-2">
    *
  </span>
);

function CheckoutPage() {
  const { t, tl, lang } = useI18n();
  const { lines, total, setLetter, clear } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProduct } = useProducts();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await placeOrder({
        data: {
          senderName: String(fd.get("senderName") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          recipientName: String(fd.get("recipientName") ?? "").trim(),
          recipientPhone: String(fd.get("recipientPhone") ?? "").trim(),
          street: `${String(fd.get("street") ?? "").trim()} ${String(fd.get("houseNumber") ?? "").trim()}`,
          city: String(fd.get("city") ?? "").trim(),
          country: "Israel",
          language: lang,
          // One order line per gift copy, each with its own letter.
          items: lines.flatMap((l) =>
            l.letters.map((letter) => ({
              productId: l.productId,
              qty: 1,
              letter,
            })),
          ),
        },
      });
      clear();
      setDone(true);
    } catch {
      setError(t("required"));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-28 text-center">
        <h1 className="font-heb text-4xl font-bold text-gold-2">{t("orderDone")}</h1>
        <p className="mt-4 text-ivory/70">{t("orderDoneText")}</p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-8 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-navy transition hover:bg-gold-2"
        >
          {t("backHome")}
        </button>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-28 text-center">
        <p className="text-ivory/60">{t("emptyCart")}</p>
        <Link to="/" className="mt-6 inline-block text-sm text-gold-2 underline">
          {t("backHome")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pt-14 pb-24">
      <h1 className="font-heb text-4xl font-bold text-ivory">{t("checkout")}</h1>
      {!user && (
        <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-2">
          {t("loginForOrders")}{" "}
          <Link to="/login" className="font-semibold underline">
            {t("login")}
          </Link>
        </p>
      )}

      <p className="mt-4 text-xs text-ivory/50">{t("requiredNote")}</p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="font-heb text-lg text-ivory">{t("senderDetails")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className={label}>
                  {t("senderName")} <Req />
                </span>
                <input name="senderName" required className={field} />
                <p className="mt-2 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold-2">
                  {t("senderNameNote")}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className={label}>
                  {t("phone")} <Req />
                </span>
                <input name="phone" type="tel" required dir="ltr" maxLength={40} className={field} />
                <p className="mt-1 text-[11px] text-ivory/40">{t("phoneNote")}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="font-heb text-lg text-ivory">{t("recipientTitle")}</h2>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold-2">
              <MapPin className="size-3.5" />
              {t("shipsIsraelOnly")}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <span className={label}>
                  {t("recipientName")} <Req />
                </span>
                <input name="recipientName" required maxLength={120} className={field} />
              </div>
              <div>
                <span className={label}>
                  {t("recipientPhone")} <Req />
                </span>
                <input name="recipientPhone" type="tel" required dir="ltr" maxLength={40} className={field} />
              </div>
              <p className="-mt-2 text-[11px] text-ivory/40 sm:col-span-2">{t("recipientPhoneNote")}</p>
            </div>
            <h3 className="mt-6 text-sm text-ivory/80">{t("shippingTitle")}</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className={label}>
                  {t("city")} <Req />
                </span>
                <input name="city" required maxLength={120} className={field} />
              </div>
              <div>
                <span className={label}>
                  {t("street")} <Req />
                </span>
                <input name="street" required maxLength={150} className={field} />
              </div>
              <div>
                <span className={label}>
                  {t("houseNumber")} <Req />
                </span>
                <input
                  name="houseNumber"
                  required
                  maxLength={10}
                  pattern="[0-9]+[A-Za-z\u05D0-\u05EA]?"
                  inputMode="numeric"
                  className={field}
                />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>{t("country")}</span>
                <div className="relative">
                  <input
                    value={t("israel")}
                    readOnly
                    disabled
                    aria-readonly
                    className={`${field} cursor-not-allowed bg-white/5 pe-9 text-ivory/60`}
                  />
                  <Lock className="pointer-events-none absolute end-3 top-1/2 mt-0.5 size-4 -translate-y-1/2 text-ivory/40" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="font-heb text-lg text-ivory">{t("lettersTitle")}</h2>
            <p className="mt-1 text-xs text-ivory/50">{t("letterNote")}</p>
            <div className="mt-4 space-y-4">
              {lines.map((l) => {
                const p = getProduct(l.productId);
                if (!p) return null;
                return (
                  <div key={l.productId} className="rounded-xl border border-white/10 p-3">
                    <p className="text-sm text-ivory">
                      {tl(p.name)}
                      {l.qty > 1 && <span className="text-ivory/50"> × {l.qty}</span>}
                    </p>
                    {l.letters.map((letter, i) => (
                      <div key={i} className="mt-2">
                        {l.qty > 1 && (
                          <p className="text-xs text-gold-2">
                            {t("letterN").replace("{n}", String(i + 1))}
                          </p>
                        )}
                        <textarea
                          rows={2}
                          maxLength={500}
                          value={letter}
                          onChange={(e) => setLetter(l.productId, i, e.target.value.slice(0, 500))}
                          className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-transparent p-3 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="font-heb text-lg text-ivory">{t("paymentTitle")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className={label}>
                  {t("cardHolder")} <Req />
                </span>
                <input name="cardHolder" required className={field} />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>
                  {t("cardNumber")} <Req />
                </span>
                <input
                  name="cardNumber"
                  inputMode="numeric"
                  required
                  placeholder="0000 0000 0000 0000"
                  className={field}
                />
              </div>
              <div>
                <span className={label}>
                  {t("expiry")} <Req />
                </span>
                <input name="expiry" required placeholder="MM/YY" className={field} />
              </div>
              <div>
                <span className={label}>
                  {t("cvv")} <Req />
                </span>
                <input name="cvv" required inputMode="numeric" className={field} />
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:sticky lg:top-24">
          <h2 className="font-heb text-lg text-ivory">{t("cart")}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {lines.map((l) => {
              const p = getProduct(l.productId);
              if (!p) return null;
              return (
                <li key={l.productId} className="flex justify-between gap-3 text-ivory/70">
                  <span>
                    {tl(p.name)} × {l.qty}
                  </span>
                  <span className="whitespace-nowrap text-gold-2">
                    {formatPrice(p.price * l.qty, lang)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex justify-between border-t border-white/10 pt-4 font-heb text-lg text-ivory">
            <span>{t("total")}</span>
            <span className="text-gold-2">{formatPrice(total, lang)}</span>
          </div>
          {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-2 disabled:opacity-60"
          >
            {t("placeOrder")}
          </button>
        </aside>
      </form>
    </main>
  );
}
