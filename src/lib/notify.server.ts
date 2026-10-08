// New-order email to the shop owner, sent through Resend (https://resend.com).
// Needs two secrets: RESEND_API_KEY and ORDER_NOTIFY_EMAIL. Without them nothing
// is sent; a failed email never fails the order.

type Line = { name: string; letter: string; price: number };

export type OrderEmail = {
  id: string;
  senderName: string;
  phone: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  deliveryDate: string | null;
  customerNote: string;
  couponCode: string;
  discount: number;
  shippingFee: number;
  total: number;
  lines: Line[];
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ils = (n: number) => `₪${n.toLocaleString("he-IL")}`;

export async function notifyNewOrder(o: OrderEmail) {
  const key = process.env["RESEND_API_KEY"];
  const to = process.env["ORDER_NOTIFY_EMAIL"];
  if (!key || !to) return;

  const num = o.id.slice(0, 8).toUpperCase();
  const row = (label: string, value: string) =>
    value ? `<tr><td style="color:#777;padding:2px 12px 2px 0">${label}</td><td>${esc(value)}</td></tr>` : "";
  const items = o.lines
    .map(
      (l) =>
        `<li style="margin-bottom:8px"><b>${esc(l.name)}</b> · ${ils(l.price)}` +
        (l.letter ? `<div style="white-space:pre-wrap;color:#444;margin-top:4px">${esc(l.letter)}</div>` : "") +
        `</li>`,
    )
    .join("");
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:14px">
    <h2 style="margin:0 0 12px">הזמנה חדשה #${num}</h2>
    <table>
      ${row("שולח", `${o.senderName} · ${o.phone}`)}
      ${row("מקבל", `${o.recipientName} · ${o.recipientPhone}`)}
      ${row("כתובת", o.address)}
      ${row("תאריך מסירה רצוי", o.deliveryDate ?? "")}
      ${row("קופון", o.couponCode ? `${o.couponCode} (−${ils(o.discount)})` : "")}
      ${row("משלוח", ils(o.shippingFee))}
      ${row("סה״כ", ils(o.total))}
      ${row("הערות הלקוח", o.customerNote)}
    </table>
    <h3 style="margin:16px 0 8px">מתנות</h3>
    <ul style="padding-inline-start:18px">${items}</ul>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env["ORDER_NOTIFY_FROM"] || "Matanot <onboarding@resend.dev>",
        to: [to],
        subject: `הזמנה חדשה #${num} · ${ils(o.total)}`,
        html,
      }),
    });
    if (!res.ok) console.error("[notify] Resend", res.status, await res.text());
  } catch (e) {
    console.error("[notify] failed", e);
  }
}
