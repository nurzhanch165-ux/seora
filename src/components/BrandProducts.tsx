"use client";

import { useMemo } from "react";
import { useCatalogProducts } from "@/store/catalog";
import { CatalogView } from "./CatalogView";

export function BrandProducts({ brandSlug }: { brandSlug: string }) {
  const all = useCatalogProducts();
  const brandProducts = useMemo(
    () => all.filter((p) => p.brandSlug === brandSlug),
    [all, brandSlug]
  );

  if (brandProducts.length === 0) {
    return <div className="card py-20 text-center text-muted">Скоро добавим товары этого бренда.</div>;
  }
  return <CatalogView products={brandProducts} />;
}
