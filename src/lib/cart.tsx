import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "./catalog";

export type CartLine = { productId: string; qty: number; letter: string };

type CartCtx = {
  lines: CartLine[];
  add: (p: Product, letter?: string) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  setLetter: (productId: string, letter: string) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartCtx>(() => {
    const total = lines.reduce((sum, l) => sum + (getProduct(l.productId)?.price ?? 0) * l.qty, 0);
    return {
      lines,
      total,
      count: lines.reduce((s, l) => s + l.qty, 0),
      add: (p, letter = "") =>
        setLines((prev) => {
          const found = prev.find((l) => l.productId === p.id);
          if (found)
            return prev.map((l) =>
              l.productId === p.id ? { ...l, qty: l.qty + 1, letter: letter || l.letter } : l,
            );
          return [...prev, { productId: p.id, qty: 1, letter }];
        }),
      remove: (id) => setLines((prev) => prev.filter((l) => l.productId !== id)),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.productId !== id)
            : prev.map((l) => (l.productId === id ? { ...l, qty } : l)),
        ),
      setLetter: (id, letter) =>
        setLines((prev) => prev.map((l) => (l.productId === id ? { ...l, letter } : l))),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
