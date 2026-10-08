import { CalendarClock, Printer } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useProducts } from "@/lib/products";
import { LetterPreview } from "@/components/Letter";
import { formatPrice, useI18n } from "@/lib/i18n";
import { DONE_STATUSES, statusKey, statusTone, type OrderRow } from "@/lib/orders";
import { setAdminNote } from "@/lib/orders.functions";

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs ${statusTone[status] ?? statusTone["new"]}`}
    >
      {t(statusKey(status))}
    </span>
  );
}

// One order: date, number, items with their letters, address and total.
// `admin` adds the sender's phone; `statusSlot` replaces the read-only badge.
export function OrderCard({
  order,
  admin,
  statusSlot,
}: {
  order: OrderRow;
  admin?: boolean;
  statusSlot?: ReactNode;
}) {
  const { t, tl, lang } = useI18n();
  const { getProduct } = useProducts();
  const locale = lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-GB";
  const date = new Date(order.created_at).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Each gift copy is its own row; group copies of the same product.
  const groups = new Map<string, { name: string; letters: string[]; price: number }>();
  for (const it of order.order_items) {
    const p = getProduct(it.product_id);
    const g = groups.get(it.product_id) ?? {
      name: p ? tl(p.name) : it.product_name || it.product_id,
      letters: [],
      price: 0,
    };
    for (let i = 0; i < it.qty; i++) g.letters.push(it.letter);
    g.price += it.unit_price * it.qty;
    groups.set(it.product_id, g);
  }

  const itemsTotal = order.order_items.reduce((sum, it) => sum + it.unit_price * it.qty, 0);
  // Older orders didn't store shipping; it is whatever the items and discount don't cover.
  const shipping =
    order.shipping_fee || Math.max(0, order.total - itemsTotal + (order.discount || 0));
  // Open orders due within three days get a warning colour in the admin view.
  const soon =
    !!order.delivery_date &&
    !DONE_STATUSES.includes(order.status) &&
    new Date(`${order.delivery_date}T23:59`).getTime() - Date.now() < 3 * 86400000;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-heb text-lg text-ivory">
            {t("order")} #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-ivory/50">{date}</p>
          {order.delivery_date && (
            <p
              className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
                admin && soon
                  ? "border-red-300/50 bg-red-300/10 text-red-200"
                  : "border-gold/30 text-gold-2"
              }`}
            >
              <CalendarClock className="size-3" />
              {t("deliverBy")}:{" "}
              {new Date(`${order.delivery_date}T12:00`).toLocaleDateString(locale)}
            </p>
          )}
        </div>
        {statusSlot ?? <StatusBadge status={order.status} />}
      </header>

      <ul className="mt-4 space-y-3 border-t border-white/10 pt-4">
        {[...groups.entries()].map(([id, g]) => (
          <li key={id}>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-ivory">
                {g.name}
                {g.letters.length > 1 && (
                  <span className="text-ivory/50"> × {g.letters.length}</span>
                )}
              </span>
              <span className="whitespace-nowrap text-gold-2">{formatPrice(g.price, lang)}</span>
            </div>
            {g.letters.some(Boolean) && (
              <ul className="mt-1 space-y-1">
                {g.letters.map((letter, i) =>
                  letter ? (
                    <li key={i}>
                      <LetterPreview
                        text={letter}
                        copyable={admin === true}
                        label={
                          g.letters.length > 1 && (
                            <span className="text-gold-2">
                              {t("letterN").replace("{n}", String(i + 1))}:{" "}
                            </span>
                          )
                        }
                      />
                    </li>
                  ) : null,
                )}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {order.customer_note && (
        <div className="mt-4 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2 text-xs text-ivory/80">
          <span className="text-gold-2">{t("customerNote")}: </span>
          <span className="whitespace-pre-wrap">{order.customer_note}</span>
        </div>
      )}

      <footer className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-4 text-sm">
        <div className="text-ivory/60">
          <p className="text-xs text-ivory/40">{t("shipTo")}</p>
          <p>
            {order.recipient_name && <>{order.recipient_name} · </>}
            {order.ship_street}, {order.ship_city}
          </p>
          {admin && order.recipient_phone && (
            <p className="text-xs">
              {t("recipientPhone")}: <span dir="ltr">{order.recipient_phone}</span>
            </p>
          )}
          <p className="text-xs">
            {t("senderName")}: {order.sender_name}
            {admin && (
              <>
                {" "}
                · <span dir="ltr">{order.phone}</span>
              </>
            )}
          </p>
        </div>
        <div className="text-end">
          {order.discount > 0 && (
            <p className="text-xs text-emerald-200">
              {t("discount")}
              {order.coupon_code && <span dir="ltr"> ({order.coupon_code})</span>}: −
              {formatPrice(order.discount, lang)}
            </p>
          )}
          {shipping > 0 && (
            <p className="text-xs text-ivory/50">
              {t("shipping")}: {formatPrice(shipping, lang)}
            </p>
          )}
          <p className="font-heb text-lg text-ivory">
            {t("total")}: <span className="text-gold-2">{formatPrice(order.total, lang)}</span>
          </p>
        </div>
      </footer>

      {admin && <AdminTools order={order} />}
    </article>
  );
}

// Admin-only: internal note and print buttons.
function AdminTools({ order }: { order: OrderRow }) {
  const { t } = useI18n();
  const [note, setNote] = useState(order.admin_note ?? "");
  const [saved, setSaved] = useState(order.admin_note ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const save = async () => {
    setState("saving");
    try {
      await setAdminNote({ data: { orderId: order.id, note } });
      setSaved(note);
      setState("saved");
    } catch {
      setState("error");
    }
  };

  const printBtn =
    "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-ivory transition hover:border-gold/50 hover:text-gold-2";

  return (
    <div className="mt-4 space-y-3 border-t border-dashed border-white/10 pt-4">
      <label className="block">
        <span className="text-xs text-ivory/50">{t("adminNote")}</span>
        <div className="mt-1 flex gap-2">
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setState("idle");
            }}
            rows={1}
            maxLength={2000}
            className="min-h-9 w-full resize-y rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs text-ivory focus:border-gold/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={save}
            disabled={note === saved || state === "saving"}
            className="shrink-0 rounded-lg border border-white/15 px-3 text-xs text-ivory transition hover:border-gold/50 disabled:opacity-40"
          >
            {t("save")}
          </button>
        </div>
        {state === "saved" && note === saved && (
          <span className="mt-1 block text-[11px] text-emerald-300">{t("saved")}</span>
        )}
        {state === "error" && (
          <span className="mt-1 block text-[11px] text-red-300">{t("saveError")}</span>
        )}
      </label>
      <div className="flex flex-wrap gap-2">
        <a
          href={`/print/${order.id}?what=letters`}
          target="_blank"
          rel="noopener"
          className={printBtn}
        >
          <Printer className="size-3.5" />
          {t("printLetters")}
        </a>
        <a
          href={`/print/${order.id}?what=label`}
          target="_blank"
          rel="noopener"
          className={printBtn}
        >
          <Printer className="size-3.5" />
          {t("printLabel")}
        </a>
      </div>
    </div>
  );
}
