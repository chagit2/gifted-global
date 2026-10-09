import { createServerFn } from "@tanstack/react-start";

export const getRates = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchRates } = await import("./rates.server");
  return fetchRates();
});
