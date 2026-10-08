import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { SETTINGS_KEY, useSettings } from "@/lib/settings";

const field =
  "mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-ivory focus:border-gold/50 focus:outline-none";

const BUCKET = "product-images";
const IMAGE_ROUTE = "/product-images/";

export function SettingsAdmin() {
  return (
    <div className="space-y-6">
      <ShippingFee />
      <LetterBackgrounds />
    </div>
  );
}

// Background images for printed letters: stored in the private photo bucket
// (served at /product-images/<file>) and listed in site_settings.
function LetterBackgrounds() {
  const { t } = useI18n();
  const { letterBackgrounds } = useSettings();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveList = async (list: string[]) => {
    const { error } = await supabase
      .from("site_settings")
      .update({ letter_backgrounds: list })
      .eq("id", 1);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  };

  const upload = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type });
        if (error) throw error;
        urls.push(IMAGE_ROUTE + path);
      }
      await saveList([...letterBackgrounds, ...urls]);
    } catch {
      setError(t("uploadError"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (url: string) => {
    if (!window.confirm(t("confirmDelete"))) return;
    setError(null);
    try {
      await saveList(letterBackgrounds.filter((u) => u !== url));
      await supabase.storage.from(BUCKET).remove([url.slice(IMAGE_ROUTE.length)]);
    } catch {
      setError(t("saveError"));
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="font-heb text-lg text-ivory">{t("letterBackgrounds")}</h2>
      <p className="mt-1 text-xs text-ivory/50">{t("letterBackgroundsHint")}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {letterBackgrounds.map((url) => (
          <div
            key={url}
            className="relative h-36 w-[102px] overflow-hidden rounded-lg border border-white/10 bg-white"
          >
            <img src={url} alt="" className="size-full object-cover" />
            <button
              type="button"
              aria-label={t("delete")}
              onClick={() => remove(url)}
              className="absolute top-1 end-1 grid size-6 place-items-center rounded-full bg-navy/80 text-ivory hover:text-red-300"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <label className="grid h-36 w-[102px] cursor-pointer place-items-center rounded-lg border border-dashed border-white/20 p-2 text-center text-xs text-ivory/60 hover:border-gold/50 hover:text-gold-2">
          {busy ? t("uploading") : `+ ${t("addBackground")}`}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            onChange={(e) => {
              upload(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
            className="sr-only"
          />
        </label>
      </div>
      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
    </section>
  );
}

function ShippingFee() {
  const { t } = useI18n();
  const { shippingFee, isLoading } = useSettings();
  const queryClient = useQueryClient();
  const [fee, setFee] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (!isLoading) setFee(String(shippingFee));
  }, [isLoading, shippingFee]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState("saving");
    const { error } = await supabase
      .from("site_settings")
      .update({ shipping_fee: Number(fee) })
      .eq("id", 1);
    if (error) return setState("error");
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    setState("saved");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <label className="block">
        <span className="text-xs text-ivory/60">{t("shippingFeeLabel")}</span>
        <input
          type="number"
          min={0}
          step="0.01"
          required
          value={fee}
          onChange={(e) => {
            setFee(e.target.value);
            setState("idle");
          }}
          dir="ltr"
          className={field}
        />
      </label>
      <button
        type="submit"
        disabled={state === "saving" || isLoading}
        className="mt-4 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold-2 disabled:opacity-60"
      >
        {t("save")}
      </button>
      {state === "saved" && <span className="ms-3 text-xs text-emerald-300">{t("saved")}</span>}
      {state === "error" && <p className="mt-2 text-xs text-red-300">{t("saveError")}</p>}
    </form>
  );
}
