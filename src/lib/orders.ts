import type { Key } from "./i18n";

// Default delivery charge per order (all gifts go to one address in Israel), in ₪.
// The live value is edited in the admin area (site_settings.shipping_fee).
export const SHIPPING_FEE = 50;

// We commit to shipping within this many business days of the order.
export const SHIP_WITHIN_BUSINESS_DAYS = 7;

// Israeli business days are Sunday–Thursday.
export function addBusinessDays(from: Date, days: number) {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 5 && wd !== 6) left--;
  }
  return d;
}

// yyyy-mm-dd in local time, for <input type="date"> and the delivery_date column.
export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Earliest delivery date a customer may ask for.
export const minDeliveryDate = (today = new Date()) =>
  isoDate(addBusinessDays(today, SHIP_WITHIN_BUSINESS_DAYS));

export type Coupon = { code: string; kind: string; amount: number };

// Coupons discount the gifts, never the shipping.
export const couponDiscount = (c: Coupon, subtotal: number) =>
  Math.min(subtotal, c.kind === "percent" ? Math.round(subtotal * Math.min(c.amount, 100)) / 100 : c.amount);

export const ORDER_STATUSES = ["new", "preparing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Orders in these statuses are finished and show under "completed".
export const DONE_STATUSES: readonly string[] = ["delivered", "cancelled"];

export const statusKey = (s: string): Key =>
  (ORDER_STATUSES as readonly string[]).includes(s) ? (`status_${s}` as Key) : "status_new";

export const statusTone: Record<string, string> = {
  new: "border-gold/40 bg-gold/10 text-gold-2",
  preparing: "border-sky-300/40 bg-sky-300/10 text-sky-200",
  shipped: "border-violet-300/40 bg-violet-300/10 text-violet-200",
  delivered: "border-emerald-300/40 bg-emerald-300/10 text-emerald-200",
  cancelled: "border-white/15 bg-white/5 text-ivory/50",
};

export type OrderRow = {
  id: string;
  created_at: string;
  sender_name: string;
  phone: string;
  delivery_date: string | null;
  customer_note: string;
  admin_note: string;
  coupon_code: string;
  discount: number;
  shipping_fee: number;
  recipient_name: string;
  recipient_phone: string;
  ship_street: string;
  ship_city: string;
  ship_country: string;
  total: number;
  status: string;
  // Payment currency; total_in_currency exists once db/currency.sql has run.
  currency?: string;
  total_in_currency?: number | null;
  order_items: { id: string; product_id: string; product_name: string; qty: number; unit_price: number; letter: string }[];
};

// "*" so columns added later (e.g. total_in_currency) come along when present.
export const ORDER_SELECT =
  "*, order_items(id, product_id, product_name, qty, unit_price, letter)";
