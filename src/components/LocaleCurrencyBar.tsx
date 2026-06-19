"use client";

import { usePreferences } from "@/store/preferences";
import { convertFromKrw, formatCurrency, CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { LOCALES, type Locale } from "@/lib/i18n";
import { useExchangeRates } from "@/store/exchangeRates";
import { useT } from "@/hooks/useTranslation";

export function LocaleCurrencyBar({ compact, light }: { compact?: boolean; light?: boolean }) {
  const tr = useT();
  const locale = usePreferences((s) => s.locale);
  const currency = usePreferences((s) => s.currency);
  const setLocale = usePreferences((s) => s.setLocale);
  const setCurrency = usePreferences((s) => s.setCurrency);

  const selectClass = light
    ? "scheme-light rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-pearl outline-none focus:border-accent [&>option]:bg-surface [&>option]:text-ink sm:px-3 sm:text-xs"
    : "rounded-full border border-line bg-surface px-2.5 py-1.5 text-[11px] font-medium text-ink outline-none focus:border-accent sm:px-3 sm:text-xs";

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "gap-3"}`}>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className={selectClass}
        aria-label={tr("common.language")}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
        ))}
      </select>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className={selectClass}
        aria-label={tr("common.currency")}
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
        ))}
      </select>
    </div>
  );
}

export function useDisplayPrice(krwPrice: number): string {
  const currency = usePreferences((s) => s.currency);
  const rates = useExchangeRates((s) => s.rates);
  const { total } = convertFromKrw(krwPrice, currency, rates);
  return formatCurrency(total, currency);
}
