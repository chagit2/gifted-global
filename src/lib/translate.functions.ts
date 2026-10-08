import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Free machine translation (MyMemory, no account needed) for the admin product
// form. Limited daily quota, so only admins may call it.
const API = "https://api.mymemory.translated.net/get";
// MyMemory accepts up to 500 bytes of query text per request.
const CHUNK = 450;

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

// Split on sentence and line ends so each request stays under the size limit.
const chunks = (text: string) => {
  const out: string[] = [];
  let cur = "";
  for (const part of text.split(/(?<=[.!?\n])/)) {
    if (new TextEncoder().encode(cur + part).length > CHUNK && cur) {
      out.push(cur);
      cur = "";
    }
    cur += part;
  }
  if (cur) out.push(cur);
  return out;
};

async function translateOne(text: string, to: "en" | "fr") {
  if (!text.trim()) return "";
  let result = "";
  for (const piece of chunks(text)) {
    const lead = piece.match(/^\s*/)![0];
    const trail = piece.match(/\s*$/)![0];
    const params = new URLSearchParams({ q: piece.trim(), langpair: `he|${to}` });
    const res = await fetch(`${API}?${params}`);
    const body = (await res.json()) as {
      responseStatus: number | string;
      responseDetails?: string;
      quotaFinished?: boolean;
      responseData?: { translatedText?: string };
    };
    const translated = body.responseData?.translatedText ?? "";
    if (
      body.quotaFinished ||
      Number(body.responseStatus) === 429 ||
      translated.startsWith("MYMEMORY WARNING")
    ) {
      throw new Error("QUOTA");
    }
    if (Number(body.responseStatus) !== 200)
      throw new Error(body.responseDetails || "Translation failed");
    result += lead + decode(translated) + trail;
  }
  return result;
}

export const translateProductTexts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().max(200),
        subtitle: z.string().max(200),
        description: z.string().max(2000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin !== true) throw new Error("Forbidden");

    const out = {
      en: { name: "", subtitle: "", description: "" },
      fr: { name: "", subtitle: "", description: "" },
    };
    for (const to of ["en", "fr"] as const) {
      out[to].name = await translateOne(data.name, to);
      out[to].subtitle = await translateOne(data.subtitle, to);
      out[to].description = await translateOne(data.description, to);
    }
    return out;
  });
