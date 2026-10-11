import { categories } from "./catalog";
import type { L } from "./i18n";
import type { Product } from "./products";

// The "help me choose" quiz: who, what occasion, what budget.
export type Option = { id: string; label: L; cats: string[] };

const holidaySlugs = categories.filter((c) => c.group === "holidays").map((c) => c.slug);

export const whoOptions: Option[] = [
  { id: "boy", label: { he: "לבן / נער", fr: "Un garçon", en: "A boy" }, cats: ["for-boy", "bar-mitzvah", "birthday-child", "birthday-teen"] },
  { id: "girl", label: { he: "לבת / נערה", fr: "Une fille", en: "A girl" }, cats: ["for-girl", "bat-mitzvah", "birthday-child", "birthday-teen"] },
  { id: "baby", label: { he: "לתינוק", fr: "Un bébé", en: "A baby" }, cats: ["baby"] },
  { id: "adult", label: { he: "למבוגר/ת", fr: "Un adulte", en: "An adult" }, cats: ["birthday-adult", "judaica", "shabbat"] },
  { id: "family", label: { he: "לכל המשפחה", fr: "Toute la famille", en: "The whole family" }, cats: ["judaica", "shabbat", ...holidaySlugs] },
  { id: "any", label: { he: "לא משנה", fr: "Peu importe", en: "Doesn't matter" }, cats: [] },
];

export const occasionOptions: Option[] = [
  { id: "holiday", label: { he: "לחג", fr: "Une fête", en: "A holiday" }, cats: holidaySlugs },
  { id: "birthday", label: { he: "ליום הולדת", fr: "Un anniversaire", en: "A birthday" }, cats: ["birthday-child", "birthday-teen", "birthday-adult"] },
  { id: "mitzvah", label: { he: "לבר / בת מצווה", fr: "Bar / Bat Mitsva", en: "Bar / Bat Mitzvah" }, cats: ["bar-mitzvah", "bat-mitzvah"] },
  { id: "birth", label: { he: "להולדת תינוק", fr: "Une naissance", en: "A new baby" }, cats: ["baby"] },
  { id: "shabbat", label: { he: "לשבת", fr: "Chabbat", en: "Shabbat" }, cats: ["shabbat", "judaica"] },
  { id: "just", label: { he: "סתם, כדי לשמח", fr: "Juste pour faire plaisir", en: "Just because" }, cats: [] },
];

export type Budget = { id: string; label: L; min: number; max: number };

export const budgetOptions: Budget[] = [
  { id: "150", label: { he: "עד ₪150", fr: "Jusqu'à 150 ₪", en: "Up to ₪150" }, min: 0, max: 150 },
  { id: "300", label: { he: "₪150–300", fr: "150–300 ₪", en: "₪150–300" }, min: 150, max: 300 },
  { id: "500", label: { he: "₪300–500", fr: "300–500 ₪", en: "₪300–500" }, min: 300, max: 500 },
  { id: "more", label: { he: "מעל ₪500", fr: "Plus de 500 ₪", en: "Over ₪500" }, min: 500, max: Infinity },
  { id: "any", label: { he: "לא משנה", fr: "Peu importe", en: "Doesn't matter" }, min: 0, max: Infinity },
];

export type Answers = { who: Option; occasion: Option; budget: Budget };

// Gifts ranked for the answers. `exact` is false when nothing matched every
// answer and the list shows the closest gifts instead.
export function findGifts(all: Product[], a: Answers, boostCategory?: string) {
  const has = (p: Product, cats: string[]) => p.categories.some((c) => cats.includes(c));
  const score = (p: Product) =>
    (a.who.cats.length && has(p, a.who.cats) ? 2 : 0) +
    (a.occasion.cats.length && has(p, a.occasion.cats) ? 2 : 0) +
    (boostCategory && a.occasion.id === "holiday" && p.categories.includes(boostCategory) ? 1 : 0);
  const wanted = (a.who.cats.length ? 2 : 0) + (a.occasion.cats.length ? 2 : 0);
  const inBudget = (p: Product) => p.price >= a.budget.min && p.price <= a.budget.max;

  const ranked = all
    .filter((p) => p.inStock)
    .map((p) => ({ p, s: score(p) }))
    .sort((x, y) => y.s - x.s || x.p.price - y.p.price);

  const exact = ranked.filter((x) => x.s >= wanted && inBudget(x.p)).map((x) => x.p);
  if (exact.length) return { gifts: exact, exact: true };
  // Closest: in budget and matching something, else matching something at any price.
  const near = ranked.filter((x) => (wanted === 0 || x.s > 0) && inBudget(x.p));
  const fallback = near.length ? near : ranked.filter((x) => x.s > 0);
  return { gifts: (fallback.length ? fallback : ranked).slice(0, 9).map((x) => x.p), exact: false };
}
