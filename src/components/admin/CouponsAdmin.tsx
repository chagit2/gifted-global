import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatPrice, useI18n } from "@/lib/i18n";

type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

const field =
  "mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-ivory focus:border-gold/50 focus:outline-none";
const label = "text-xs text-ivory/60";

export function CouponsAdmin() {
  const { t, lang } = useI18n();
  const [coupons, setCoupons] = useState<CouponRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const [amount, setAmount] = useState("");
  const [expires, setExpires] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setCoupons(data);
      });
  useEffect(() => {
    load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("coupons").insert({
      code: code.trim().toUpperCase(),
      kind,
      amount: Number(amount),
      expires_on: expires || null,
    });
    setBusy(false);
    if (error) return setError(t(error.code === "23505" ? "couponExists" : "saveError"));
    setCode("");
    setAmount("");
    setExpires("");
    load();
  };

  const toggle = async (c: CouponRow) => {
    const { error } = await supabase
      .from("coupons")
      .update({ active: !c.active })
      .eq("code", c.code);
    if (error) return setError(t("saveError"));
    load();
  };

  const remove = async (c: CouponRow) => {
    if (!window.confirm(t("confirmDelete"))) return;
    const { error } = await supabase.from("coupons").delete().eq("code", c.code);
    if (error) return setError(t("saveError"));
    load();
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={add}
        className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:grid-cols-5"
      >
        <label className="block sm:col-span-2">
          <span className={label}>{t("coupon")}</span>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
            minLength={2}
            maxLength={40}
            dir="ltr"
            className={`${field} uppercase`}
          />
        </label>
        <label className="block">
          <span className={label}>{t("couponAmount")}</span>
          <div className="flex gap-2">
            <input
              required
              type="number"
              min={0.01}
              max={kind === "percent" ? 100 : undefined}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              dir="ltr"
              className={field}
            />
          </div>
        </label>
        <label className="block">
          <span className={label}>&nbsp;</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "percent" | "fixed")}
            className={field}
          >
            <option value="percent" className="bg-navy-2">
              {t("couponPercent")}
            </option>
            <option value="fixed" className="bg-navy-2">
              {t("couponFixed")}
            </option>
          </select>
        </label>
        <label className="block">
          <span className={label}>{t("couponExpires")}</span>
          <input
            type="date"
            min={today}
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className={`${field} [color-scheme:dark]`}
          />
        </label>
        <div className="sm:col-span-5">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy transition hover:bg-gold-2 disabled:opacity-60"
          >
            + {t("addCoupon")}
          </button>
          {error && <span className="ms-3 text-xs text-red-300">{error}</span>}
        </div>
      </form>

      <ul className="space-y-3">
        {failed ? (
          <li className="text-sm text-red-300">{t("loadError")}</li>
        ) : coupons === null ? (
          <li className="text-sm text-ivory/50">{t("loading")}</li>
        ) : coupons.length === 0 ? (
          <li className="text-sm text-ivory/50">{t("noCoupons")}</li>
        ) : (
          coupons.map((c) => {
            const expired = !!c.expires_on && c.expires_on < today;
            return (
              <li
                key={c.code}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
              >
                <span dir="ltr" className="font-mono text-sm text-gold-2">
                  {c.code}
                </span>
                <span className="text-sm text-ivory">
                  {c.kind === "percent"
                    ? `${Number(c.amount)}%`
                    : formatPrice(Number(c.amount), lang)}
                </span>
                {c.expires_on && (
                  <span className={`text-xs ${expired ? "text-red-300" : "text-ivory/50"}`}>
                    {expired
                      ? t("couponExpired")
                      : `${t("couponExpires").split(" (")[0]}: ${c.expires_on}`}
                  </span>
                )}
                <label className="ms-auto flex items-center gap-2 text-xs text-ivory/70">
                  <input
                    type="checkbox"
                    checked={c.active}
                    onChange={() => toggle(c)}
                    className="size-4 accent-gold"
                  />
                  {t("couponActive")}
                </label>
                <button
                  onClick={() => remove(c)}
                  className="text-xs text-red-300/80 hover:text-red-300"
                >
                  {t("delete")}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
