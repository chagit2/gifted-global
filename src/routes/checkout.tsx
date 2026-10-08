import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Lock, MapPin, Truck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { LetterField } from "@/components/Letter";
import { useProducts } from "@/lib/products";
import { formatPrice, useI18n } from "@/lib/i18n";
import { placeOrder } from "@/lib/orders.functions";
import { useAuth } from "@/lib/auth";
import { couponDiscount, minDeliveryDate, type Coupon } from "@/lib/orders";
import { useSettings } from "@/lib/settings";
import { checkCoupon } from "@/lib/orders.functions";

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
  // Number of gifts in the placed order; null until the order is sent.
  const [done, setDone] = useState<number | null>(null);

  // The long form is replaced by a short thank-you; start it at the top.
  useEffect(() => {
    if (done !== null) window.scrollTo({ top: 0 });
  }, [done]);
  const [error, setError] = useState<string | null>(null);
  const { shippingFee } = useSettings();
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState(false);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const discount = coupon ? couponDiscount(coupon, total) : 0;
  const grandTotal = total - discount + shippingFee;
  // Computed in the browser so the date matches the customer's calendar.
  const [minDate, setMinDate] = useState("");
  useEffect(() => setMinDate(minDeliveryDate()), []);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError(false);
    try {
      setCoupon(await checkCoupon({ data: { code: couponInput.trim() } }));
    } catch {
      setCoupon(null);
      setCouponError(true);
    } finally {
      setCheckingCoupon(false);
    }
  };

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
          deliveryDate: String(fd.get("deliveryDate") ?? "") || null,
          customerNote: String(fd.get("customerNote") ?? ""),
          couponCode: coupon?.code ?? "",
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
      const gifts = lines.reduce((n, l) => n + l.qty, 0);
      clear();
      setDone(gifts);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        t(
          msg.includes("PRODUCT_UNAVAILABLE")
            ? "productUnavailable"
            : msg.includes("DELIVERY_TOO_SOON")
              ? "deliveryTooSoon"
              : msg.includes("INVALID_COUPON")
                ? "couponInvalid"
                : "orderFailed",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  if (done !== null) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-28 text-center">
        <h1 className="font-heb text-4xl font-bold leading-tight text-gold-2 sm:text-5xl">
          {t(done > 1 ? "orderDoneMany" : "orderDoneOne")}
        </h1>
        <p className="mt-5 text-lg text-ivory/80">{t(user ? "orderTrack" : "orderTrackGuest")}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to={user ? "/account" : "/login"}
            className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-navy transition hover:bg-gold-2"
          >
            {user ? t("account") : t("login")}
          </Link>
          <button
            onClick={() => navigate({ to: "/" })}
            className="rounded-full border border-white/15 px-7 py-3 text-sm text-ivory transition hover:border-gold/50"
          >
            {t("backHome")}
          </button>
        </div>
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
                <input
                  name="phone"
                  type="tel"
                  required
                  dir="ltr"
                  maxLength={40}
                  className={field}
                />
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
                <input
                  name="recipientPhone"
                  type="tel"
                  required
                  dir="ltr"
                  maxLength={40}
                  className={field}
                />
              </div>
              <p className="-mt-2 text-[11px] text-ivory/40 sm:col-span-2">
                {t("recipientPhoneNote")}
              </p>
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
            <p className="flex items-start gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-2">
              <Truck className="mt-0.5 size-4 shrink-0" />
              {t("shipCommitment")}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={label}>{t("deliveryDate")}</span>
                <input
                  name="deliveryDate"
                  type="date"
                  min={minDate || undefined}
                  className={`${field} [color-scheme:dark]`}
                />
                {minDate && (
                  <span className="mt-1 block text-[11px] text-ivory/40">
                    {t("deliveryDateHint").replace(
                      "{date}",
                      new Date(`${minDate}T12:00`).toLocaleDateString(
                        lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-GB",
                      ),
                    )}
                  </span>
                )}
              </label>
              <label className="block sm:col-span-2">
                <span className={label}>{t("customerNote")}</span>
                <textarea
                  name="customerNote"
                  rows={2}
                  maxLength={1000}
                  className={`${field} resize-y`}
                />
                <span className="mt-1 block text-[11px] text-ivory/40">
                  {t("customerNoteHint")}
                </span>
              </label>
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
                        <LetterField
                          value={letter}
                          onChange={(v) => setLetter(l.productId, i, v)}
                          className="mt-1"
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
          <div className="mt-5 border-t border-white/10 pt-4">
            <span className={label}>{t("coupon")}</span>
            {coupon ? (
              <div className="mt-1 flex items-center justify-between rounded-lg border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-200">
                <span dir="ltr">{coupon.code}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                  className="text-xs underline"
                >
                  {t("removeCoupon")}
                </button>
              </div>
            ) : (
              <div className="mt-1 flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCoupon();
                    }
                  }}
                  dir="ltr"
                  maxLength={40}
                  className={`${field} mt-0 uppercase`}
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={checkingCoupon || !couponInput.trim()}
                  className="shrink-0 rounded-lg border border-white/15 px-3 text-xs text-ivory transition hover:border-gold/50 disabled:opacity-40"
                >
                  {t("applyCoupon")}
                </button>
              </div>
            )}
            {couponError && <p className="mt-1 text-xs text-red-300">{t("couponInvalid")}</p>}
          </div>
          <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm text-ivory/70">
            <div className="flex justify-between">
              <span>{t("subtotal")}</span>
              <span>{formatPrice(total, lang)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-200">
                <span>{t("discount")}</span>
                <span>−{formatPrice(discount, lang)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t("shipping")}</span>
              <span>{formatPrice(shippingFee, lang)}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-heb text-lg text-ivory">
            <span>{t("total")}</span>
            <span className="text-gold-2">{formatPrice(grandTotal, lang)}</span>
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
