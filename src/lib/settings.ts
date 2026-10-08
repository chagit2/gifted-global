import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SHIPPING_FEE } from "./orders";

export const SETTINGS_KEY = ["site_settings"] as const;

// Site-wide settings edited in the admin area; falls back to defaults until loaded.
export function useSettings() {
  const q = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: async () => {
      // "*" so a column that isn't in the database yet can't break the query.
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return {
        shippingFee: data ? Number(data.shipping_fee) : SHIPPING_FEE,
        letterBackgrounds: data?.letter_backgrounds ?? [],
      };
    },
    staleTime: 5 * 60 * 1000,
  });
  return {
    shippingFee: q.data?.shippingFee ?? SHIPPING_FEE,
    letterBackgrounds: q.data?.letterBackgrounds ?? [],
    isLoading: q.isLoading,
  };
}
