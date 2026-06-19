export type CurrencyCode = "KRW" | "KZT" | "USD" | "EUR";

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string; locale: string }[] = [
  { code: "KRW", symbol: "₩", label: "Воны (KRW)", locale: "ko-KR" },
  { code: "KZT", symbol: "₸", label: "Тенге (KZT)", locale: "kk-KZ" },
  { code: "USD", symbol: "$", label: "Доллары (USD)", locale: "en-US" },
  { code: "EUR", symbol: "€", label: "Евро (EUR)", locale: "de-DE" },
];

/** Базовые курсы: 1 KRW → валюта (обновляются вручную / через API позже) */
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  KRW: 1,
  KZT: 0.38,   // ~1 KRW ≈ 0.38 KZT
  USD: 0.00074,
  EUR: 0.00068,
};

export const CONVERSION_FEE = 0.03; // +3% комиссия

export function convertFromKrw(amountKrw: number, to: CurrencyCode) {
  const rate = EXCHANGE_RATES[to];
  const base = amountKrw * rate;
  if (to === "KRW") {
    return { base, fee: 0, total: base, rate: 1 };
  }
  const fee = base * CONVERSION_FEE;
  return { base, fee, total: base + fee, rate };
}

export function formatCurrency(value: number, code: CurrencyCode): string {
  const cur = CURRENCIES.find((c) => c.code === code)!;
  const formatted = new Intl.NumberFormat(cur.locale, {
    maximumFractionDigits: code === "KRW" || code === "KZT" ? 0 : 2,
  }).format(value);
  return `${formatted} ${cur.symbol}`;
}

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}
