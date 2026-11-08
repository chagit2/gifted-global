import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ArrowRight, Check, CheckCheck, FileText, MessageCircle, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { getWhatsAppMedia, sendWhatsAppReply, whatsappStatus } from "@/lib/whatsapp.functions";

// Messages live in wa_messages (db/whatsapp.sql), not yet in the generated types.
const db = supabase as unknown as SupabaseClient;

export type WaMessage = {
  id: string;
  wa_id: string;
  contact_name: string;
  direction: "in" | "out";
  body: string;
  status: string;
  created_at: string;
  read_at: string | null;
  // Attachment details (photo, voice note, video, file, sticker), when any.
  media_type?: string;
  file_name?: string;
};

export const WA_KEY = ["wa_messages"] as const;
const DAY = 24 * 60 * 60 * 1000;

// All chat messages, refreshed every few seconds while the admin area is open.
export function useWhatsAppMessages(enabled = true) {
  return useQuery({
    enabled,
    queryKey: WA_KEY,
    queryFn: async () => {
      const { data, error } = await db
        .from("wa_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(3000);
      if (error) throw error;
      return (data ?? []) as WaMessage[];
    },
    refetchInterval: 5000,
  });
}

export const unreadCount = (messages: WaMessage[]) =>
  messages.filter((m) => m.direction === "in" && !m.read_at).length;

export function WhatsAppAdmin() {
  const { t, lang } = useI18n();
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading, isError } = useWhatsAppMessages();
  const { data: status } = useQuery({ queryKey: ["wa_status"], queryFn: () => whatsappStatus() });
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const locale = lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-GB";

  // One row per customer, newest conversation first.
  const conversations = useMemo(() => {
    const byId = new Map<string, { waId: string; name: string; last: WaMessage; unread: number }>();
    for (const m of messages) {
      const c = byId.get(m.wa_id) ?? { waId: m.wa_id, name: "", last: m, unread: 0 };
      if (m.contact_name) c.name = m.contact_name;
      c.last = m;
      if (m.direction === "in" && !m.read_at) c.unread++;
      byId.set(m.wa_id, c);
    }
    return [...byId.values()].sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
  }, [messages]);

  const thread = messages.filter((m) => m.wa_id === selected);
  const current = conversations.find((c) => c.waId === selected);
  const lastIn = [...thread].reverse().find((m) => m.direction === "in");
  const windowEnds = lastIn ? new Date(lastIn.created_at).getTime() + DAY : 0;
  const canReply = windowEnds > Date.now();

  // Opening a conversation marks its incoming messages as read.
  useEffect(() => {
    if (!selected || !current?.unread) return;
    db.from("wa_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("wa_id", selected)
      .eq("direction", "in")
      .is("read_at", null)
      .then(() => queryClient.invalidateQueries({ queryKey: WA_KEY }));
  }, [selected, current?.unread, queryClient]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [selected, thread.length]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      await sendWhatsAppReply({ data: { waId: selected, text: draft.trim() } });
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: WA_KEY });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        t(
          msg.includes("WINDOW_CLOSED")
            ? "waWindowClosed"
            : msg.includes("NOT_CONFIGURED")
              ? "waNotConfigured"
              : "waSendError",
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const time = (iso: string) =>
    new Date(iso).toLocaleString(locale, { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });

  if (isError) return <p className="text-sm text-red-600">{t("waLoadError")}</p>;

  return (
    <div>
      {status && !status.configured && (
        <p className="mb-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy/80">
          {t("waNotConfigured")}
        </p>
      )}

      <div className="grid overflow-hidden rounded-2xl border border-navy/10 bg-white/80 md:h-[34rem] md:grid-cols-[18rem_1fr]">
        {/* Conversations */}
        <ul
          className={`overflow-y-auto border-navy/10 md:border-e ${selected ? "hidden md:block" : ""}`}
          aria-label={t("waConversations")}
        >
          {isLoading ? (
            <li className="p-4 text-sm text-navy/70">{t("loading")}</li>
          ) : conversations.length === 0 ? (
            <li className="p-6 text-center text-sm text-navy/70">
              <MessageCircle className="mx-auto mb-2 size-8 text-gold-deep" />
              {t("waEmpty")}
            </li>
          ) : (
            conversations.map((c) => (
              <li key={c.waId}>
                <button
                  type="button"
                  onClick={() => setSelected(c.waId)}
                  className={`flex w-full items-start gap-3 border-b border-navy/5 px-4 py-3 text-start transition hover:bg-gold/10 ${
                    selected === c.waId ? "bg-gold/15" : ""
                  }`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy font-heb text-pearl">
                    {(c.name || "#").slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-navy">{c.name || `+${c.waId}`}</span>
                      <span className="shrink-0 text-[11px] text-navy/60">{time(c.last.created_at)}</span>
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-navy/70">
                        {c.last.direction === "out" && `${t("waYou")}: `}
                        {c.last.body}
                      </span>
                      {c.unread > 0 && (
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gold text-[10px] font-bold text-navy">
                          {c.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Thread */}
        <section className={`flex min-h-[28rem] flex-col ${selected ? "" : "hidden md:flex"}`}>
          {!current ? (
            <p className="m-auto p-6 text-sm text-navy/70">{t("waPick")}</p>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-navy/10 bg-navy px-4 py-3 text-pearl">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label={t("finderBack")}
                  className="grid size-9 place-items-center rounded-full hover:bg-white/10 md:hidden"
                >
                  <ArrowRight className="size-5 ltr:rotate-180" />
                </button>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{current.name || `+${current.waId}`}</span>
                  <a
                    href={`https://wa.me/${current.waId}`}
                    target="_blank"
                    rel="noopener"
                    dir="ltr"
                    className="block text-xs text-gold-2 hover:underline"
                  >
                    +{current.waId}
                  </a>
                </span>
              </header>

              <div className="flex-1 space-y-2 overflow-y-auto bg-pearl-2/60 p-4" aria-live="polite">
                {thread.map((m) => (
                  <div key={m.id} className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        m.direction === "out"
                          ? "rounded-ee-sm bg-navy text-pearl"
                          : "rounded-es-sm bg-white text-navy"
                      }`}
                    >
                      {m.media_type ? (
                        <>
                          <MediaPreview message={m} />
                          {caption(m.body) && (
                            <p className="mt-1 whitespace-pre-wrap break-words">{caption(m.body)}</p>
                          )}
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      )}
                      <p
                        className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                          m.direction === "out" ? "text-pearl/70" : "text-navy/60"
                        }`}
                      >
                        {time(m.created_at)}
                        {m.direction === "out" &&
                          (m.status === "read" ? (
                            <CheckCheck className="size-3.5 text-gold-2" aria-label={t("waRead")} />
                          ) : m.status === "delivered" ? (
                            <CheckCheck className="size-3.5" aria-label={t("waDelivered")} />
                          ) : m.status === "failed" ? (
                            <span className="text-red-300">{t("waFailed")}</span>
                          ) : (
                            <Check className="size-3.5" aria-label={t("waSent")} />
                          ))}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottom} />
              </div>

              <form onSubmit={send} className="border-t border-navy/10 bg-white p-3">
                <p className="mb-2 text-[11px] text-navy/70">
                  {canReply
                    ? t("waWindowOpen").replace("{time}", time(new Date(windowEnds).toISOString()))
                    : t("waWindowClosed")}
                </p>
                <div className="flex items-end gap-2">
                  <label className="flex-1">
                    <span className="sr-only">{t("waReply")}</span>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          e.currentTarget.form?.requestSubmit();
                        }
                      }}
                      rows={2}
                      maxLength={4000}
                      disabled={!canReply}
                      placeholder={t("waReply")}
                      className="w-full resize-none rounded-xl border border-navy/15 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none disabled:bg-navy/5"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!canReply || sending || !draft.trim()}
                    aria-label={t("waSend")}
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-navy transition hover:bg-gold-2 disabled:opacity-40"
                  >
                    <Send className="size-5 rtl:-scale-x-100" />
                  </button>
                </div>
                {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

// Media messages are stored as "📷 תמונה: caption"; the bubble shows the
// attachment itself and only the caption as text.
const caption = (body: string) => {
  const i = body.indexOf(": ");
  return i === -1 ? "" : body.slice(i + 2);
};

// The photo, player or file link of a message. The file is fetched from
// WhatsApp the first time it is shown.
function MediaPreview({ message }: { message: WaMessage }) {
  const { t } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["wa_media", message.id],
    queryFn: () => getWhatsAppMedia({ data: { id: message.id } }),
    staleTime: 50 * 60 * 1000,
    retry: 1,
  });

  if (isLoading)
    return <div className="h-32 w-48 max-w-full rounded-lg animate-shimmer" aria-label={t("loading")} />;
  if (isError || !data)
    return <p className="text-xs opacity-80">{message.body} · {t("waMediaError")}</p>;

  switch (message.media_type) {
    case "image":
    case "sticker":
      return (
        <a href={data.url} target="_blank" rel="noopener" title={t("waOpenFull")}>
          <img
            src={data.url}
            alt={caption(message.body) || t("waImage")}
            className={`max-h-72 rounded-lg object-contain ${message.media_type === "sticker" ? "w-32" : "w-full"}`}
          />
        </a>
      );
    case "audio":
      return <audio controls preload="metadata" src={data.url} className="w-64 max-w-full" aria-label={t("waVoice")} />;
    case "video":
      return <video controls preload="metadata" src={data.url} className="max-h-72 w-full rounded-lg" />;
    default:
      return (
        <a
          href={data.url}
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2 rounded-lg border border-current/20 px-3 py-2 underline-offset-4 hover:underline"
        >
          <FileText className="size-5 shrink-0" />
          <span className="truncate">{message.file_name || t("waFile")}</span>
        </a>
      );
  }
}
