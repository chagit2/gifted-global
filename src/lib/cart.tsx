import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useProducts, validChoice, choiceLabels, type Choice, type Product } from "./products";
import { BOX_ID, BOX_NAME, boxKey, boxPrice, parseBoxItems, type BoxItem } from "./box";
import type { L } from "./i18n";

// One personal letter per gift copy: letters.length always equals qty.
// `choice` holds one value index per gift option (e.g. silver or gold); the
// same gift with different choices gets separate lines.
// A box the customer designed has productId BOX_ID and its items in `items`.
export type CartLine = {
  productId: string;
  choice: number[];
  qty: number;
  letters: string[];
  items?: BoxItem[];
};

// Identifies a line: the gift plus what was chosen for it, or the box's contents.
export const lineKey = (l: { productId: string; choice: number[]; items?: BoxItem[] }) =>
  l.items
    ? boxKey(l.items)
    : l.choice.length
      ? `${l.productId}|${l.choice.join(",")}`
      : l.productId;

const resize = (letters: string[], qty: number) =>
  letters.length >= qty
    ? letters.slice(0, qty)
    : [...letters, ...Array(qty - letters.length).fill("")];

// Carts saved before per-copy letters had a single `letter` field.
const normalize = (l: CartLine & { letter?: string }): CartLine => ({
  productId: l.productId,
  choice: Array.isArray(l.choice) ? l.choice : [],
  qty: l.qty,
  letters: resize(Array.isArray(l.letters) ? l.letters : [l.letter ?? ""], l.qty),
  ...(l.productId === BOX_ID && { items: parseBoxItems(l.items) }),
});

// Adds `extra` copies (one letter each) to the line with the same key, or a new line.
const merge = (lines: CartLine[], line: CartLine) => {
  const key = lineKey(line);
  const i = lines.findIndex((l) => lineKey(l) === key);
  if (i === -1) return [...lines, line];
  const next = [...lines];
  const l = next[i]!;
  next[i] = { ...l, qty: l.qty + line.qty, letters: [...l.letters, ...line.letters] };
  return next;
};

type CartCtx = {
  lines: CartLine[];
  add: (p: Product, choice?: number[], letter?: string) => void;
  // Adds several gifts at once, one letter per copy ("order again").
  addMany: (
    items: { productId: string; choice: number[]; letters: string[]; items?: BoxItem[] }[],
  ) => void;
  // A box the customer designed; `replace` is the key of the box being edited.
  addBox: (items: BoxItem[], replace?: string) => void;
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
  const {
    getProduct,
    hasActive,
    isLoading: productsLoading,
    isError: productsError,
  } = useProducts();

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
  // Also drops lines whose choice no longer fits the gift's options, and the
  // same for the items inside a designed box (an emptied box goes too).
  useEffect(() => {
    if (!loaded || productsLoading || productsError || !hasActive) return;
    const fits = (id: string, choice: number[], kind: Product["kind"]) => {
      const p = getProduct(id);
      return !!p && p.kind === kind && validChoice(p, choice);
    };
    setLines((prev) => {
      let changed = false;
      const kept: CartLine[] = [];
      for (const l of prev) {
        if (!l.items) {
          if (fits(l.productId, l.choice, "bundle")) kept.push(l);
          else changed = true;
          continue;
        }
        const items = l.items.filter((i) => fits(i.productId, i.choice, "item"));
        if (items.length !== l.items.length) changed = true;
        if (items.length) kept.push(items.length === l.items.length ? l : { ...l, items });
      }
      return changed || kept.length !== prev.length ? kept : prev;
    });
  }, [loaded, productsLoading, productsError, hasActive, getProduct]);

  const value = useMemo<CartCtx>(() => {
    const unit = (l: CartLine) =>
      l.items ? boxPrice(l.items, getProduct) : (getProduct(l.productId)?.price ?? 0);
    const total = lines.reduce((sum, l) => sum + unit(l) * l.qty, 0);
    return {
      lines,
      total,
      drawerOpen,
      setDrawerOpen,
      count: lines.reduce((s, l) => s + l.qty, 0),
      add: (p, choice = [], letter = "") =>
        setLines((prev) => merge(prev, { productId: p.id, choice, qty: 1, letters: [letter] })),
      addMany: (items) =>
        setLines((prev) =>
          items.reduce(
            (next, it) =>
              merge(next, {
                productId: it.productId,
                choice: it.choice,
                qty: it.letters.length,
                letters: it.letters,
                ...(it.items && { items: it.items }),
              }),
            prev,
          ),
        ),
      addBox: (items, replace) =>
        setLines((prev) => {
          const old = replace ? prev.find((l) => lineKey(l) === replace) : undefined;
          const rest = old ? prev.filter((l) => l !== old) : prev;
          // Editing a box keeps its copies and letters.
          const box: CartLine = {
            productId: BOX_ID,
            choice: [],
            qty: old?.qty ?? 1,
            letters: old?.letters ?? [""],
            items,
          };
          if (!old) return merge(rest, box);
          // Put the edited box back where it was, unless it now matches another one.
          const key = lineKey(box);
          if (rest.some((l) => lineKey(l) === key)) return merge(rest, box);
          const at = prev.indexOf(old);
          return [...rest.slice(0, at), box, ...rest.slice(at)];
        }),
      remove: (key) => setLines((prev) => prev.filter((l) => lineKey(l) !== key)),
      setQty: (key, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => lineKey(l) !== key)
            : prev.map((l) =>
                lineKey(l) === key ? { ...l, qty, letters: resize(l.letters, qty) } : l,
              ),
        ),
      setLetter: (key, index, letter) =>
        setLines((prev) =>
          prev.map((l) =>
            lineKey(l) === key
              ? { ...l, letters: l.letters.map((x, i) => (i === index ? letter : x)) }
              : l,
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

// Everything the cart, drawer and checkout show for a line, whether it is a
// ready-made box or one the customer designed.
export type LineView = {
  line: CartLine;
  key: string;
  name: L;
  subtitle?: L;
  // Photos for the thumbnail: one for a ready-made box, the items' for a designed one.
  images: string[];
  unitPrice: number;
  choice: Choice;
  // For the letter ideas.
  categories: string[];
  inStock: boolean;
  // A designed box: what is inside.
  contents?: { product: Product; choice: Choice; qty: number }[];
};

export function useLineViews(): LineView[] {
  const { lines } = useCart();
  const { getProduct } = useProducts();
  return useMemo(
    () =>
      lines.flatMap((line): LineView[] => {
        const key = lineKey(line);
        if (line.items) {
          const contents = line.items.flatMap((i) => {
            const product = getProduct(i.productId);
            return product
              ? [{ product, choice: choiceLabels(product, i.choice), qty: i.qty }]
              : [];
          });
          if (!contents.length) return [];
          return [
            {
              line,
              key,
              name: BOX_NAME,
              images: contents.map((c) => c.product.images[0]).filter((x): x is string => !!x),
              unitPrice: boxPrice(line.items, getProduct),
              choice: [],
              categories: [...new Set(contents.flatMap((c) => c.product.categories))],
              inStock: contents.every((c) => c.product.inStock),
              contents,
            },
          ];
        }
        const p = getProduct(line.productId);
        if (!p) return [];
        return [
          {
            line,
            key,
            name: p.name,
            subtitle: p.subtitle,
            images: p.images.slice(0, 1),
            unitPrice: p.price,
            choice: choiceLabels(p, line.choice),
            categories: p.categories,
            inStock: p.inStock,
          },
        ];
      }),
    [lines, getProduct],
  );
}
