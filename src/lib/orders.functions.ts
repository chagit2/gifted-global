import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { couponDiscount, minDeliveryDate, ORDER_STATUSES, SHIPPING_FEE } from "./orders";

const schema = z.object({
  senderName: z.string().min(1).max(120),
  phone: z.string().min(3).max(40),
  recipientName: z.string().min(1).max(120),
  recipientPhone: z.string().min(3).max(40),
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  zip: z.string().max(30).default(""),
  country: z.string().min(1).max(120),
  language: z.enum(["he", "fr", "en"]),
  deliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .default(null),
  customerNote: z.string().max(1000).default(""),
  couponCode: z.string().max(40).default(""),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(120),
        qty: z.number().int().min(1).max(99),
        letter: z.string().max(500).default(""),
      }),
    )
    .min(1),
});

type Admin = (typeof import("@/integrations/supabase/client.server"))["supabaseAdmin"];

// An active, unexpired coupon by its (upper-case) code, or null.
async function findCoupon(admin: Admin, code: string) {
  const { data } = await admin
    .from("coupons")
    .select("code, kind, amount, active, expires_on")
    .eq("code", code)
    .maybeSingle();
  if (!data || !data.active) return null;
  if (data.expires_on && data.expires_on < new Date().toISOString().slice(0, 10)) return null;
  return { code: data.code, kind: data.kind, amount: Number(data.amount) };
}

export const checkCoupon = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ code: z.string().min(1).max(40) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const coupon = await findCoupon(supabaseAdmin, data.code.trim().toUpperCase());
    if (!coupon) throw new Error("INVALID_COUPON");
    return coupon;
  });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getRequest } = await import("@tanstack/react-start/server");

    // Link the order to the signed-in customer, if any (guests may order too).
    let userId: string | null = null;
    const auth = getRequest()?.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const { data: u } = await supabaseAdmin.auth.getUser(auth.slice(7));
      userId = u.user?.id ?? null;
    }

    // Prices and names come from the catalog, never from the browser.
    const ids = [...new Set(data.items.map((i) => i.productId))];
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name_he, price, active, in_stock")
      .in("id", ids);
    if (productsError) throw new Error(productsError.message);
    const catalog = new Map((products ?? []).filter((p) => p.active && p.in_stock).map((p) => [p.id, p]));
    if (ids.some((id) => !catalog.has(id))) throw new Error("PRODUCT_UNAVAILABLE");
    const subtotal = data.items.reduce((sum, i) => sum + Number(catalog.get(i.productId)!.price) * i.qty, 0);

    // A day of slack for time zones (the customer may be in France).
    if (data.deliveryDate && data.deliveryDate < minDeliveryDate(new Date(Date.now() - 86400000))) {
      throw new Error("DELIVERY_TOO_SOON");
    }

    const { data: settings } = await supabaseAdmin.from("site_settings").select("shipping_fee").eq("id", 1).maybeSingle();
    const shippingFee = settings ? Number(settings.shipping_fee) : SHIPPING_FEE;

    const couponCode = data.couponCode.trim().toUpperCase();
    let discount = 0;
    if (couponCode) {
      const coupon = await findCoupon(supabaseAdmin, couponCode);
      if (!coupon) throw new Error("INVALID_COUPON");
      discount = couponDiscount(coupon, subtotal);
    }
    const total = subtotal - discount + shippingFee;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        sender_name: data.senderName,
        phone: data.phone,
        recipient_name: data.recipientName,
        recipient_phone: data.recipientPhone,
        ship_street: data.street,
        ship_city: data.city,
        ship_zip: data.zip,
        ship_country: data.country,
        language: data.language,
        total,
        user_id: userId,
        delivery_date: data.deliveryDate,
        customer_note: data.customerNote.trim(),
        coupon_code: couponCode,
        discount,
        shipping_fee: shippingFee,
      })
      .select("id")
      .single();

    if (error || !order) throw new Error(error?.message ?? "Order failed");

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      data.items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        product_name: catalog.get(i.productId)!.name_he,
        qty: i.qty,
        unit_price: Number(catalog.get(i.productId)!.price),
        letter: i.letter,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);

    const { notifyNewOrder } = await import("./notify.server");
    await notifyNewOrder({
      id: order.id,
      senderName: data.senderName,
      phone: data.phone,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      address: `${data.street}, ${data.city}`,
      deliveryDate: data.deliveryDate,
      customerNote: data.customerNote.trim(),
      couponCode,
      discount,
      shippingFee,
      total,
      lines: data.items.map((i) => ({
        name: catalog.get(i.productId)!.name_he,
        letter: i.letter,
        price: Number(catalog.get(i.productId)!.price) * i.qty,
      })),
    });

    return { orderId: order.id };
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ orderId: z.string().uuid(), status: z.enum(ORDER_STATUSES) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setAdminNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ orderId: z.string().uuid(), note: z.string().max(2000) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("orders").update({ admin_note: data.note }).eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
