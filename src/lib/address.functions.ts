import { createServerFn } from "@tanstack/react-start";

// Official list of Israeli localities (Population and Immigration Authority),
// published on the government open-data portal.
const API = "https://data.gov.il/api/3/action/datastore_search";
const CITIES_RESOURCE = "5c78e9fa-c2e2-4771-93ff-7f400a12f7ba";

export type City = { code: number; he: string; en: string };

type Row = Record<string, string | number>;

async function fetchRows(resource: string): Promise<Row[]> {
  const params = new URLSearchParams({ resource_id: resource, limit: "32000" });
  const res = await fetch(`${API}?${params}`);
  if (!res.ok) throw new Error(`data.gov.il ${res.status}`);
  const json = (await res.json()) as { success: boolean; result: { records: Row[] } };
  if (!json.success) throw new Error("data.gov.il request failed");
  return json.result.records;
}

const clean = (v: unknown) =>
  String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();

// The list changes rarely; keep it in memory for a day.
const DAY = 24 * 60 * 60 * 1000;
let citiesCache: { at: number; data: City[] } | null = null;

export const getCities = createServerFn({ method: "GET" }).handler(async (): Promise<City[]> => {
  if (citiesCache && Date.now() - citiesCache.at < DAY) return citiesCache.data;
  const rows = await fetchRows(CITIES_RESOURCE);
  const data = rows
    .map((r) => ({
      code: Number(r["סמל_ישוב"]),
      he: clean(r["שם_ישוב"]),
      en: clean(r["שם_ישוב_לועזי"]),
    }))
    .filter((c) => c.code > 0 && c.he)
    .sort((a, b) => a.he.localeCompare(b.he, "he"));
  citiesCache = { at: Date.now(), data };
  return data;
});
