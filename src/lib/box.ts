import type { L } from "./i18n";
import { isL, parseChoice, type Choice, type Product } from "./products";

// "Design your own box": the customer picks single items (products of kind
// "item") and how many of each; we pack them together as one gift with one
// letter. In the cart and on the order the whole box is one line.

// Stands in for a product id on cart and order lines that hold a designed box.
export const BOX_ID = "custom-box";

export const BOX_NAME: L = {
  he: "מארז בעיצוב אישי",
  fr: "Coffret sur mesure",
  en: "Custom gift box",
};

// Until the setting is saved in the admin area.
export const DEFAULT_BOX_MIN_ITEMS = 3;

// One item in a box: which item, which options (one value index each), how many.
export type BoxItem = { productId: string; choice: number[]; qty: number };

export const boxItemKey = (i: { productId: string; choice: number[] }) =>
  i.choice.length ? `${i.productId}|${i.choice.join(",")}` : i.productId;

// Identical boxes share a key, so adding the same box twice raises its quantity.
export const boxKey = (items: BoxItem[]) =>
  `${BOX_ID}|${items
    .map((i) => `${boxItemKey(i)}*${i.qty}`)
    .sort()
    .join(";")}`;

export const boxCount = (items: BoxItem[]) => items.reduce((n, i) => n + i.qty, 0);

export const boxPrice = (items: BoxItem[], getProduct: (id: string) => Product | undefined) =>
  items.reduce((sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty, 0);

// Box items as saved in a cart in this browser; anything malformed is dropped.
export const parseBoxItems = (raw: unknown): BoxItem[] =>
  Array.isArray(raw)
    ? raw
        .filter(
          (i) =>
            i &&
            typeof i.productId === "string" &&
            Array.isArray(i.choice) &&
            Number.isInteger(i.qty) &&
            i.qty > 0,
        )
        .map((i) => ({ productId: i.productId, choice: i.choice, qty: i.qty }))
    : [];

// What went into a box, as stored on the order (names and choices copied, so
// the order still reads correctly after the items are edited).
export type BoxContent = {
  productId: string;
  name: L;
  choice: Choice;
  qty: number;
  unitPrice: number;
};

export const parseContents = (raw: unknown): BoxContent[] =>
  Array.isArray(raw)
    ? raw
        .filter((c) => c && typeof c.productId === "string" && isL(c.name) && Number(c.qty) > 0)
        .map((c) => ({
          productId: c.productId,
          name: c.name,
          choice: parseChoice(c.choice),
          qty: Number(c.qty),
          unitPrice: Number(c.unitPrice) || 0,
        }))
    : [];

// The box being designed is kept in this browser, so items can be added from
// any page (a category page, say) and the box picked up on the custom box page.
export const BOX_DRAFT = "boxDraft";
export const BOX_DRAFT_EVENT = "boxdraftchange";

export const readBoxDraft = (): BoxItem[] => {
  try {
    return parseBoxItems(JSON.parse(localStorage.getItem(BOX_DRAFT) ?? "[]"));
  } catch {
    return [];
  }
};

// Puts one more of an item (with its chosen options) in the saved box.
export const addToBoxDraft = (productId: string, choice: number[]) => {
  const draft = readBoxDraft();
  const key = boxItemKey({ productId, choice });
  const found = draft.find((i) => boxItemKey(i) === key);
  const next = found
    ? draft.map((i) => (i === found ? { ...i, qty: Math.min(i.qty + 1, 99) } : i))
    : [...draft, { productId, choice, qty: 1 }];
  try {
    localStorage.setItem(BOX_DRAFT, JSON.stringify(next));
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new Event(BOX_DRAFT_EVENT));
};
