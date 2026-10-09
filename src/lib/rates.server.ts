// Exchange rates for showing prices in euros and dollars: the Bank of Israel's
// representative rate (שער יציג), with the European Central Bank as a fallback.
// Values are shekels per one unit of the foreign currency.
export type Rates = { EUR: number; USD: number; date: string; source: "boi" | "ecb" };

const CACHE_MS = 3 * 60 * 60 * 1000;
let cache: { at: number; rates: Rates } | null = null;

const valid = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;

async function fromBankOfIsrael(): Promise<Rates | null> {
  const res = await fetch("https://boi.org.il/PublicApi/GetExchangeRates", {
    headers: { accept: "application/json" },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    exchangeRates?: {
      key: string;
      currentExchangeRate: number;
      unit?: number;
      lastUpdate?: string;
    }[];
  };
  const pick = (key: string) => body.exchangeRates?.find((r) => r.key === key);
  const eur = pick("EUR");
  const usd = pick("USD");
  if (!eur || !usd) return null;
  const EUR = eur.currentExchangeRate / (eur.unit || 1);
  const USD = usd.currentExchangeRate / (usd.unit || 1);
  if (!valid(EUR) || !valid(USD)) return null;
  return { EUR, USD, date: (usd.lastUpdate ?? "").slice(0, 10), source: "boi" };
}

async function fromEcb(): Promise<Rates | null> {
  const res = await fetch("https://api.frankfurter.app/latest?from=ILS&to=EUR,USD");
  if (!res.ok) return null;
  const body = (await res.json()) as { date?: string; rates?: { EUR?: number; USD?: number } };
  const eur = body.rates?.EUR;
  const usd = body.rates?.USD;
  if (!valid(eur) || !valid(usd)) return null;
  return { EUR: 1 / eur, USD: 1 / usd, date: body.date ?? "", source: "ecb" };
}

export async function fetchRates(): Promise<Rates | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.rates;
  for (const source of [fromBankOfIsrael, fromEcb]) {
    try {
      const rates = await source();
      if (rates) {
        cache = { at: Date.now(), rates };
        return rates;
      }
    } catch {
      /* try the next source */
    }
  }
  // Both down: keep using the last known rates rather than none.
  return cache?.rates ?? null;
}
