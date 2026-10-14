import { Link } from "@tanstack/react-router";
import { Gift, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Friendly empty cart: a floating gift, one warm line, and two ways onward.
// `onNavigate` lets the cart panel close itself when a link is used.
export function EmptyCart({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div className={`flex flex-col items-center text-center ${compact ? "px-6 py-12" : "py-14"}`}>
      <span className="relative grid size-24 place-items-center rounded-full border border-gold/40 bg-gold/10 animate-floaty">
        <Gift className="size-10 text-gold-deep" aria-hidden />
        <span aria-hidden className="absolute -top-1 end-1 text-gold">
          <Sparkles className="size-5" />
        </span>
      </span>
      <p className="mt-6 font-heb text-2xl text-navy">{t("emptyCart")}</p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-navy/70">{t("emptyCartText")}</p>
      <div className={`mt-7 flex w-full flex-col gap-3 ${compact ? "" : "max-w-sm"}`}>
        <Link
          to="/"
          onClick={onNavigate}
          className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy shadow-md shadow-gold/20 transition hover:bg-gold-2 active:scale-[0.97]"
        >
          {t("ctaBrowse")}
        </Link>
        <Link
          to="/find"
          onClick={onNavigate}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-navy/15 px-6 py-3 text-sm text-navy transition hover:border-gold/60 hover:text-gold-deep active:scale-[0.97]"
        >
          <Sparkles className="size-4" aria-hidden />
          {t("finderTitle")}
        </Link>
      </div>
    </div>
  );
}
