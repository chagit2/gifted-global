// WhatsApp Cloud API (Meta). Secrets, set in Lovable:
//   WHATSAPP_TOKEN            access token for the WhatsApp Business account
//   WHATSAPP_PHONE_NUMBER_ID  id of the shop's WhatsApp number (from Meta's API setup page)
//   WHATSAPP_VERIFY_TOKEN     any secret word; the same word is entered in Meta's webhook settings
//   WHATSAPP_APP_SECRET       the Meta app's secret, used to check webhook deliveries are genuine
const API_VERSION = process.env["WHATSAPP_API_VERSION"] || "v23.0";

export const whatsappConfigured = () =>
  !!process.env["WHATSAPP_TOKEN"] && !!process.env["WHATSAPP_PHONE_NUMBER_ID"];

// Customers may be answered freely for 24 hours after their last message;
// after that WhatsApp only allows pre-approved template messages.
export const REPLY_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function sendText(to: string, body: string) {
  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${process.env["WHATSAPP_PHONE_NUMBER_ID"]}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env["WHATSAPP_TOKEN"]}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } }),
    },
  );
  const data = (await res.json().catch(() => ({}))) as {
    messages?: { id: string }[];
    error?: { message?: string };
  };
  if (!res.ok) throw new Error(`WHATSAPP_SEND: ${data.error?.message ?? res.status}`);
  return data.messages?.[0]?.id ?? null;
}

// Checks Meta's X-Hub-Signature-256 header (HMAC-SHA256 of the raw body).
export async function validSignature(raw: string, header: string | null) {
  const secret = process.env["WHATSAPP_APP_SECRET"];
  if (!secret) return true; // not set up yet: accept, as Meta's own test calls do
  if (!header?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  const hex = Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
  const given = header.slice(7);
  if (given.length !== hex.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

type Incoming = {
  from: string;
  id: string;
  timestamp?: string;
  type: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
  image?: Media & { caption?: string };
  video?: Media & { caption?: string };
  audio?: Media;
  voice?: Media;
  sticker?: Media;
  document?: Media & { caption?: string; filename?: string };
};
type Media = { id?: string; mime_type?: string };

// The attachment of a photo / voice / video / file / sticker message.
export function messageMedia(m: Incoming) {
  const kind = (["image", "video", "audio", "voice", "sticker", "document"] as const).find(
    (k) => k === m.type,
  );
  const media = kind ? m[kind] : undefined;
  if (!kind || !media?.id) return { media_type: "", media_id: "", mime_type: "", file_name: "" };
  return {
    media_type: kind === "voice" ? "audio" : kind,
    media_id: media.id,
    mime_type: media.mime_type ?? "",
    file_name: kind === "document" ? (m.document?.filename ?? "") : "",
  };
}

// Fetches an attachment from WhatsApp (its links need the token and expire
// within minutes, so the file is downloaded and kept in our own storage).
export async function downloadMedia(mediaId: string) {
  const auth = { Authorization: `Bearer ${process.env["WHATSAPP_TOKEN"]}` };
  const meta = await fetch(`https://graph.facebook.com/${API_VERSION}/${mediaId}`, { headers: auth });
  const info = (await meta.json().catch(() => ({}))) as { url?: string; mime_type?: string };
  if (!meta.ok || !info.url) throw new Error(`WHATSAPP_MEDIA: ${meta.status}`);
  const file = await fetch(info.url, { headers: auth });
  if (!file.ok) throw new Error(`WHATSAPP_MEDIA_FILE: ${file.status}`);
  return { blob: await file.blob(), mime: info.mime_type ?? file.headers.get("content-type") ?? "" };
}

// Readable text for any kind of incoming message.
export function messageText(m: Incoming) {
  if (m.type === "text") return m.text?.body ?? "";
  if (m.type === "button") return m.button?.text ?? "";
  if (m.type === "interactive")
    return m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? "";
  const label: Record<string, string> = {
    image: "📷 תמונה",
    video: "🎥 סרטון",
    audio: "🎤 הודעה קולית",
    voice: "🎤 הודעה קולית",
    document: "📄 קובץ",
    sticker: "סטיקר",
    location: "📍 מיקום",
    contacts: "👤 איש קשר",
  };
  const caption = m.image?.caption ?? m.video?.caption ?? m.document?.caption ?? m.document?.filename;
  return `${label[m.type] ?? `[${m.type}]`}${caption ? `: ${caption}` : ""}`;
}

export type WebhookBody = {
  entry?: {
    changes?: {
      value?: {
        contacts?: { wa_id: string; profile?: { name?: string } }[];
        messages?: Incoming[];
        statuses?: { id: string; status: string }[];
      };
    }[];
  }[];
};
