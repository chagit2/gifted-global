import { useEffect, useRef } from "react";

// Eases an element up into view the first time it scrolls in (see `.reveal`
// in styles.css). Elements already on screen at mount are left alone, so
// nothing flickers and nothing stays hidden if scripts never run.
export function useReveal<T extends HTMLElement>(delayMs = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset["reveal"] = "armed";
    if (delayMs) el.style.setProperty("--reveal-delay", `${delayMs}ms`);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset["reveal"] = "shown";
        io.disconnect();
      },
      // The huge top margin counts anything already scrolled past as seen,
      // so a jump to the bottom (End key, restored position) hides nothing.
      { rootMargin: "100000px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delayMs]);

  return ref;
}
