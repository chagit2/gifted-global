import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SHIPPING_FEE } from "./orders";

// Contact details (db/contact.sql); empty until filled in the admin area.
export type Contact = { email: string; phone: string; accessibilityCoordinator: string };
const EMPTY_CONTACT: Contact = { email: "", phone: "", accessibilityCoordinator: "" };

const readContact = (row: Record<string, unknown> | null): Contact => {
  const str = (k: string) => (typeof row?.[k] === "string" ? (row[k] as string).trim() : "");
  return {
    email: str("contact_email"),
    phone: str("contact_phone"),
    accessibilityCoordinator: str("accessibility_coordinator"),
  };
};

// Digits for wa.me links: an Israeli 05x number becomes 9725x.
export const whatsappNumber = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? `972${d.slice(1)}` : d;
};

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
        contact: readContact(data),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
  return {
    shippingFee: q.data?.shippingFee ?? SHIPPING_FEE,
    letterBackgrounds: q.data?.letterBackgrounds ?? [],
    contact: q.data?.contact ?? EMPTY_CONTACT,
    isLoading: q.isLoading,
  };
}
