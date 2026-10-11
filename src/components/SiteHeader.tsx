import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Globe, ShoppingBag, Home, ChevronDown, User } from "lucide-react";
import { categories } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { LANGS, useI18n } from "@/lib/i18n";
import { CURRENCIES, useCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth";

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
  "rounded-2xl border border-white/10 bg-navy-2/95 p-2 backdrop-blur-xl shadow-2xl shadow-black/40";
const itemCls =
  "block w-full whitespace-nowrap rounded-xl px-3 py-2 text-start text-sm text-ivory/70 hover:bg-white/5 hover:text-gold-2 transition-colors";

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
  // Mouse hover opens the menu; leaving closes it after a short grace period so the
  // pointer can travel to the items. Touch users toggle it with a tap instead.
  const hovering = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        hovering.current = true;
        clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        hovering.current = false;
        closeTimer.current = setTimeout(() => setOpen(false), 250);
      }}
    >
      <button
        aria-expanded={open}
        onClick={() => setOpen((o) => (hovering.current ? true : !o))}
        className="flex items-center gap-1 whitespace-nowrap text-sm text-ivory/60 hover:text-ivory transition-colors"
      >
        {label} <ChevronDown className="size-3.5 text-gold-2/70" />
      </button>
      {open && (
        // pt-2 (not a margin) keeps the gap under the label inside the hover area.
        <div className="absolute top-full start-0 z-50 pt-2">
          <ul className={`${panel} w-max`}>
            {items.map((i) => (
              <li key={i.slug}>
                <Link to="/c/$slug" params={{ slug: i.slug }} onClick={() => setOpen(false)} className={itemCls}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
        <ul className={`${panel} absolute top-full end-0 z-50 mt-2 w-max`}>
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

function CurrencyMenu() {
  const { t } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const symbol = CURRENCIES.find((c) => c.code === currency)!.symbol;
  return (
    <div ref={ref} className="relative">
      <button
        aria-label={t("currency")}
        title={t("currency")}
        onClick={() => setOpen((o) => !o)}
        className={`${iconBtn} text-base font-semibold`}
      >
        {symbol}
      </button>
      {open && (
        <ul className={`${panel} absolute top-full end-0 z-50 mt-2 w-max`}>
          {CURRENCIES.map((c) => (
            <li key={c.code}>
              <button
                onClick={() => {
                  setCurrency(c.code);
                  setOpen(false);
                }}
                className={`${itemCls} ${c.code === currency ? "text-gold-2 font-semibold" : ""}`}
              >
                <span className="inline-block w-5">{c.symbol}</span> {t(`currency_${c.code}`)}
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
  const { user } = useAuth();

  const holidays = categories.filter((c) => c.group === "holidays").map((c) => ({ slug: c.slug, label: tl(c.label) }));

  return (
    <header className="sticky top-0 z-50 print:hidden border-b border-white/5 bg-navy-2/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:flex-nowrap sm:gap-6 sm:px-6">
        {/* Start side (right in Hebrew): home icon, then the menu labels.
            On phones the labels drop to their own centered row under the icons. */}
        <Link to="/" aria-label={t("navHome")} className={iconBtn}>
          <Home className="size-5" />
        </Link>
        <div className="order-last flex w-full items-center justify-center gap-5 sm:order-none sm:w-auto sm:justify-start sm:gap-6">
          <Dropdown label={t("navHolidays")} items={holidays} />
          <Link to="/c/$slug" params={{ slug: "judaica" }} className={navLink}>{t("navJudaica")}</Link>
          <Link to="/c/$slug" params={{ slug: "for-boy" }} className={navLink}>{t("navForBoy")}</Link>
          <Link to="/c/$slug" params={{ slug: "for-girl" }} className={navLink}>{t("navForGirl")}</Link>
          <Link to="/about" className={navLink}>{t("navAbout")}</Link>
        </div>

        {/* End side (left in Hebrew): language menu, then cart */}
        <div className="ms-auto flex items-center gap-2">
          <LangMenu />
          <CurrencyMenu />
          <Link to={user ? "/account" : "/login"} aria-label={t("account")} className={`relative ${iconBtn}`}>
            <User className="size-5" />
            {user && <span className="absolute -top-0.5 -end-0.5 size-2.5 rounded-full bg-gold" />}
          </Link>
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
