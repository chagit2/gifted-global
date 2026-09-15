import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { categories } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatPrice, LANGS, useI18n } from "@/lib/i18n";

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { slug: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="text-ivory/60 hover:text-ivory transition-colors">
        {label} <span className="text-gold-2/70">▾</span>
      </button>
      {open && (
        <ul className="absolute top-full z-50 mt-2 w-52 rounded-2xl border border-white/10 bg-navy-2/95 p-2 backdrop-blur-xl shadow-2xl shadow-black/40 start-0">
          {items.map((i) => (
            <li key={i.slug}>
              <Link
                to="/c/$slug"
                params={{ slug: i.slug }}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm text-ivory/70 hover:bg-white/5 hover:text-gold-2 transition-colors"
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function SiteHeader() {
  const { t, tl, lang, setLang } = useI18n();
  const { count, total } = useCart();

  const holidays = categories
    .filter((c) => c.group === "holidays")
    .map((c) => ({ slug: c.slug, label: tl(c.label) }));
  const birthdays = categories
    .filter((c) => c.group === "birthday")
    .map((c) => ({ slug: c.slug, label: tl(c.label) }));

  const linkClass = "text-ivory/60 hover:text-ivory transition-colors";

  return (
    <header>
      <div className="border-b border-white/5 bg-navy-2/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-[11px] tracking-wide text-ivory/60">
          <span>{t("tagline")}</span>
          <div className="flex items-center gap-1">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={
                  l.code === lang
                    ? "rounded-full bg-gold/10 px-2.5 py-1 font-semibold text-gold-2"
                    : "rounded-full px-2.5 py-1 text-ivory/50 hover:text-ivory transition-colors"
                }
              >
                {l.label}
              </button>
            ))}
            <span className="mx-2 h-4 w-px bg-white/10" />
            <span>
              <span className="text-gold-2">{t("cart")}</span> · {count} {t("items")} ·{" "}
              {formatPrice(total, lang)}
            </span>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-40 border-b border-white/5 bg-navy-2/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-gold font-display text-xl font-bold text-navy">
              מ
            </span>
            <span>
              <span className="block font-heb text-xl leading-none text-ivory">
                {t("brandName")}
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.35em] text-gold-2">
                Matanot
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-7 text-sm text-ivory/80 lg:flex">
            <li>
              <Link to="/" className={linkClass} activeProps={{ className: "text-ivory font-semibold" }} activeOptions={{ exact: true }}>
                {t("navHome")}
              </Link>
            </li>
            <Dropdown label={t("navHolidays")} items={holidays} />
            <li>
              <Link to="/c/$slug" params={{ slug: "shabbat" }} className={linkClass}>
                {t("navShabbat")}
              </Link>
            </li>
            <Dropdown label={t("navBirthday")} items={birthdays} />
            <li>
              <Link to="/c/$slug" params={{ slug: "baby" }} className={linkClass}>
                {t("navBaby")}
              </Link>
            </li>
            <li>
              <Link to="/c/$slug" params={{ slug: "bar-mitzvah" }} className={linkClass}>
                {t("navBar")}
              </Link>
            </li>
            <li>
              <Link to="/c/$slug" params={{ slug: "bat-mitzvah" }} className={linkClass}>
                {t("navBat")}
              </Link>
            </li>
            <li>
              <Link to="/about" className={linkClass}>
                {t("navAbout")}
              </Link>
            </li>
          </ul>

          <Link
            to="/cart"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-ivory backdrop-blur transition hover:bg-white/10"
          >
            {t("cart")} {count > 0 && <span className="text-gold-2">({count})</span>}
          </Link>
        </div>
      </nav>
    </header>
  );
}
