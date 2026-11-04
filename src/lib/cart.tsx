import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useProducts, validChoice, type Product } from "./products";

// One personal letter per gift copy: letters.length always equals qty.
// `choice` holds one value index per gift option (e.g. silver or gold); the
// same gift with different choices gets separate lines.
export type CartLine = { productId: string; choice: number[]; qty: number; letters: string[] };

// Identifies a line: the gift plus what was chosen for it.
export const lineKey = (l: { productId: string; choice: number[] }) =>
  l.choice.length ? `${l.productId}|${l.choice.join(",")}` : l.productId;

const resize = (letters: string[], qty: number) =>
  letters.length >= qty ? letters.slice(0, qty) : [...letters, ...Array(qty - letters.length).fill("")];

// Carts saved before per-copy letters had a single `letter` field.
const normalize = (l: CartLine & { letter?: string }): CartLine => ({
  productId: l.productId,
  choice: Array.isArray(l.choice) ? l.choice : [],
  qty: l.qty,
  letters: resize(Array.isArray(l.letters) ? l.letters : [l.letter ?? ""], l.qty),
});

type CartCtx = {
  lines: CartLine[];
  add: (p: Product, choice?: number[], letter?: string) => void;
  // Adds several gifts at once, one letter per copy ("order again").
  addMany: (items: { productId: string; choice: number[]; letters: string[] }[]) => void;
  // These take the line's key (see lineKey).
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  setLetter: (key: string, index: number, letter: string) => void;
  clear: () => void;
  // Side panel that slides in after "add to cart".
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Don't write the cart back until the saved one has been read, or the empty
  // first render would overwrite it.
  const [loaded, setLoaded] = useState(false);
  const { getProduct, live, isLoading: productsLoading, isError: productsError } = useProducts();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setLines(JSON.parse(raw).map(normalize));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("cart", JSON.stringify(lines));
    } catch {
      /* storage blocked: the cart lives for this page only */
    }
  }, [lines, loaded]);

  // Drop gifts that are no longer on the site (deleted, hidden or renamed ids),
  // so an "empty" cart can't still carry hidden lines and a shipping charge.
  // Also drops lines whose choice no longer fits the gift's options.
  useEffect(() => {
    if (!loaded || productsLoading || productsError || live.length === 0) return;
    setLines((prev) => {
      const kept = prev.filter((l) => {
        const p = getProduct(l.productId);
        return p && validChoice(p, l.choice);
      });
      return kept.length === prev.length ? prev : kept;
    });
  }, [loaded, productsLoading, productsError, live, getProduct]);

  const value = useMemo<CartCtx>(() => {
    const total = lines.reduce((sum, l) => sum + (getProduct(l.productId)?.price ?? 0) * l.qty, 0);
    return {
      lines,
      total,
      drawerOpen,
      setDrawerOpen,
      count: lines.reduce((s, l) => s + l.qty, 0),
      add: (p, choice = [], letter = "") =>
        setLines((prev) => {
          const key = lineKey({ productId: p.id, choice });
          const found = prev.find((l) => lineKey(l) === key);
          if (found)
            return prev.map((l) =>
              lineKey(l) === key ? { ...l, qty: l.qty + 1, letters: [...l.letters, letter] } : l,
            );
          return [...prev, { productId: p.id, choice, qty: 1, letters: [letter] }];
        }),
      addMany: (items) =>
        setLines((prev) => {
          const next = [...prev];
          for (const it of items) {
            const i = next.findIndex((l) => lineKey(l) === lineKey(it));
            if (i === -1)
              next.push({ productId: it.productId, choice: it.choice, qty: it.letters.length, letters: it.letters });
            else {
              const l = next[i]!;
              next[i] = { ...l, qty: l.qty + it.letters.length, letters: [...l.letters, ...it.letters] };
            }
          }
          return next;
        }),
      remove: (key) => setLines((prev) => prev.filter((l) => lineKey(l) !== key)),
      setQty: (key, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => lineKey(l) !== key)
            : prev.map((l) => (lineKey(l) === key ? { ...l, qty, letters: resize(l.letters, qty) } : l)),
        ),
      setLetter: (key, index, letter) =>
        setLines((prev) =>
          prev.map((l) =>
            lineKey(l) === key ? { ...l, letters: l.letters.map((x, i) => (i === index ? letter : x)) } : l,
          ),
        ),
      clear: () => setLines([]),
    };
  }, [lines, getProduct, drawerOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
