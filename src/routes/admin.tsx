import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OrderCard } from "@/components/OrderCard";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";
import { CouponsAdmin } from "@/components/admin/CouponsAdmin";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  DONE_STATUSES,
  ORDER_SELECT,
  ORDER_STATUSES,
  statusKey,
  statusTone,
  type OrderRow,
} from "@/lib/orders";
import { setOrderStatus } from "@/lib/orders.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "ניהול · מתנות" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { t } = useI18n();
  const { user, ready, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [section, setSection] = useState<"orders" | "products" | "coupons" | "settings">("orders");
  const [tab, setTab] = useState<"open" | "done">("open");
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    // Row-level security lets admins read every order.
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setOrders(data as OrderRow[]);
      });
  }, [isAdmin]);

  if (!user)
    return <main className="mx-auto max-w-5xl px-6 py-24 text-ivory/60">{t("loading")}</main>;
  if (!isAdmin)
    return <main className="mx-auto max-w-5xl px-6 py-24 text-ivory/60">{t("notAllowed")}</main>;

  // Open orders: those with a delivery date first (soonest first), then newest.
  const open = (orders ?? [])
    .filter((o) => !DONE_STATUSES.includes(o.status))
    .sort((a, b) =>
      a.delivery_date && b.delivery_date
        ? a.delivery_date.localeCompare(b.delivery_date)
        : a.delivery_date
          ? -1
          : b.delivery_date
            ? 1
            : b.created_at.localeCompare(a.created_at),
    );
  const done = (orders ?? []).filter((o) => DONE_STATUSES.includes(o.status));
  const shown = tab === "open" ? open : done;

  const changeStatus = async (order: OrderRow, status: (typeof ORDER_STATUSES)[number]) => {
    setSaving(order.id);
    setSaveError(null);
    try {
      await setOrderStatus({ data: { orderId: order.id, status } });
      setOrders((prev) => prev?.map((o) => (o.id === order.id ? { ...o, status } : o)) ?? null);
    } catch {
      setSaveError(order.id);
    } finally {
      setSaving(null);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 pt-14 pb-24">
      <h1 className="font-heb text-4xl font-bold text-ivory">{t("adminArea")}</h1>

      <nav className="mt-6 flex gap-6 overflow-x-auto border-b border-white/10">
        {(
          [
            ["orders", t("tabOrders")],
            ["products", t("tabProducts")],
            ["coupons", t("tabCoupons")],
            ["settings", t("tabSettings")],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`-mb-px shrink-0 border-b-2 pb-3 font-heb text-lg transition ${
              section === key
                ? "border-gold text-gold-2"
                : "border-transparent text-ivory/60 hover:text-ivory"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {section === "products" ? (
        <div className="mt-8">
          <ProductsAdmin />
        </div>
      ) : section === "coupons" ? (
        <div className="mt-8">
          <CouponsAdmin />
        </div>
      ) : section === "settings" ? (
        <div className="mt-8">
          <SettingsAdmin />
        </div>
      ) : (
        <>
          <div className="mt-8 flex gap-2">
            {(
              [
                ["open", t("ordersOpen"), open.length],
                ["done", t("ordersDone"), done.length],
              ] as const
            ).map(([key, label, n]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-full px-5 py-2 text-sm transition ${
                  tab === key
                    ? "bg-gold font-semibold text-navy"
                    : "border border-white/15 text-ivory hover:border-gold/50"
                }`}
              >
                {label} ({n})
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {failed ? (
              <p className="text-sm text-red-300">{t("loadError")}</p>
            ) : orders === null ? (
              <p className="text-sm text-ivory/50">{t("loading")}</p>
            ) : shown.length === 0 ? (
              <p className="text-sm text-ivory/50">{t("noOrders")}</p>
            ) : (
              shown.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  admin
                  statusSlot={
                    <div className="text-end">
                      <label className="flex items-center gap-2 text-xs text-ivory/50">
                        {t("statusLabel")}
                        <select
                          value={o.status}
                          disabled={saving === o.id}
                          onChange={(e) =>
                            changeStatus(o, e.target.value as (typeof ORDER_STATUSES)[number])
                          }
                          className={`rounded-full border px-3 py-1 text-xs focus:outline-none disabled:opacity-50 ${
                            statusTone[o.status] ?? statusTone["new"]
                          }`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-navy-2 text-ivory">
                              {t(statusKey(s))}
                            </option>
                          ))}
                        </select>
                      </label>
                      {saveError === o.id && (
                        <p className="mt-1 text-xs text-red-300">{t("saveError")}</p>
                      )}
                    </div>
                  }
                />
              ))
            )}
          </div>
        </>
      )}
    </main>
  );
}
