import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { L } from "./i18n";

// A choice the customer makes before ordering, e.g. colour: silver / gold.
export type ProductOption = { name: L; values: L[] };

// What was chosen for one copy, as stored on the order (labels, not indexes,
// so the order still reads correctly after the gift's options are edited).
export type Choice = { name: L; value: L }[];

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export type Product = {
  id: string;
  // Primary category (shown on the product card); the first of `categories`.
  category: string;
  // Every category the gift appears in.
  categories: string[];
  name: L;
  subtitle: L;
  description: L;
  price: number;
  images: string[];
  active: boolean;
  // Out-of-stock gifts stay on the site but can't be ordered.
  inStock: boolean;
  options: ProductOption[];
  sort: number;
};

const isL = (v: unknown): v is L =>
  !!v &&
  typeof v === "object" &&
  ["he", "fr", "en"].every((k) => typeof (v as L)[k as keyof L] === "string");

// Options as saved in the database; anything malformed is dropped.
export const parseOptions = (raw: unknown): ProductOption[] =>
  Array.isArray(raw)
    ? raw
        .filter((o) => o && isL(o.name) && Array.isArray(o.values))
        .map((o) => ({ name: o.name as L, values: (o.values as unknown[]).filter(isL) }))
        .filter((o) => o.values.length > 0)
    : [];

export const parseChoice = (raw: unknown): Choice =>
  Array.isArray(raw) ? raw.filter((c) => c && isL(c.name) && isL(c.value)) : [];

// A cart choice (one value index per option) is valid when every option has one.
export const validChoice = (p: Product, choice: number[]) =>
  choice.length === p.options.length &&
  choice.every((v, i) => Number.isInteger(v) && v >= 0 && v < p.options[i]!.values.length);

export const choiceLabels = (p: Product, choice: number[]): Choice =>
  validChoice(p, choice)
    ? p.options.map((o, i) => ({ name: o.name, value: o.values[choice[i]!]! }))
    : [];

// Turns a stored choice back into value indexes for the gift as it is now,
// matching the Hebrew labels; null if the gift's options no longer fit it.
export const matchChoice = (p: Product, choice: Choice): number[] | null => {
  if (choice.length !== p.options.length) return null;
  const picked = p.options.map((o, i) =>
    o.name.he === choice[i]!.name.he ? o.values.findIndex((v) => v.he === choice[i]!.value.he) : -1,
  );
  return picked.every((v) => v >= 0) ? picked : null;
};

// "Colour: gold · Size: large" in the given language.
export const choiceText = (choice: Choice, tl: (l: L) => string) =>
  choice.map((c) => `${tl(c.name)}: ${tl(c.value)}`).join(" · ");

export const fromRow = (r: ProductRow): Product => ({
  id: r.id,
  category: r.category,
  // Rows from before multi-category support only have `category`.
  categories: r.categories?.length ? r.categories : [r.category],
  name: { he: r.name_he, fr: r.name_fr, en: r.name_en },
  subtitle: { he: r.subtitle_he, fr: r.subtitle_fr, en: r.subtitle_en },
  description: { he: r.description_he, fr: r.description_fr, en: r.description_en },
  price: Number(r.price),
  images: r.images ?? [],
  active: r.active,
  inStock: r.in_stock ?? true,
  // Missing until db/product-options.sql has run.
  options: parseOptions(r.options),
  sort: r.sort,
});

// `withOptions` is off for gifts without options so saving keeps working on a
// database where db/product-options.sql hasn't run yet.
export const toRow = (p: Omit<Product, "id" | "category">, withOptions = p.options.length > 0) => ({
  category: p.categories[0]!,
  categories: p.categories,
  name_he: p.name.he,
  name_fr: p.name.fr,
  name_en: p.name.en,
  subtitle_he: p.subtitle.he,
  subtitle_fr: p.subtitle.fr,
  subtitle_en: p.subtitle.en,
  description_he: p.description.he,
  description_fr: p.description.fr,
  description_en: p.description.en,
  price: p.price,
  images: p.images,
  active: p.active,
  in_stock: p.inStock,
  sort: p.sort,
  ...(withOptions && { options: p.options }),
});

export const PRODUCTS_KEY = ["products"] as const;

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(fromRow);
}

// All products the viewer may read: active ones for everyone, plus hidden ones
// for admins. Storefront helpers only ever return active products.
export function useProducts() {
  const q = useQuery({ queryKey: PRODUCTS_KEY, queryFn: fetchProducts, staleTime: 5 * 60 * 1000 });
  const helpers = useMemo(() => {
    const all = q.data ?? [];
    const live = all.filter((p) => p.active);
    const byId = new Map(live.map((p) => [p.id, p]));
    return {
      all,
      live,
      getProduct: (id: string) => byId.get(id),
      byCategory: (slug: string) => live.filter((p) => p.categories.includes(slug)),
    };
  }, [q.data]);
  return { ...helpers, isLoading: q.isLoading, isError: q.isError };
}
