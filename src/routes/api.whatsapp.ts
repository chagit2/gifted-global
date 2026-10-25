import { createFileRoute } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { WebhookBody } from "@/lib/whatsapp.server";

// Webhook address to give Meta: https://<site>/api/whatsapp
// GET is Meta's one-time check; POST delivers incoming messages and the
// delivery status of replies.
export const Route = createFileRoute("/api/whatsapp")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ok =
          url.searchParams.get("hub.mode") === "subscribe" &&
          !!process.env["WHATSAPP_VERIFY_TOKEN"] &&
          url.searchParams.get("hub.verify_token") === process.env["WHATSAPP_VERIFY_TOKEN"];
        return ok
          ? new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 })
          : new Response("Forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const { validSignature, messageText } = await import("@/lib/whatsapp.server");
        const raw = await request.text();
        if (!(await validSignature(raw, request.headers.get("x-hub-signature-256"))))
          return new Response("Bad signature", { status: 401 });

        let body: WebhookBody;
        try {
          body = JSON.parse(raw) as WebhookBody;
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // The table comes from db/whatsapp.sql; the generated types may not know it yet.
        const table = () => (supabaseAdmin as unknown as SupabaseClient).from("wa_messages");

        const fresh: { name: string; text: string }[] = [];
        for (const entry of body.entry ?? [])
          for (const change of entry.changes ?? []) {
            const v = change.value ?? {};
            const names = new Map((v.contacts ?? []).map((c) => [c.wa_id, c.profile?.name ?? ""]));
            const rows = (v.messages ?? []).map((m) => ({
              wa_id: m.from,
              contact_name: names.get(m.from) ?? "",
              direction: "in",
              body: messageText(m),
              wa_message_id: m.id,
              created_at: m.timestamp
                ? new Date(Number(m.timestamp) * 1000).toISOString()
                : new Date().toISOString(),
            }));
            if (rows.length) {
              // Meta may deliver the same message twice: ignore repeats.
              const { data } = await table()
                .upsert(rows, { onConflict: "wa_message_id", ignoreDuplicates: true })
                .select("contact_name, body, wa_id");
              for (const r of (data ?? []) as unknown as { contact_name: string; body: string; wa_id: string }[])
                fresh.push({ name: r.contact_name || `+${r.wa_id}`, text: r.body });
            }
            for (const s of v.statuses ?? [])
              await table().update({ status: s.status }).eq("wa_message_id", s.id);
          }

        if (fresh.length) {
          const { notifyWhatsApp } = await import("@/lib/notify.server");
          await notifyWhatsApp(fresh);
        }
        // Always answer 200 quickly, or Meta keeps retrying.
        return new Response("OK", { status: 200 });
      },
    },
  },
});
