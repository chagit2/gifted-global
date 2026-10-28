import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OrderCard } from "@/components/OrderCard";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { lineKey, useCart } from "@/lib/cart";
import { ORDER_SELECT, type OrderRow } from "@/lib/orders";
import { savePrefill, splitStreet } from "@/lib/prefill";
import { matchChoice, parseChoice, useProducts } from "@/lib/products";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "אזור אישי · מתנות" }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { t } = useI18n();
  const { user, ready, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (!user) return;
    // Row-level security returns only this customer's orders.
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setOrders(data as OrderRow[]);
      });
  }, [user]);

  if (!user) return <main className="mx-auto max-w-4xl px-6 py-24 text-navy/65">{t("loading")}</main>;

  return (
    <main className="mx-auto max-w-4xl px-6 pt-14 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heb text-4xl font-bold text-navy">{t("account")}</h1>
          <p className="mt-1 text-sm text-navy/70" dir="ltr">
            {user.email}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy transition hover:bg-gold-2"
            >
              {t("adminArea")}
            </Link>
          )}
          <button
            onClick={signOut}
            className="rounded-full border border-navy/15 px-5 py-2 text-sm text-navy transition hover:border-gold/50"
          >
            {t("signOut")}
          </button>
        </div>
      </div>

      <h2 className="mt-12 font-heb text-2xl text-navy">{t("myOrders")}</h2>
      <div className="mt-6 space-y-4">
        {failed ? (
          <p className="text-sm text-red-600">{t("loadError")}</p>
        ) : orders === null ? (
          <p className="text-sm text-navy/70">{t("loading")}</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-navy/70">{t("noOrders")}</p>
        ) : (
          orders.map((o) => <OrderCard key={o.id} order={o} actions={<OrderAgain order={o} />} />)
        )}
      </div>
    </main>
  );
}

// Puts the order's gifts (with their letters) back in the cart and remembers
// the recipient for the checkout form.
function OrderAgain({ order }: { order: OrderRow }) {
  const { t } = useI18n();
  const { addMany } = useCart();
  const { getProduct } = useProducts();
  const navigate = useNavigate();
  const [note, setNote] = useState<string | null>(null);

  const again = () => {
    const byLine = new Map<string, { productId: string; choice: number[]; letters: string[] }>();
    let skipped = 0;
    for (const it of order.order_items) {
      const p = getProduct(it.product_id);
      // The same options are picked again by their Hebrew labels; a gift whose
      // options have changed since can't be reordered as it was.
      const choice = p ? matchChoice(p, parseChoice(it.choice)) : null;
      if (!p || !p.inStock || !choice) {
        skipped += it.qty;
        continue;
      }
      const key = lineKey({ productId: p.id, choice });
      const line = byLine.get(key) ?? { productId: p.id, choice, letters: [] };
      for (let i = 0; i < it.qty; i++) line.letters.push(it.letter);
      byLine.set(key, line);
    }
    if (byLine.size === 0) return setNote(t("orderAgainNone"));
    addMany([...byLine.values()]);
    savePrefill({
      recipientName: order.recipient_name,
      recipientPhone: order.recipient_phone,
      city: order.ship_city,
      ...splitStreet(order.ship_street),
    });
    if (skipped) window.alert(t("orderAgainPartial"));
    navigate({ to: "/cart" });
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={again}
        className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-4 py-2 text-xs font-semibold text-gold-deep transition hover:bg-gold/10"
      >
        <RotateCcw className="size-3.5" />
        {t("orderAgain")}
      </button>
      {note && <span className="text-xs text-navy/65">{note}</span>}
    </div>
  );
}
