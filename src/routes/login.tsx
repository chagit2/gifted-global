import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { IDLE_FLAG, useAuth } from "@/lib/auth";
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
  "mt-1 w-full rounded-lg border border-navy/10 bg-transparent px-3 py-2 text-sm text-navy placeholder:text-navy/35 focus:border-gold/50 focus:outline-none";

function LoginPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Emails a link to /reset-password, where a new password is chosen.
  const forgot = async () => {
    const email = String(new FormData(formRef.current ?? undefined).get("email") ?? "").trim();
    setError(null);
    setErrorDetail(null);
    setNotice(null);
    if (!email) return setError(t("forgotNeedEmail"));
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      const known = error.code ? AUTH_ERRORS[error.code] : undefined;
      setError(t(known ?? "forgotError"));
      if (!known) setErrorDetail(error.message);
    } else setNotice(t("forgotSent"));
  };

  // Arrived here because the idle timer signed the visitor out.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(IDLE_FLAG)) {
        sessionStorage.removeItem(IDLE_FLAG);
        setNotice(t("idleLoggedOut"));
      }
    } catch {
      /* ignore */
    }
  }, [t]);

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
      <h1 className="font-heb text-4xl font-bold text-navy">{mode === "in" ? t("login") : t("signup")}</h1>
      <form ref={formRef} onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-navy/10 bg-white/70 p-6 backdrop-blur-xl">
        <label className="block">
          <span className="text-xs text-navy/65">{t("email")}</span>
          <input name="email" type="email" required autoComplete="email" dir="ltr" className={field} />
        </label>
        <label className="block">
          <span className="text-xs text-navy/65">{t("password")}</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            dir="ltr"
            className={field}
          />
          {mode === "up" && <span className="mt-1 block text-[11px] text-navy/70">{t("passwordHint")}</span>}
        </label>
        {mode === "in" && (
          <button
            type="button"
            onClick={forgot}
            disabled={busy}
            className="-mt-2 text-xs text-gold-deep underline-offset-4 hover:underline disabled:opacity-60"
          >
            {t("forgotPassword")}
          </button>
        )}
        {error && (
          <p className="text-xs text-red-600">
            {error}
            {errorDetail && (
              <span className="mt-1 block text-[11px] text-red-300/70" dir="ltr">
                {errorDetail}
              </span>
            )}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold-deep">{notice}</p>
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
          className="w-full text-center text-xs text-navy/65 underline hover:text-gold-deep"
        >
          {mode === "in" ? t("noAccount") : t("haveAccount")}
        </button>
      </form>
    </main>
  );
}
