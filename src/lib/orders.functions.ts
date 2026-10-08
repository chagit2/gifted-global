import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ORDER_STATUSES, SHIPPING_FEE } from "./orders";

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
      .select("id, name_he, price, active")
      .in("id", ids);
    if (productsError) throw new Error(productsError.message);
    const catalog = new Map((products ?? []).filter((p) => p.active).map((p) => [p.id, p]));
    if (ids.some((id) => !catalog.has(id))) throw new Error("Product unavailable");
    const subtotal = data.items.reduce((sum, i) => sum + Number(catalog.get(i.productId)!.price) * i.qty, 0);
    const total = subtotal + SHIPPING_FEE;

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
