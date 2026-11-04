import { useI18n } from "@/lib/i18n";
import type { Choice } from "@/lib/products";

// What was chosen for a gift: "Colour: [photo] gold · Size: large".
export function ChoiceView({ choice, className = "" }: { choice: Choice; className?: string }) {
  const { tl } = useI18n();
  if (choice.length === 0) return null;
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      {choice.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {tl(c.name)}:
          {c.value.image && (
            <img
              src={c.value.image}
              alt={tl(c.value)}
              className="size-9 rounded-md object-cover outline-1 -outline-offset-1 outline-navy/15"
            />
          )}
          {tl(c.value)}
        </span>
      ))}
    </span>
  );
}
