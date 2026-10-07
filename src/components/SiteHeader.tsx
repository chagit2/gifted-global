import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Globe, ShoppingBag, Menu, ChevronDown } from "lucide-react";
import { categories } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { LANGS, useI18n } from "@/lib/i18n";

function useClickOutside(onOut: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onOut]);
  return ref;
}

const panel =
  "absolute top-full z-50 mt-2 rounded-2xl border border-white/10 bg-navy-2/95 p-2 backdrop-blur-xl shadow-2xl shadow-black/40";
const itemCls =
  "block w-full rounded-xl px-3 py-2 text-start text-sm text-ivory/70 hover:bg-white/5 hover:text-gold-2 transition-colors";
const navLink = "whitespace-nowrap text-sm text-ivory/60 hover:text-ivory transition-colors";
const iconBtn =
  "grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-ivory hover:text-gold-2 transition";

function Dropdown({
  label,
  items,
  className = "",
}: {
  label: string;
  items: { slug: string; label: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button onClick={() => setOpen((o) => !o)} className={`flex items-center gap-1 ${navLink}`}>
        {label} <ChevronDown className="size-3.5 text-gold-2/70" />
      </button>
      {open && (
        <ul className={`${panel} start-0 mt-0 w-52`}>
          {items.map((i) => (
            <li key={i.slug}>
              <Link to="/c/$slug" params={{ slug: i.slug }} onClick={() => setOpen(false)} className={itemCls}>
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LangMenu() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button aria-label="Language" onClick={() => setOpen((o) => !o)} className={iconBtn}>
        <Globe className="size-5" />
      </button>
      {open && (
        <ul className={`${panel} end-0 w-40`}>
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`${itemCls} ${l.code === lang ? "text-gold-2 font-semibold" : ""}`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MobileGifts({ links }: { links: { label: string; slug?: string; to?: "/about" }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div ref={ref} className="relative lg:hidden">
      <button aria-label="Menu" onClick={() => setOpen((o) => !o)} className={iconBtn}>
        <Menu className="size-5" />
      </button>
      {open && (
        <ul className={`${panel} start-0 max-h-[70vh] w-60 overflow-y-auto`}>
          {links.map((l) => (
            <li key={l.label}>
              {l.slug ? (
                <Link to="/c/$slug" params={{ slug: l.slug }} onClick={() => setOpen(false)} className={itemCls}>
                  {l.label}
                </Link>
              ) : (
                <Link to={l.to ?? "/"} onClick={() => setOpen(false)} className={itemCls}>
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SiteHeader() {
  const { t, tl } = useI18n();
  const { count } = useCart();

  const holidays = categories.filter((c) => c.group === "holidays").map((c) => ({ slug: c.slug, label: tl(c.label) }));
  const birthdays = categories.filter((c) => c.group === "birthday").map((c) => ({ slug: c.slug, label: tl(c.label) }));

  const mobileLinks = [
    { slug: "shabbat", label: t("navShabbat") },
    ...birthdays,
    { slug: "baby", label: t("navBaby") },
    { slug: "bar-mitzvah", label: t("navBar") },
    { slug: "bat-mitzvah", label: t("navBat") },
    { to: "/about" as const, label: t("navAbout") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-2/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Start side (right in Hebrew): logo, then the always-visible holidays menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2" aria-label={t("brandName")}>
            <span className="grid size-9 place-items-center rounded-full bg-gold font-display text-lg font-bold text-navy">מ</span>
            <span className="hidden font-heb text-lg leading-none text-ivory sm:block">{t("brandName")}</span>
          </Link>
          <Dropdown label={t("navHolidays")} items={holidays} />
          <MobileGifts links={mobileLinks} />
        </div>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 text-sm lg:flex">
          <li><Link to="/c/$slug" params={{ slug: "shabbat" }} className={navLink}>{t("navShabbat")}</Link></li>
          <Dropdown label={t("navBirthday")} items={birthdays} />
          <li><Link to="/c/$slug" params={{ slug: "baby" }} className={navLink}>{t("navBaby")}</Link></li>
          <li><Link to="/c/$slug" params={{ slug: "bar-mitzvah" }} className={navLink}>{t("navBar")}</Link></li>
          <li><Link to="/c/$slug" params={{ slug: "bat-mitzvah" }} className={navLink}>{t("navBat")}</Link></li>
          <li><Link to="/about" className={navLink}>{t("navAbout")}</Link></li>
        </ul>

        {/* End side (left in Hebrew): language icon right next to the cart */}
        <div className="flex shrink-0 items-center gap-2">
          <LangMenu />
          <Link to="/cart" aria-label={t("cart")} className={`relative ${iconBtn}`}>
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -top-1 -end-1 grid size-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-navy">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
