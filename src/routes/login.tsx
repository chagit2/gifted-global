import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n, type Key } from "@/lib/i18n";
import { isEmailRegistered } from "@/lib/auth.functions";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "התחברות · מתנות" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

// Friendly text for the auth errors people actually hit; anything else falls
// back to the generic message, with the server's own text shown underneath.
const AUTH_ERRORS: Record<string, Key> = {
  weak_password: "authWeakPassword",
  over_email_send_rate_limit: "authRateLimit",
  over_request_rate_limit: "authRateLimit",
  signup_disabled: "authSignupDisabled",
  email_provider_disabled: "authSignupDisabled",
  user_already_exists: "authUserExists",
  email_exists: "authUserExists",
  email_address_invalid: "authInvalidEmail",
  validation_failed: "authInvalidEmail",
  email_not_confirmed: "authNotConfirmed",
  invalid_credentials: "authError",
};

const field =
  "mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none";

function LoginPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/account" });
  }, [user, navigate]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    setBusy(true);
    setError(null);
    setErrorDetail(null);
    setNotice(null);
    const fail = (err: { code?: string | undefined; message: string }, fallback: Key) => {
      const known = err.code ? AUTH_ERRORS[err.code] : undefined;
      setError(t(known ?? fallback));
      if (!known) setErrorDetail(err.message);
    };
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error?.code === "invalid_credentials") {
        // Unknown email: switch to sign-up, keeping what was typed.
        const registered = await isEmailRegistered({ data: { email } })
          .then((r) => r.registered)
          .catch(() => true);
        if (registered) fail(error, "authError");
        else {
          setMode("up");
          setNotice(t("emailNotRegistered"));
        }
      } else if (error) fail(error, "authError");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/account` },
      });
      if (error) fail(error, "signupError");
      // Without a session, the project requires confirming the email first.
      else if (!data.session) setNotice(t("signupCheckEmail"));
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto max-w-md px-6 pt-16 pb-24">
      <h1 className="font-heb text-4xl font-bold text-ivory">{mode === "in" ? t("login") : t("signup")}</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <label className="block">
          <span className="text-xs text-ivory/60">{t("email")}</span>
          <input name="email" type="email" required autoComplete="email" dir="ltr" className={field} />
        </label>
        <label className="block">
          <span className="text-xs text-ivory/60">{t("password")}</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            dir="ltr"
            className={field}
          />
          {mode === "up" && <span className="mt-1 block text-[11px] text-ivory/40">{t("passwordHint")}</span>}
        </label>
        {error && (
          <p className="text-xs text-red-300">
            {error}
            {errorDetail && (
              <span className="mt-1 block text-[11px] text-red-300/70" dir="ltr">
                {errorDetail}
              </span>
            )}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold-2">{notice}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy transition hover:bg-gold-2 disabled:opacity-60"
        >
          {mode === "in" ? t("login") : t("signup")}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError(null);
            setNotice(null);
          }}
          className="w-full text-center text-xs text-ivory/60 underline hover:text-gold-2"
        >
          {mode === "in" ? t("noAccount") : t("haveAccount")}
        </button>
      </form>
    </main>
  );
}
