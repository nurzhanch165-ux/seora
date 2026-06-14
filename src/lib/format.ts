import { site } from "@/data/site";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat(site.locale, {
    maximumFractionDigits: 0,
  }).format(value) + " " + site.currency;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(site.locale, { maximumFractionDigits: 0 }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(site.locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString(site.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
