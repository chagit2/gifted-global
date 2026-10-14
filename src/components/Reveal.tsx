import type { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

// A block that eases into view as it scrolls in. Don't wrap popups
// (position: fixed) in it: the slide uses a transform while it plays.
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal<HTMLDivElement>(delay);
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

// Section heading ornament: a gold line with a small diamond.
export function Ornament({ center = false, className = "" }: { center?: boolean; className?: string }) {
  return (
    <span aria-hidden className={`ornament ${center ? "ornament-center" : ""} ${className}`}>
      <i />
    </span>
  );
}
