import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OrderCard } from "@/components/OrderCard";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { ORDER_SELECT, type OrderRow } from "@/lib/orders";
import { savePrefill, splitStreet } from "@/lib/prefill";
import { useProducts } from "@/lib/products";

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

  if (!user) return <main className="mx-auto max-w-4xl px-6 py-24 text-ivory/60">{t("loading")}</main>;

  return (
    <main className="mx-auto max-w-4xl px-6 pt-14 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heb text-4xl font-bold text-ivory">{t("account")}</h1>
          <p className="mt-1 text-sm text-ivory/50" dir="ltr">
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
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-ivory transition hover:border-gold/50"
          >
            {t("signOut")}
          </button>
        </div>
      </div>

      <h2 className="mt-12 font-heb text-2xl text-ivory">{t("myOrders")}</h2>
      <div className="mt-6 space-y-4">
        {failed ? (
          <p className="text-sm text-red-300">{t("loadError")}</p>
        ) : orders === null ? (
          <p className="text-sm text-ivory/50">{t("loading")}</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-ivory/50">{t("noOrders")}</p>
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
    const byProduct = new Map<string, string[]>();
    let skipped = 0;
    for (const it of order.order_items) {
      const p = getProduct(it.product_id);
      if (!p || !p.inStock) {
        skipped += it.qty;
        continue;
      }
      const letters = byProduct.get(it.product_id) ?? [];
      for (let i = 0; i < it.qty; i++) letters.push(it.letter);
      byProduct.set(it.product_id, letters);
    }
    if (byProduct.size === 0) return setNote(t("orderAgainNone"));
    addMany([...byProduct].map(([productId, letters]) => ({ productId, letters })));
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
        className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-4 py-2 text-xs font-semibold text-gold-2 transition hover:bg-gold/10"
      >
        <RotateCcw className="size-3.5" />
        {t("orderAgain")}
      </button>
      {note && <span className="text-xs text-ivory/60">{note}</span>}
    </div>
  );
}
