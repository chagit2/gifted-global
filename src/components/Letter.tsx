import { Check, ChevronDown, Copy } from "lucide-react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

const MAX = 500;

function ToggleButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="mt-1 inline-flex items-center gap-1 text-xs text-gold-2/80 hover:text-gold-2"
    >
      {open ? t("letterCollapse") : t("letterExpand")}
      <ChevronDown className={`size-3.5 transition ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

// Letter input that shows three lines by default; when the text runs longer,
// a toggle opens the box to its full height and closes it again.
export function LetterField({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = ""; // back to the 3-row height to measure
    const isLong = el.scrollHeight > el.clientHeight + 1;
    setLong(isLong);
    if (open && isLong) el.style.height = `${el.scrollHeight + 2}px`; // + borders
  }, [value, open]);

  return (
    <div>
      <textarea
        ref={ref}
        rows={3}
        maxLength={MAX}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        className={`w-full resize-none rounded-lg border border-white/10 bg-transparent p-3 text-sm text-ivory placeholder:text-ivory/30 focus:border-gold/50 focus:outline-none ${className}`}
      />
      {long && <ToggleButton open={open} onClick={() => setOpen((o) => !o)} />}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers / non-secure contexts: copy through a hidden field.
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={t("copyLetter")}
      title={t("copyLetter")}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] transition ${
        copied ? "text-emerald-300" : "text-ivory/50 hover:bg-white/5 hover:text-gold-2"
      }`}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied && t("copied")}
    </button>
  );
}

// Read-only letter (order history): first three lines, with the same toggle.
// `copyable` adds a copy-to-clipboard button (admin view).
export function LetterPreview({
  label,
  text,
  copyable,
}: {
  label?: ReactNode;
  text: string;
  copyable?: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !open) setLong(el.scrollHeight > el.clientHeight + 1);
  }, [text, open]);

  return (
    <div className="rounded-lg border border-white/10 bg-navy-2/50 px-3 py-2 text-xs text-ivory/70">
      <div className="flex items-start gap-2">
        <p ref={ref} className={`min-w-0 flex-1 whitespace-pre-wrap ${open ? "" : "line-clamp-3"}`}>
          {label}
          {text}
        </p>
        {copyable && <CopyButton text={text} />}
      </div>
      {long && <ToggleButton open={open} onClick={() => setOpen((o) => !o)} />}
    </div>
  );
}
