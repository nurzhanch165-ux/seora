"use client";

import { useEffect } from "react";
import { useExchangeRates } from "@/store/exchangeRates";

export function ExchangeRatesLoader() {
  const load = useExchangeRates((s) => s.load);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) void load();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const id = window.setTimeout(run, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [load]);

  return null;
}
