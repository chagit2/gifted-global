import { Package } from "lucide-react";
import { ChoiceView } from "@/components/ChoiceView";
import type { LineView } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

// Thumbnail for a cart line: the gift's photo, or for a designed box up to
// four of its items' photos in a grid. `className` sets the size and rounding.
export function LineThumb({ view, className = "" }: { view: LineView; className?: string }) {
  const { tl } = useI18n();
  const shown = view.images.slice(0, 4);
  if (!view.contents)
    return (
      <img src={shown[0]} alt={tl(view.name)} className={`shrink-0 object-cover ${className}`} />
    );
  return (
    <span
      aria-hidden
      className={`relative grid shrink-0 overflow-hidden bg-gold/10 ${shown.length > 1 ? "grid-cols-2" : ""} ${className}`}
    >
      {shown.map((src, i) => (
        <img key={i} src={src} alt="" className="size-full object-cover" />
      ))}
      <span className="absolute end-1 bottom-1 grid size-6 place-items-center rounded-full bg-navy text-pearl shadow">
        <Package className="size-3.5" />
      </span>
    </span>
  );
}

// "2 × Chocolate · 1 × Candle (gold)" as a short list under a designed box.
export function BoxContents({ view, className = "" }: { view: LineView; className?: string }) {
  const { t, tl } = useI18n();
  if (!view.contents) return null;
  return (
    <div className={className}>
      <p className="font-semibold text-navy/80">{t("boxContents")}:</p>
      <ul className="mt-0.5 space-y-0.5">
        {view.contents.map((c, i) => (
          <li key={i} className="flex flex-wrap items-center gap-x-1.5">
            <span className="tabular-nums text-gold-deep">{c.qty} ×</span>
            {tl(c.product.name)}
            <ChoiceView choice={c.choice} className="text-navy/65" />
          </li>
        ))}
      </ul>
    </div>
  );
}
