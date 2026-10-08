import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { L } from "./i18n";

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
  sort: number;
};

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
  sort: r.sort,
});

export const toRow = (p: Omit<Product, "id" | "category">) => ({
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
