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

  // "12 days left until Hanukkah", with the one-day and same-day wording.
  const daysTitle = (n: number, holiday: string) =>
    (n <= 0 ? t("holidayToday") : n === 1 ? t("holidayOneDay") : t("holidayDaysTitle"))
      .replace("{n}", String(n))
      .replace("{holiday}", holiday);

  const locale = lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-GB";
  const orderBy = h.orderBy.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "numeric",
  });

  return (
    <div data-quiet className="relative border-b border-gold/30 bg-gradient-to-r from-gold/15 via-pearl-2 to-gold/15 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-12 py-3 text-center text-navy">
        <p className="inline-flex items-center gap-2 font-heb text-base font-semibold text-gold-deep sm:text-lg">
          <Gift className="size-5 shrink-0" />
          {daysTitle(
            Math.floor((holidayStart(h.date).getTime() - Date.now()) / 86400000),
            tl(category.label),
          )}
        </p>
        <Countdown to={holidayStart(h.date)} />
        <p className="text-xs text-navy/75 sm:text-sm">
          {h.daysToOrder === 0
            ? t("holidayLastDay")
            : t("holidayOrderBy").replace("{date}", orderBy)}{" "}
          <Link
            to="/c/$slug"
            params={{ slug: h.slug }}
            className="whitespace-nowrap font-semibold text-gold-deep underline-offset-4 hover:underline"
          >
            {t("holidayShop")}
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={close}
        aria-label={t("close")}
        className="absolute top-2 end-2 grid size-9 place-items-center rounded-full text-navy/70 transition hover:bg-navy/5 hover:text-navy"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

// Holidays begin at sundown the evening before; 16:30 is a close, safe guess
// for the Israeli winter and still early enough in summer.
const holidayStart = (day: Date) => new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, 16, 30);

// Days, hours, minutes and seconds left, ticking every second. Screen readers
// get the day count once instead of a number that changes every second.
function Countdown({ to }: { to: Date }) {
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const left = Math.max(0, to.getTime() - now);
  const parts = [
    [Math.floor(left / 86400000), t("cdDays")],
    [Math.floor(left / 3600000) % 24, t("cdHours")],
    [Math.floor(left / 60000) % 60, t("cdMinutes")],
    [Math.floor(left / 1000) % 60, t("cdSeconds")],
  ] as const;
  return (
    <div className="flex items-start justify-center gap-2 sm:gap-3">
      <span className="sr-only">
        {t("cdDaysLeft").replace("{n}", String(parts[0][0]))}
      </span>
      {parts.map(([value, label], i) => (
        <div key={i} aria-hidden className="flex items-start gap-2 sm:gap-3">
          {i > 0 && <span className="pt-1.5 font-heb text-xl text-gold-deep/60 sm:text-2xl">:</span>}
          <div className="flex w-14 flex-col items-center rounded-xl bg-navy px-2 py-1.5 shadow-md shadow-navy/20 sm:w-16">
            <span className="font-heb text-xl font-bold tabular-nums text-pearl sm:text-2xl" dir="ltr">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-gold-2 sm:text-[11px]">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
