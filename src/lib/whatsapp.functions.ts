import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: SupabaseClient; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (data !== true) throw new Error("Forbidden");
}

// Whether the WhatsApp secrets are set, for the admin chat screen.
export const whatsappStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { whatsappConfigured } = await import("./whatsapp.server");
    return { configured: whatsappConfigured() };
  });

// Sends the shop owner's reply to a customer and stores it in the chat.
export const sendWhatsAppReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ waId: z.string().regex(/^\d{6,20}$/), text: z.string().trim().min(1).max(4000) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { whatsappConfigured, sendText, REPLY_WINDOW_MS } = await import("./whatsapp.server");
    if (!whatsappConfigured()) throw new Error("NOT_CONFIGURED");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as SupabaseClient;
    const { data: last } = await db
      .from("wa_messages")
      .select("created_at")
      .eq("wa_id", data.waId)
      .eq("direction", "in")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastIn = last ? new Date((last as { created_at: string }).created_at).getTime() : 0;
    if (Date.now() - lastIn > REPLY_WINDOW_MS) throw new Error("WINDOW_CLOSED");

    const id = await sendText(data.waId, data.text);
    const { error } = await db.from("wa_messages").insert({
      wa_id: data.waId,
      direction: "out",
      body: data.text,
      wa_message_id: id,
      status: "sent",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
