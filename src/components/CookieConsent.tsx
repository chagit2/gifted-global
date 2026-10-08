import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadAnalytics, readConsent, saveConsent, type Consent } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";

// Bottom banner asking for analytics consent; analytics load only on "accept".
export function CookieConsent() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (c === "granted") loadAnalytics();
    else if (c === null) setShow(true);
  }, []);

  const choose = (c: Consent) => {
    saveConsent(c);
    if (c === "granted") loadAnalytics();
    setShow(false);
  };

  if (!show) return null;
  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-2xl border border-white/15 bg-navy-2/95 p-4 text-sm text-ivory/80 shadow-2xl shadow-black/40 backdrop-blur-xl print:hidden sm:flex-nowrap"
    >
      <p className="flex-1">
        {t("cookieText")}{" "}
        <Link to="/privacy" className="text-gold-2 underline">
          {t("privacyMore")}
        </Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => choose("denied")}
          className="rounded-full border border-white/15 px-4 py-2 text-xs text-ivory transition hover:border-gold/50"
        >
          {t("cookieDecline")}
        </button>
        <button
          onClick={() => choose("granted")}
          className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy transition hover:bg-gold-2"
        >
          {t("cookieAccept")}
        </button>
      </div>
    </div>
  );
}
