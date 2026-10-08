import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { ORDER_SELECT, type OrderRow } from "@/lib/orders";
import { useSettings } from "@/lib/settings";

// Printable letters (one per page) or a shipping label for an order. Admin only.
export const Route = createFileRoute("/print/$orderId")({
  validateSearch: (s: Record<string, unknown>) =>
    ({ what: s["what"] === "label" ? "label" : "letters" }) as const,
  head: () => ({ meta: [{ title: "הדפסה · מתנות" }, { name: "robots", content: "noindex" }] }),
  component: PrintPage,
});

const page =
  "mx-auto my-6 w-full max-w-[210mm] bg-white text-neutral-900 shadow-2xl print:my-0 print:shadow-none";

function PrintPage() {
  const { orderId } = Route.useParams();
  const { what } = Route.useSearch();
  const { t } = useI18n();
  const { user, ready, isAdmin } = useAuth();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [failed, setFailed] = useState(false);
  const { letterBackgrounds } = useSettings();
  // Background chosen for this print; remembered for the next order.
  const [bg, setBg] = useState<string>("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("letterBackground") ?? "";
      if (saved && letterBackgrounds.includes(saved)) setBg(saved);
    } catch {
      /* storage unavailable */
    }
  }, [letterBackgrounds]);
  const chooseBg = (url: string) => {
    setBg(url);
    try {
      localStorage.setItem("letterBackground", url);
    } catch {
      /* storage unavailable */
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", orderId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setFailed(true);
        else setOrder(data as OrderRow);
      });
  }, [isAdmin, orderId]);

  // Labels print straight away; letters wait so a background can be chosen.
  useEffect(() => {
    if (order && (what === "label" || letterBackgrounds.length === 0))
      setTimeout(() => window.print(), 300);
  }, [order, what, letterBackgrounds.length]);

  if (!ready || (user && isAdmin && !order && !failed))
    return <main className="p-10 text-ivory/60">{t("loading")}</main>;
  if (!user || !isAdmin) return <main className="p-10 text-ivory/60">{t("notAllowed")}</main>;
  if (failed || !order) return <main className="p-10 text-red-300">{t("loadError")}</main>;

  const letters = order.order_items.filter((it) => it.letter.trim());
  const num = order.id.slice(0, 8).toUpperCase();

  return (
    <main dir="rtl" className="px-4 pb-10 print:p-0">
      <style>{"@page { size: A4; margin: 0 }"}</style>
      {what === "letters" && letterBackgrounds.length > 0 && (
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center gap-3 pt-6 print:hidden">
          <span className="text-sm text-ivory/70">{t("background")}:</span>
          <button
            onClick={() => chooseBg("")}
            className={`grid h-20 w-14 place-items-center rounded border-2 bg-white text-[10px] text-neutral-500 ${
              bg === "" ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            {t("noBackground")}
          </button>
          {letterBackgrounds.map((url) => (
            <button
              key={url}
              onClick={() => chooseBg(url)}
              className={`h-20 w-14 overflow-hidden rounded border-2 ${
                bg === url ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="mx-auto flex max-w-[210mm] justify-end pt-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy hover:bg-gold-2"
        >
          <Printer className="size-4" />
          {what === "label" ? t("printLabel") : t("printLetters")}
        </button>
      </div>

      {what === "label" ? (
        <section className={`${page} p-[15mm]`}>
          <div className="rounded-xl border-2 border-neutral-900 p-8 text-2xl leading-relaxed">
            <p className="text-sm text-neutral-500">#{num}</p>
            <p className="mt-2 text-4xl font-bold">{order.recipient_name}</p>
            <p className="mt-4">{order.ship_street}</p>
            <p>{order.ship_city}</p>
            <p>ישראל</p>
            <p className="mt-4" dir="ltr" style={{ textAlign: "right" }}>
              {order.recipient_phone}
            </p>
            {order.delivery_date && (
              <p className="mt-4 text-lg">
                למסירה עד: {new Date(`${order.delivery_date}T12:00`).toLocaleDateString("he-IL")}
              </p>
            )}
            <p className="mt-6 border-t border-neutral-300 pt-4 text-base text-neutral-600">
              מאת: {order.sender_name}
            </p>
          </div>
        </section>
      ) : letters.length === 0 ? (
        <p className="py-10 text-center text-ivory/60">—</p>
      ) : (
        letters.map((it, i) => (
          <section
            key={it.id}
            className={`${page} flex min-h-[297mm] flex-col items-center justify-center p-[25mm] print:min-h-0 print:h-[297mm]`}
            style={{
              breakAfter: i < letters.length - 1 ? "page" : "auto",
              ...(bg && {
                backgroundImage: `url("${bg}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                printColorAdjust: "exact",
                WebkitPrintColorAdjust: "exact",
              }),
            }}
          >
            <div
              className={`w-full max-w-[140mm] py-16 text-center ${bg ? "" : "border-y border-[#b8964a]"}`}
            >
              <p className="whitespace-pre-wrap font-heb text-2xl leading-loose">{it.letter}</p>
            </div>
          </section>
        ))
      )}
    </main>
  );
}
