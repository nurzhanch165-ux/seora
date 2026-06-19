"use client";

import { create } from "zustand";
import { EXCHANGE_RATES, type CurrencyCode } from "@/lib/currency";

type ExchangeRatesState = {
  rates: Record<CurrencyCode, number>;
  loaded: boolean;
  load: () => Promise<void>;
};

export const useExchangeRates = create<ExchangeRatesState>()((set, get) => ({
  rates: EXCHANGE_RATES,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const res = await fetch("/api/currency/rates");
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.rates) {
      set({ rates: json.rates, loaded: true });
    } else {
      set({ loaded: true });
    }
  },
}));
