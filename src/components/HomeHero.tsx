import { Clock, Gift, PenLine, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { motionOff } from "@/lib/motion";
import { useI18n, type Key } from "@/lib/i18n";

const WORDS: Key[] = ["heroWord1", "heroWord2", "heroWord3", "heroWord4", "heroWord5", "heroWord6"];
const INTERVAL_MS = 2600;

// Home headline whose last words roll through the occasions. Screen readers
// get the whole sentence once (sr-only); the rolling copy is hidden from them.
export function HomeHero() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => !motionOff() && setActive((i) => (i + 1) % WORDS.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused]);

  const prev = (active - 1 + WORDS.length) % WORDS.length;

  return (
    <section
      className="relative mx-auto max-w-7xl px-4 pt-10 text-center sm:px-6 sm:pt-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h1 className="font-heb text-3xl font-bold leading-tight text-navy sm:text-5xl">
        <span className="sr-only">
          {t("heroLine")} {WORDS.map((w) => t(w)).join(", ")}
        </span>
        <span aria-hidden>
          <span className="block">{t("heroLine")}</span>
          {/* All words share one grid cell, so the line keeps the widest
              word's width and nothing around it jumps. */}
          <span className="mt-1 inline-grid overflow-hidden pb-1 text-gold-deep">
            {WORDS.map((w, i) => (
              <span
                key={w}
                className={`roll-word col-start-1 row-start-1 ${
                  i === active
                    ? "translate-y-0 opacity-100"
                    : i === prev
                      ? "-translate-y-full opacity-0"
                      : "translate-y-full opacity-0"
                }`}
              >
                {t(w)}
              </span>
            ))}
          </span>
        </span>
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-navy/70 sm:text-base">{t("heroSub")}</p>
    </section>
  );
}

const PERKS = [
  { icon: PenLine, key: "perkLetter" },
  { icon: Gift, key: "perkWrap" },
  { icon: Truck, key: "perkHome" },
  { icon: Clock, key: "perkDays" },
] as const;

// A slow ribbon of what every order includes. The doubled copy (for the
// seamless loop) is hidden from screen readers and from reduced motion.
export function PerksTicker() {
  const { t } = useI18n();
  const row = (dup: boolean) => (
    <ul
      aria-hidden={dup || undefined}
      className={`flex shrink-0 items-center ${dup ? "marquee-dup" : ""}`}
    >
      {PERKS.map(({ icon: Icon, key }) => (
        <li key={key} className="flex items-center gap-2 whitespace-nowrap px-6 py-3 text-sm text-navy">
          <Icon className="size-4 shrink-0 text-gold-deep" aria-hidden />
          {t(key)}
          <span aria-hidden className="ms-6 size-1.5 rotate-45 bg-gold" />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={t("perksLabel")} className="marquee relative mt-6 overflow-hidden border-y border-gold/40 bg-pearl-2/80">
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
        {row(true)}
        {row(true)}
      </div>
    </section>
  );
}
