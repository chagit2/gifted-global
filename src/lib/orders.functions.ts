import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { couponDiscount, minDeliveryDate, ORDER_STATUSES, SHIPPING_FEE } from "./orders";
import { parseOptions, type Choice } from "./products";
import { BOX_ID, BOX_NAME, DEFAULT_BOX_MIN_ITEMS, type BoxContent } from "./box";

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
  // Currency the customer chose to pay in; the rate is looked up here.
  currency: z.enum(["ILS", "EUR", "USD"]).default("ILS"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(120),
        // One value index per gift option (e.g. silver or gold).
        choice: z.array(z.number().int().min(0).max(99)).max(20).default([]),
        qty: z.number().int().min(1).max(99),
        letter: z.string().max(500).default(""),
        // A box the customer designed (productId BOX_ID): the items in it.
        contents: z
          .array(
            z.object({
              productId: z.string().min(1).max(120),
              choice: z.array(z.number().int().min(0).max(99)).max(20).default([]),
              qty: z.number().int().min(1).max(99),
            }),
          )
          .max(60)
          .optional(),
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
    const isBox = (i: (typeof data.items)[number]) => i.productId === BOX_ID;
    if (data.items.some((i) => isBox(i) !== !!i.contents?.length)) throw new Error("PRODUCT_UNAVAILABLE");
    const ids = [
      ...new Set(
        data.items.flatMap((i) => (isBox(i) ? i.contents!.map((c) => c.productId) : [i.productId])),
      ),
    ];
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("*")
      .in("id", ids);
    if (productsError) throw new Error(productsError.message);
    const catalog = new Map(
      (products ?? []).filter((p) => p.active && p.in_stock).map((p) => [p.id, p]),
    );
    if (ids.some((id) => !catalog.has(id))) throw new Error("PRODUCT_UNAVAILABLE");
    // Ready-made boxes are sold on their own, single items only inside a
    // designed box. (Before db/custom-box.sql every product is a ready-made box.)
    const kindOf = (id: string) => ((catalog.get(id) as { kind?: string }).kind === "item" ? "item" : "bundle");
    for (const i of data.items) {
      if (isBox(i) ? i.contents!.some((c) => kindOf(c.productId) !== "item") : kindOf(i.productId) !== "bundle")
        throw new Error("PRODUCT_UNAVAILABLE");
    }

    // Every option of a gift must have a valid choice; the labels are copied
    // onto the order.
    const choiceFor = (productId: string, choice: number[]): Choice => {
      const options = parseOptions(catalog.get(productId)!.options);
      if (choice.length !== options.length || choice.some((v, k) => v >= options[k]!.values.length))
        throw new Error("OPTION_REQUIRED");
      return options.map((o, k) => ({ name: o.name, value: o.values[choice[k]!]! }));
    };
    const choices = data.items.map((i): Choice => (isBox(i) ? [] : choiceFor(i.productId, i.choice)));
    const contents = data.items.map((i): BoxContent[] =>
      isBox(i)
        ? i.contents!.map((c) => {
            const p = catalog.get(c.productId)!;
            return {
              productId: c.productId,
              name: { he: p.name_he, fr: p.name_fr, en: p.name_en },
              choice: choiceFor(c.productId, c.choice),
              qty: c.qty,
              unitPrice: Number(p.price),
            };
          })
        : [],
    );
    const unitPrice = (n: number) =>
      isBox(data.items[n]!)
        ? contents[n]!.reduce((sum, c) => sum + c.unitPrice * c.qty, 0)
        : Number(catalog.get(data.items[n]!.productId)!.price);
    const nameHe = (n: number) =>
      isBox(data.items[n]!) ? BOX_NAME.he : catalog.get(data.items[n]!.productId)!.name_he;
    // For the email; a value chosen by photo alone is named by its number.
    const choiceHe = (c: Choice, picked: number[]) =>
      c.map((x, k) => `${x.name.he}: ${x.value.he || `תמונה ${picked[k]! + 1}`}`).join(" · ");
    const origin = new URL(getRequest()?.url ?? "http://localhost").origin;
    const subtotal = data.items.reduce((sum, i, n) => sum + unitPrice(n) * i.qty, 0);

    // A day of slack for time zones (the customer may be in France).
    if (data.deliveryDate && data.deliveryDate < minDeliveryDate(new Date(Date.now() - 86400000))) {
      throw new Error("DELIVERY_TOO_SOON");
    }

    // "*" so a column that isn't in the database yet can't break the query.
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    const shippingFee = settings ? Number(settings.shipping_fee) : SHIPPING_FEE;
    const minItems =
      Number((settings as { box_min_items?: number } | null)?.box_min_items) || DEFAULT_BOX_MIN_ITEMS;
    if (contents.some((c) => c.length && c.reduce((n, x) => n + x.qty, 0) < minItems))
      throw new Error("BOX_TOO_SMALL");

    const couponCode = data.couponCode.trim().toUpperCase();
    let discount = 0;
    if (couponCode) {
      const coupon = await findCoupon(supabaseAdmin, couponCode);
      if (!coupon) throw new Error("INVALID_COUPON");
      discount = couponDiscount(coupon, subtotal);
    }
    const total = subtotal - discount + shippingFee;

    let fxRate = 1;
    if (data.currency !== "ILS") {
      const { fetchRates } = await import("./rates.server");
      const rates = await fetchRates();
      if (!rates) throw new Error("RATES_UNAVAILABLE");
      fxRate = rates[data.currency];
    }
    const totalInCurrency = Math.round((total / fxRate) * 100) / 100;

    const row = {
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
      currency: data.currency,
      fx_rate: fxRate,
      total_in_currency: totalInCurrency,
    };
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert(row)
      .select("id")
      .single();

    if (error || !order) throw new Error(error?.message ?? "Order failed");

    // Only sent when some gift has a choice, so orders keep working on a
    // database where db/product-options.sql hasn't run yet. (All rows get the
    // field then: a row without it would be inserted as null.)
    const withChoice = choices.some((c) => c.length > 0);
    // Likewise `contents` (db/custom-box.sql) only when the order has a designed box.
    const withContents = contents.some((c) => c.length > 0);
    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      data.items.map((i, n) => ({
        order_id: order.id,
        ...(withChoice && { choice: choices[n] }),
        ...(withContents && { contents: contents[n] }),
        product_id: i.productId,
        product_name: nameHe(n),
        qty: i.qty,
        unit_price: unitPrice(n),
        letter: i.letter,
      })) as never,
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
      lines: data.items.map((i, n) => ({
        name: isBox(i)
          ? `${BOX_NAME.he}: ${contents[n]!
              .map((c, k) =>
                [`${c.name.he} × ${c.qty}`, choiceHe(c.choice, i.contents![k]!.choice)]
                  .filter(Boolean)
                  .join(" · "),
              )
              .join(", ")}`
          : [nameHe(n), choiceHe(choices[n]!, i.choice)].filter(Boolean).join(" · "),
        letter: i.letter,
        price: unitPrice(n) * i.qty,
        images: [...choices[n]!, ...contents[n]!.flatMap((c) => c.choice)].flatMap((c) =>
          c.value.image ? [new URL(c.value.image, origin).href] : [],
        ),
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
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ admin_note: data.note })
      .eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
