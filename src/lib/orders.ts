import type { Key } from "./i18n";

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
  ship_street: string;
  ship_city: string;
  ship_country: string;
  total: number;
  status: string;
  order_items: { id: string; product_id: string; product_name: string; qty: number; unit_price: number; letter: string }[];
};

export const ORDER_SELECT =
  "id, created_at, sender_name, phone, ship_street, ship_city, ship_country, total, status, order_items(id, product_id, product_name, qty, unit_price, letter)";
