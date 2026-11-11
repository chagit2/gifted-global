import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Globe, ShoppingBag, Home, ChevronDown, User } from "lucide-react";
import { categories } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useProducts } from "@/lib/products";
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
  "rounded-2xl border border-navy/10 bg-white/95 p-2 backdrop-blur-xl shadow-2xl shadow-navy/10";
const itemCls =
  "block w-full whitespace-nowrap rounded-xl px-3 py-2 text-start text-sm text-navy/75 hover:bg-navy/5 hover:text-gold-deep transition-colors";

const navLink =
  "relative whitespace-nowrap py-2 text-sm text-pearl/85 hover:text-gold-2 transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-center after:scale-x-0 after:bg-gold-2 after:transition-transform after:duration-300 hover:after:scale-x-100 [&.active]:text-gold-2 [&.active]:after:scale-x-100";
const iconBtn =
  "grid size-10 shrink-0 place-items-center rounded-full border border-gold/30 bg-white/5 text-pearl hover:border-gold/70 hover:bg-white/10 hover:text-gold-2 active:scale-95 transition";

// A menu entry; subcategories are listed indented under their parent. A
// subcategory holding only single items opens the custom box page filtered to
// it, since those items are bought inside a box.
type MenuItem = {
  slug: string;
  label: string;
  children?: { slug: string; label: string; toBuild: boolean }[];
};

function Dropdown({
  label,
  items,
  className = "",
}: {
  label: string;
  items: MenuItem[];
  className?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  // The parent whose subcategories are unfolded (they start folded).
  const [unfolded, setUnfolded] = useState<string | null>(null);
  const ref = useClickOutside(() => setOpen(false));
  useEffect(() => {
    if (!open) setUnfolded(null);
  }, [open]);
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
        className="flex items-center gap-1 whitespace-nowrap py-2 text-sm text-pearl/85 hover:text-gold-2 transition-colors"
      >
        {label} <ChevronDown className={`size-3.5 text-gold-2/80 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        // pt-2 (not a margin) keeps the gap under the label inside the hover area.
        <div className="absolute top-full start-0 z-50 pt-2 animate-in fade-in-0 slide-in-from-top-1 duration-200 motion-reduce:animate-none">
          <ul className={`${panel} w-max`}>
            {items.map((i) => (
              <li key={i.slug}>
                {i.children && i.children.length > 0 ? (
                  <div className="flex items-center">
                    <Link
                      to="/c/$slug"
                      params={{ slug: i.slug }}
                      onClick={() => setOpen(false)}
                      className={`${itemCls} flex-1`}
                    >
                      {i.label}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={unfolded === i.slug}
                      aria-label={`${i.label}: ${t("subcategories")}`}
                      onClick={() => setUnfolded((u) => (u === i.slug ? null : i.slug))}
                      className="grid size-9 shrink-0 place-items-center rounded-full text-navy/60 transition hover:bg-navy/5 hover:text-gold-deep"
                    >
                      <ChevronDown
                        className={`size-4 transition-transform ${unfolded === i.slug ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                ) : (
                  <Link to="/c/$slug" params={{ slug: i.slug }} onClick={() => setOpen(false)} className={itemCls}>
                    {i.label}
                  </Link>
                )}
                {i.children && i.children.length > 0 && unfolded === i.slug && (
                  <ul className="mb-1 ms-3 border-s border-gold/40 ps-1">
                    {i.children.map((c) => (
                      <li key={c.slug}>
                        {c.toBuild ? (
                          <Link
                            to="/build"
                            search={{ cat: c.slug }}
                            onClick={() => setOpen(false)}
                            className={`${itemCls} py-1.5 text-[13px]`}
                          >
                            {c.label}
                          </Link>
                        ) : (
                          <Link
                            to="/c/$slug"
                            params={{ slug: c.slug }}
                            onClick={() => setOpen(false)}
                            className={`${itemCls} py-1.5 text-[13px]`}
                          >
                            {c.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
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
        <ul className={`${panel} absolute top-full end-0 z-50 mt-2 w-max animate-in fade-in-0 slide-in-from-top-1 duration-200 motion-reduce:animate-none`}>
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`${itemCls} ${l.code === lang ? "text-gold-deep font-semibold" : ""}`}
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
        <ul className={`${panel} absolute top-full end-0 z-50 mt-2 w-max animate-in fade-in-0 slide-in-from-top-1 duration-200 motion-reduce:animate-none`}>
          {CURRENCIES.map((c) => (
            <li key={c.code}>
              <button
                onClick={() => {
                  setCurrency(c.code);
                  setOpen(false);
                }}
                className={`${itemCls} ${c.code === currency ? "text-gold-deep font-semibold" : ""}`}
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

// Bumps whenever the cart count goes up, to replay the hop animation.
function useBumpOnIncrease(count: number) {
  const prev = useRef(count);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (count > prev.current) setBump((b) => b + 1);
    prev.current = count;
  }, [count]);
  return bump;
}

export function SiteHeader() {
  const { t, tl } = useI18n();
  const { count } = useCart();
  const { user } = useAuth();
  const bump = useBumpOnIncrease(count);
  // The custom box link appears once there are items to choose from.
  const { items, byCategory } = useProducts();
  const hasItems = items.length > 0;

  const menuItem = (c: (typeof categories)[number]): MenuItem => ({
    slug: c.slug,
    label: tl(c.label),
    children: categories
      .filter((s) => s.parent === c.slug)
      .map((s) => ({
        slug: s.slug,
        label: tl(s.label),
        toBuild: byCategory(s.slug).length === 0 && items.some((p) => p.categories.includes(s.slug)),
      })),
  });
  const holidays = categories.filter((c) => c.group === "holidays").map(menuItem);
  const shabbat = categories.filter((c) => c.slug === "shabbat").map(menuItem);

  return (
    <header className="sticky top-0 z-50 print:hidden border-b-2 border-gold/60 bg-navy shadow-lg shadow-navy/20">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:flex-nowrap sm:gap-6 sm:px-6">
        {/* Start side (right in Hebrew): home icon, then the menu labels.
            On phones the labels drop to their own centered row under the icons. */}
        <Link to="/" aria-label={t("navHome")} className={iconBtn}>
          <Home className="size-5" />
        </Link>
        <div className="order-last flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-0 sm:order-none sm:w-auto sm:flex-nowrap sm:justify-start sm:gap-6">
          <Link to="/gifts" className={navLink}>{t("navAllGifts")}</Link>
          {hasItems && (
            <Link to="/build" className={navLink}>
              {t("navBuildBox")}
            </Link>
          )}
          <Dropdown label={t("navHolidays")} items={holidays} />
          <Dropdown label={t("navShabbat")} items={shabbat} />
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
            <ShoppingBag key={`bump-${bump}`} className={`size-5 ${bump ? "animate-bump" : ""}`} />
            {count > 0 && (
              <span
                key={`count-${count}`}
                className={`absolute -top-1 -end-1 grid size-5 place-items-center rounded-full bg-gold text-[10px] font-bold text-navy ring-2 ring-navy ${bump ? "animate-pop" : ""}`}
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
