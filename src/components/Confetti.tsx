import { useEffect, useState } from "react";

const COLORS = ["#d4af37", "#f3d98b", "#b8860b", "#fff4cf", "#e8c766"];

type Piece = { left: number; size: number; color: string; style: Record<string, string>; round: boolean };

// A short burst of gold confetti that falls once and removes itself.
export function Confetti({ count = 70 }: { count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  // Random values only in the browser, so the server render stays stable.
  useEffect(() => {
    setPieces(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: 6 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        round: Math.random() < 0.3,
        style: {
          "--delay": `${Math.random() * 0.8}s`,
          "--fall": `${2.4 + Math.random() * 1.8}s`,
          "--drift": `${(Math.random() - 0.5) * 160}px`,
          "--spin": `${(Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540)}deg`,
        },
      })),
    );
    const timer = setTimeout(() => setPieces([]), 5000);
    return () => clearTimeout(timer);
  }, [count]);

  if (!pieces.length) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden print:hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`absolute top-0 animate-confetti ${p.round ? "rounded-full" : "rounded-[2px]"}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            background: p.color,
            ...p.style,
          }}
        />
      ))}
    </div>
  );
}
