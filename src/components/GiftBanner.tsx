import { useEffect, useState } from "react";
import { bannerSlides } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";

const INTERVAL_MS = 4000;

export function GiftBanner() {
  const { tl } = useI18n();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % bannerSlides.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      aria-roledescription="carousel"
      className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-gold/30 shadow-2xl shadow-navy/20 sm:aspect-[21/9]">
        {bannerSlides.map((s, i) => (
          <div
            key={s.key}
            aria-hidden={i !== active}
            className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
          >
            {/* The showing photo drifts closer, very slowly. */}
            <img
              src={s.img}
              alt={tl(s.name)}
              className={`size-full object-cover ease-out motion-safe:transition-transform motion-safe:duration-[6000ms] ${i === active ? "scale-105" : "scale-100"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
            <div
              className={`absolute inset-x-0 bottom-0 p-6 pb-10 transition-all delay-200 duration-700 sm:p-10 ${i === active ? "translate-y-0 opacity-100" : "motion-safe:translate-y-3 opacity-0"}`}
            >
              <h2 className="font-heb text-2xl font-bold text-ivory sm:text-4xl">{tl(s.name)}</h2>
              <p className="mt-1 text-sm text-gold-2 sm:text-base">{tl(s.subtitle)}</p>
            </div>
          </div>
        ))}

        {/* Each dot sits in a larger invisible tap area. */}
        <div className="absolute bottom-2 end-4 flex sm:end-8 sm:bottom-4">
          {bannerSlides.map((s, i) => (
            <button
              key={s.key}
              aria-label={`${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className="group grid h-8 min-w-5 place-items-center rounded-full px-1"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-gold" : "w-2 bg-ivory/40 group-hover:bg-ivory/70"}`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
