import { Link, useRouterState } from "@tanstack/react-router";
import { Gift, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getCategory } from "@/lib/catalog";
import { upcomingHoliday, type UpcomingHoliday } from "@/lib/holidays";
import { useI18n } from "@/lib/i18n";

const closedKey = (slug: string) => `holidayBannerClosed:${slug}`;

// Countdown strip under the header: the next holiday and the last day to order
// so the gift arrives on time. Closing it hides it for the rest of the visit.
export function HolidayBanner() {
  const { t, tl, lang } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Computed in the browser so the dates follow the visitor's clock.
  const [h, setH] = useState<UpcomingHoliday | null>(null);

  useEffect(() => {
    const next = upcomingHoliday();
    let closed = false;
    try {
      closed = !!next && sessionStorage.getItem(closedKey(next.slug)) === "1";
    } catch {
      /* storage blocked: just show it */
    }
    setH(closed ? null : next);
  }, []);

  const category = h && getCategory(h.slug);
  if (!h || !category || path.startsWith("/admin") || path.startsWith("/print")) return null;

  const close = () => {
    try {
      sessionStorage.setItem(closedKey(h.slug), "1");
    } catch {
      /* ignore */
    }
    setH(null);
  };

  const locale = lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-GB";
  const orderBy = h.orderBy.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "numeric",
  });

  return (
    <div className="border-b border-gold/20 bg-gradient-to-r from-gold/15 via-gold/5 to-gold/15 print:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-xs text-ivory sm:px-6 sm:text-sm">
        <Gift className="size-4 shrink-0 text-gold-2" />
        <p className="min-w-0 flex-1">
          <span className="font-semibold text-gold-2">
            {t("holidayDaysLeft")
              .replace("{n}", String(h.daysLeft))
              .replace("{holiday}", tl(category.label))}
          </span>
          {" · "}
          {h.daysToOrder === 0
            ? t("holidayLastDay")
            : t("holidayOrderBy").replace("{date}", orderBy)}{" "}
          <Link
            to="/c/$slug"
            params={{ slug: h.slug }}
            className="whitespace-nowrap font-semibold text-gold-2 underline-offset-4 hover:underline"
          >
            {t("holidayShop")}
          </Link>
        </p>
        <button
          type="button"
          onClick={close}
          aria-label={t("close")}
          className="grid size-7 shrink-0 place-items-center rounded-full text-ivory/60 transition hover:bg-white/10 hover:text-ivory"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
