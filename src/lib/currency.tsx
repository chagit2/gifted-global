import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getRates } from "./rates.functions";
import { formatPrice, useI18n, type Lang } from "./i18n";

// Prices are kept in shekels; euros and dollars are converted at the day's rate.
export const CURRENCIES = [
  { code: "ILS", symbol: "₪" },
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
] as const;
export type Currency = (typeof CURRENCIES)[number]["code"];

const isCurrency = (v: unknown): v is Currency => CURRENCIES.some((c) => c.code === v);

const locale = (lang: Lang) => (lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-US");

// Shekels converted to the currency, rounded to cents.
export const convert = (ils: number, rate: number) => Math.round((ils / rate) * 100) / 100;

export function formatMoney(amount: number, currency: Currency, lang: Lang) {
  if (currency === "ILS") return formatPrice(amount, lang);
  return new Intl.NumberFormat(locale(lang), {
    style: "currency",
    currency,
    // Whole amounts without decimals, others always with two (93.90, not 93.9).
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  // Shekels per unit of the chosen currency (1 for shekels); null while unknown.
  rate: number | null;
  rateDate: string;
  rateSource: "boi" | "ecb" | null;
  // A shekel amount shown in the chosen currency (in shekels until rates load).
  money: (ils: number) => string;
};

const CurrencyCtx = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const [currency, setState] = useState<Currency>("ILS");
  const { data: rates } = useQuery({
    queryKey: ["rates"],
    queryFn: () => getRates(),
    staleTime: 60 * 60 * 1000,
    enabled: currency !== "ILS",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("currency");
      if (isCurrency(saved)) setState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setState(c);
    try {
      localStorage.setItem("currency", c);
    } catch {
      /* ignore */
    }
  };

  const rate = currency === "ILS" ? 1 : (rates?.[currency] ?? null);
  const money = (ils: number) =>
    rate === null ? formatPrice(ils, lang) : formatMoney(convert(ils, rate), currency, lang);

  return (
    <CurrencyCtx.Provider
      value={{
        currency,
        setCurrency,
        rate,
        rateDate: rates?.date ?? "",
        rateSource: rates?.source ?? null,
        money,
      }}
    >
      {children}
    </CurrencyCtx.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyCtx);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
