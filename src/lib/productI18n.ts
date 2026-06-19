import type { Product } from "@/data/products";
import type { Locale } from "@/lib/i18n";
import type { ProductI18n, ProductLocaleFields } from "@/lib/translate.server";

const FIELD_MAP: [keyof ProductLocaleFields, keyof Product][] = [
  ["name", "name"],
  ["shortDescription", "shortDescription"],
  ["fullDescription", "fullDescription"],
  ["usage", "usage"],
  ["result", "result"],
  ["howToUse", "howToUse"],
  ["volume", "volume"],
  ["weight", "weight"],
  ["shelfLife", "shelfLife"],
  ["monthsSupply", "monthsSupply"],
  ["country", "country"],
  ["manufacturer", "manufacturer"],
];

export function localizedProduct(product: Product, locale: Locale): Product {
  if (locale === "ru" || !product.i18n) return product;
  const loc = product.i18n[locale];
  if (!loc) return product;

  const next = { ...product };
  for (const [i18nKey, productKey] of FIELD_MAP) {
    const val = loc[i18nKey];
    if (val?.trim()) (next as Record<string, unknown>)[productKey] = val;
  }
  return next;
}

export function productFieldsFromProduct(p: Product): ProductLocaleFields {
  return {
    name: p.name,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    usage: p.usage,
    result: p.result,
    howToUse: p.howToUse,
    volume: p.volume,
    weight: p.weight,
    shelfLife: p.shelfLife,
    monthsSupply: p.monthsSupply,
    country: p.country,
    manufacturer: p.manufacturer,
  };
}

export type { ProductI18n };
