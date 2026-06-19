import type { CurrencyCode } from "./currency";
import { convertFromKrw, formatCurrency } from "./currency";

export function formatPrice(value: number, currency: CurrencyCode = "KRW"): string {
  return formatCurrency(value, currency);
}

export function formatPriceKrw(krw: number, displayCurrency: CurrencyCode = "KRW"): string {
  const { total } = convertFromKrw(krw, displayCurrency);
  return formatCurrency(total, displayCurrency);
}

export function formatNumber(value: number, locale = "ru-RU"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

export function formatDate(iso: string, locale = "ru-RU"): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso: string, locale = "ru-RU"): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
