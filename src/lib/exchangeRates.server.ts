import "server-only";
import type { CurrencyCode } from "./currency";
import { EXCHANGE_RATES } from "./currency";

const CACHE_MS = 60 * 60 * 1000;
let cached: { rates: Record<CurrencyCode, number>; at: number } | null = null;

/** KRW → валюта (1 KRW = rate единиц валюты) */
export async function fetchExchangeRates(): Promise<Record<CurrencyCode, number>> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.rates;

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/KRW", { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("rates unavailable");
    const json = await res.json();
    const r = json.conversion_rates as Record<string, number>;

    const rates: Record<CurrencyCode, number> = {
      KRW: 1,
      USD: r.USD ?? EXCHANGE_RATES.USD,
      EUR: r.EUR ?? EXCHANGE_RATES.EUR,
      KZT: r.KZT ?? EXCHANGE_RATES.KZT,
    };

    cached = { rates, at: Date.now() };
    return rates;
  } catch {
    return EXCHANGE_RATES;
  }
}
