"use client";

import { useEffect } from "react";
import { useExchangeRates } from "@/store/exchangeRates";

export function ExchangeRatesLoader() {
  const load = useExchangeRates((s) => s.load);
  useEffect(() => {
    load();
  }, [load]);
  return null;
}
