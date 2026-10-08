import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { SETTINGS_KEY, useSettings } from "@/lib/settings";

const field =
  "mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-ivory focus:border-gold/50 focus:outline-none";

export function SettingsAdmin() {
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
