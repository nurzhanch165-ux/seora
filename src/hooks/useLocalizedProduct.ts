"use client";

import type { Product } from "@/data/products";
import { localizedProduct } from "@/lib/productI18n";
import { useLocale } from "@/hooks/useTranslation";

export function useLocalizedProduct(product: Product): Product {
  const locale = useLocale();
  return localizedProduct(product, locale);
}

export function useLocalizedProducts(products: Product[]): Product[] {
  const locale = useLocale();
  if (locale === "ru") return products;
  return products.map((p) => localizedProduct(p, locale));
}
