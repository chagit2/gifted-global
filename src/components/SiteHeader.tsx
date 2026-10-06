import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Globe, ShoppingBag, Home, ChevronDown } from "lucide-react";
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
  "grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-ivory hover:text-gold-2 transition sm:size-10";

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
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 whitespace-nowrap text-sm text-ivory/60 hover:text-ivory transition-colors"
      >
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
      <button
        aria-label="Language"
        onClick={() => setOpen((o) => !o)}
        className={iconBtn}
      >
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

export function SiteHeader() {
  const { t, tl } = useI18n();
  const { count } = useCart();

  const holidays = categories.filter((c) => c.group === "holidays").map((c) => ({ slug: c.slug, label: tl(c.label) }));

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-2/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        {/* Start side (right in Hebrew): home icon, then the menu labels */}
        <Link to="/about" aria-label={t("navAbout")} className={iconBtn}>
          <Home className="size-5" />
        </Link>
        <Dropdown label={t("navHolidays")} items={holidays} />
        <Link to="/c/$slug" params={{ slug: "judaica" }} className={navLink}>{t("navJudaica")}</Link>
        <Link to="/c/$slug" params={{ slug: "for-boy" }} className={navLink}>{t("navForBoy")}</Link>
        <Link to="/c/$slug" params={{ slug: "for-girl" }} className={navLink}>{t("navForGirl")}</Link>

        {/* End side (left in Hebrew): language menu, then cart */}
        <div className="ms-auto flex items-center gap-2">
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
