import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Official lists of Israeli localities and streets (Population and Immigration Authority),
// published on the government open-data portal.
const API = "https://data.gov.il/api/3/action/datastore_search";
const CITIES_RESOURCE = "5c78e9fa-c2e2-4771-93ff-7f400a12f7ba";
const STREETS_RESOURCE = "9ad3862c-8391-4b2f-84a4-2d4c68625f4b";

export type City = { code: number; he: string; en: string };
export type Street = { code: number; name: string };

type Row = Record<string, string | number>;

async function fetchRows(resource: string, filters?: Record<string, number>): Promise<Row[]> {
  const params = new URLSearchParams({ resource_id: resource, limit: "32000" });
  if (filters) params.set("filters", JSON.stringify(filters));
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

// The lists change rarely; keep them in memory for a day.
const DAY = 24 * 60 * 60 * 1000;
let citiesCache: { at: number; data: City[] } | null = null;
const streetsCache = new Map<number, { at: number; data: Street[] }>();

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

export const getStreets = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ cityCode: z.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }): Promise<Street[]> => {
    const hit = streetsCache.get(data.cityCode);
    if (hit && Date.now() - hit.at < DAY) return hit.data;
    const rows = await fetchRows(STREETS_RESOURCE, { סמל_ישוב: data.cityCode });
    const seen = new Set<string>();
    const streets = rows
      .map((r) => ({ code: Number(r["סמל_רחוב"]), name: clean(r["שם_רחוב"]) }))
      .filter((s) => s.name && !seen.has(s.name) && seen.add(s.name))
      .sort((a, b) => a.name.localeCompare(b.name, "he"));
    streetsCache.set(data.cityCode, { at: Date.now(), data: streets });
    return streets;
  });
