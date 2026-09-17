import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  senderName: z.string().min(1).max(120),
  phone: z.string().min(3).max(40),
  street: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  zip: z.string().min(1).max(30),
  country: z.string().min(1).max(120),
  language: z.enum(["he", "fr", "en"]),
  total: z.number().nonnegative(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(120),
        qty: z.number().int().min(1).max(99),
        letter: z.string().max(500).default(""),
        unitPrice: z.number().nonnegative(),
      }),
    )
    .min(1),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        sender_name: data.senderName,
        phone: data.phone,
        ship_street: data.street,
        ship_city: data.city,
        ship_zip: data.zip,
        ship_country: data.country,
        language: data.language,
        total: data.total,
      })
      .select("id")
      .single();

    if (error || !order) throw new Error(error?.message ?? "Order failed");

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      data.items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        qty: i.qty,
        unit_price: i.unitPrice,
        letter: i.letter,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);

    return { orderId: order.id };
  });
