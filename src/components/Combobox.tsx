import { useMemo, useRef, useState } from "react";

export type ComboOption = { key: string; label: string; search?: string };

// Ignore quotes, geresh/gershayim, hyphens and case so "תל אביב" matches "תל אביב - יפו".
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/["'`׳״\-–()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const MAX_SHOWN = 60;

// A text field that only accepts a value picked from its list.
export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  invalid,
  invalidText,
  emptyText,
  className,
}: {
  options: ComboOption[];
  value: string | null;
  onChange: (key: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  invalidText: string;
  emptyText: string;
  className: string;
}) {
  const selected = options.find((o) => o.key === value) ?? null;
  const [text, setText] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [hi, setHi] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const matches = useMemo(() => {
    const q = norm(text);
    if (!q) return options.slice(0, MAX_SHOWN);
    const starts: ComboOption[] = [];
    const contains: ComboOption[] = [];
    for (const o of options) {
      const hay = norm(`${o.label} ${o.search ?? ""}`);
      if (hay.startsWith(q)) starts.push(o);
      else if (hay.includes(q)) contains.push(o);
      if (starts.length >= MAX_SHOWN) break;
    }
    return [...starts, ...contains].slice(0, MAX_SHOWN);
  }, [options, text]);

  const pick = (o: ComboOption) => {
    setText(o.label);
    onChange(o.key);
    setOpen(false);
  };

  const showInvalid = !open && !selected && (invalid || (touched && text.trim() !== ""));

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-invalid={showInvalid}
        autoComplete="off"
        disabled={disabled}
        value={text}
        placeholder={placeholder}
        className={`${className} ${showInvalid ? "border-red-300/70" : ""} disabled:opacity-50`}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setText(e.target.value);
          setHi(0);
          setOpen(true);
          if (value !== null) onChange(null);
        }}
        onBlur={() => {
          setOpen(false);
          setTouched(true);
          // Accept an exact match typed in full without clicking it.
          if (!selected) {
            const exact = options.find((o) => norm(o.label) === norm(text));
            if (exact) pick(exact);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setHi((i) => {
              const n =
                e.key === "ArrowDown" ? Math.min(i + 1, matches.length - 1) : Math.max(i - 1, 0);
              listRef.current?.children[n]?.scrollIntoView({ block: "nearest" });
              return n;
            });
          } else if (e.key === "Enter" && open && matches[hi]) {
            e.preventDefault();
            pick(matches[hi]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && !disabled && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-navy-2/95 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ivory/50">{emptyText}</li>
          ) : (
            matches.map((o, i) => (
              <li
                key={o.key}
                role="option"
                aria-selected={o.key === value}
                // mousedown (not click) so the choice lands before the input blurs
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o);
                }}
                onMouseEnter={() => setHi(i)}
                className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${
                  i === hi ? "bg-white/10 text-gold-2" : "text-ivory/80"
                }`}
              >
                {o.label}
              </li>
            ))
          )}
        </ul>
      )}
      {showInvalid && <p className="mt-1 text-xs text-red-300">{invalidText}</p>}
    </div>
  );
}
