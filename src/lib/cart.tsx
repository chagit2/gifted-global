import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "./catalog";

// One personal letter per gift copy: letters.length always equals qty.
export type CartLine = { productId: string; qty: number; letters: string[] };

const resize = (letters: string[], qty: number) =>
  letters.length >= qty ? letters.slice(0, qty) : [...letters, ...Array(qty - letters.length).fill("")];

// Carts saved before per-copy letters had a single `letter` field.
const normalize = (l: CartLine & { letter?: string }): CartLine => ({
  productId: l.productId,
  qty: l.qty,
  letters: resize(Array.isArray(l.letters) ? l.letters : [l.letter ?? ""], l.qty),
});

type CartCtx = {
  lines: CartLine[];
  add: (p: Product, letter?: string) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  setLetter: (productId: string, index: number, letter: string) => void;
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
      if (raw) setLines(JSON.parse(raw).map(normalize));
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
              l.productId === p.id ? { ...l, qty: l.qty + 1, letters: [...l.letters, letter] } : l,
            );
          return [...prev, { productId: p.id, qty: 1, letters: [letter] }];
        }),
      remove: (id) => setLines((prev) => prev.filter((l) => l.productId !== id)),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.productId !== id)
            : prev.map((l) => (l.productId === id ? { ...l, qty, letters: resize(l.letters, qty) } : l)),
        ),
      setLetter: (id, index, letter) =>
        setLines((prev) =>
          prev.map((l) =>
            l.productId === id ? { ...l, letters: l.letters.map((x, i) => (i === index ? letter : x)) } : l,
          ),
        ),
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
