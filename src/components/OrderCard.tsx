import type { ReactNode } from "react";
import { useProducts } from "@/lib/products";
import { LetterPreview } from "@/components/Letter";
import { formatPrice, useI18n } from "@/lib/i18n";
import { statusKey, statusTone, type OrderRow } from "@/lib/orders";

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

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-heb text-lg text-ivory">
            {t("order")} #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-ivory/50">{date}</p>
        </div>
        {statusSlot ?? <StatusBadge status={order.status} />}
      </header>

      <ul className="mt-4 space-y-3 border-t border-white/10 pt-4">
        {[...groups.entries()].map(([id, g]) => (
          <li key={id}>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-ivory">
                {g.name}
                {g.letters.length > 1 && <span className="text-ivory/50"> × {g.letters.length}</span>}
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
                            <span className="text-gold-2">{t("letterN").replace("{n}", String(i + 1))}: </span>
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
        <p className="font-heb text-lg text-ivory">
          {t("total")}: <span className="text-gold-2">{formatPrice(order.total, lang)}</span>
        </p>
      </footer>
    </article>
  );
}
