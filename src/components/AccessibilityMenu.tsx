import { Link } from "@tanstack/react-router";
import { Accessibility, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n, type Key } from "@/lib/i18n";

// Visitor accessibility settings, applied as classes on <html> (see styles.css)
// and remembered in this browser.
const OPTIONS = [
  { id: "contrast", key: "a11yContrast" },
  { id: "links", key: "a11yLinks" },
  { id: "readable", key: "a11yReadable" },
  { id: "no-motion", key: "a11yNoMotion" },
] as const satisfies readonly { id: string; key: Key }[];
type OptionId = (typeof OPTIONS)[number]["id"];
const SIZES = [100, 112, 125, 140] as const;
const STORE = "a11ySettings";

type Settings = { size: number; on: OptionId[] };

const apply = ({ size, on }: Settings) => {
  const html = document.documentElement;
  html.style.fontSize = size === 100 ? "" : `${size}%`;
  for (const o of OPTIONS) html.classList.toggle(`a11y-${o.id}`, on.includes(o.id));
};

export function AccessibilityMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({ size: 100, on: [] });
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "null") as Settings | null;
      if (saved && SIZES.includes(saved.size as (typeof SIZES)[number])) {
        setSettings(saved);
        apply(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const update = (next: Settings) => {
    setSettings(next);
    apply(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  // Escape or a click outside closes the panel.
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const sizeIndex = SIZES.indexOf(settings.size as (typeof SIZES)[number]);
  const toggle = (id: OptionId) =>
    update({
      ...settings,
      on: settings.on.includes(id) ? settings.on.filter((x) => x !== id) : [...settings.on, id],
    });

  const optionCls = (active: boolean) =>
    `flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-start text-sm transition ${
      active ? "border-gold bg-gold/15 font-semibold text-navy" : "border-navy/15 text-navy hover:border-gold/60"
    }`;

  return (
    <div className="print:hidden">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label={t("a11yMenu")}
        title={t("a11yMenu")}
        className="fixed right-4 bottom-4 z-[66] grid size-14 place-items-center rounded-full border-2 border-gold bg-navy text-pearl shadow-xl shadow-navy/30 transition hover:scale-105 hover:bg-navy-3"
      >
        <Accessibility className="size-7" />
      </button>

      {open && (
        <div
          ref={panel}
          id="a11y-panel"
          role="dialog"
          aria-label={t("a11yMenu")}
          className="fixed right-4 bottom-20 z-[66] w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-gold/40 bg-white p-4 text-navy shadow-2xl shadow-navy/20"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heb text-lg font-bold">{t("a11yMenu")}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="grid size-9 place-items-center rounded-full text-navy/70 hover:bg-navy/5"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="mb-1 text-xs text-navy/70">{t("a11yTextSize")}</p>
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => update({ ...settings, size: SIZES[Math.max(0, sizeIndex - 1)]! })}
              disabled={sizeIndex <= 0}
              aria-label={t("a11ySmaller")}
              className="grid size-11 place-items-center rounded-xl border border-navy/15 text-sm font-bold disabled:opacity-40"
            >
              א-
            </button>
            <span className="flex-1 text-center text-sm tabular-nums" aria-live="polite">
              {settings.size}%
            </span>
            <button
              type="button"
              onClick={() =>
                update({ ...settings, size: SIZES[Math.min(SIZES.length - 1, sizeIndex + 1)]! })
              }
              disabled={sizeIndex >= SIZES.length - 1}
              aria-label={t("a11yBigger")}
              className="grid size-11 place-items-center rounded-xl border border-navy/15 text-lg font-bold disabled:opacity-40"
            >
              א+
            </button>
          </div>

          <div className="space-y-2">
            {OPTIONS.map((o) => {
              const active = settings.on.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  role="switch"
                  aria-checked={active}
                  onClick={() => toggle(o.id)}
                  className={optionCls(active)}
                >
                  {t(o.key)}
                  <span
                    aria-hidden
                    className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition ${active ? "bg-gold" : "bg-navy/20"}`}
                  >
                    <span
                      className={`block size-4 rounded-full bg-white shadow transition ${
                        active ? "translate-x-4 rtl:-translate-x-4" : ""
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-navy/10 pt-3 text-xs">
            <button
              type="button"
              onClick={() => update({ size: 100, on: [] })}
              className="rounded-full border border-navy/15 px-3 py-2 text-navy hover:border-gold"
            >
              {t("a11yReset")}
            </button>
            <Link
              to="/accessibility"
              onClick={() => setOpen(false)}
              className="text-gold-deep underline-offset-4 hover:underline"
            >
              {t("a11yTitle")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
