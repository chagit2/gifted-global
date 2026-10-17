import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "סיסמה חדשה · מתנות" }, { name: "robots", content: "noindex" }] }),
  component: ResetPasswordPage,
});

const field =
  "mt-1 w-full rounded-lg border border-navy/10 bg-transparent px-3 py-2 text-sm text-navy focus:border-gold/50 focus:outline-none";

// Opened from the "forgot password" email: the link signs the visitor in for
// recovery, and here they choose a new password.
function ResetPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "ready" | "invalid" | "saving" | "error">("checking");

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setState((s) => (s === "checking" ? "ready" : s));
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) setState((v) => (v === "checking" ? "ready" : v));
    });
    // The link's token is read on load; if nothing arrives, it was used or expired.
    const timer = window.setTimeout(() => setState((s) => (s === "checking" ? "invalid" : s)), 4000);
    return () => {
      data.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    setState("saving");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setState("error");
    navigate({ to: "/account" });
  };

  return (
    <main className="mx-auto max-w-md px-6 pt-16 pb-24">
      <h1 className="font-heb text-4xl font-bold text-navy">{t("newPasswordTitle")}</h1>
      {state === "checking" ? (
        <p className="mt-8 text-sm text-navy/70">{t("loading")}</p>
      ) : state === "invalid" ? (
        <p className="mt-8 rounded-2xl border border-gold/30 bg-gold/10 p-5 text-sm text-navy/80">
          {t("resetLinkInvalid")}
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-navy/10 bg-white/70 p-6 backdrop-blur-xl"
        >
          <label className="block">
            <span className="text-xs text-navy/65">{t("newPassword")}</span>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              dir="ltr"
              className={field}
            />
            <span className="mt-1 block text-[11px] text-navy/70">{t("passwordHint")}</span>
          </label>
          {state === "error" && <p className="text-xs text-red-600">{t("saveError")}</p>}
          <button
            type="submit"
            disabled={state === "saving"}
            className="w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-2 disabled:opacity-60"
          >
            {t("saveNewPassword")}
          </button>
        </form>
      )}
    </main>
  );
}
