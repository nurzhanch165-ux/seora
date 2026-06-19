"use client";

import { useMemo } from "react";
import { useCatalogProducts } from "@/store/catalog";
import { CatalogView } from "./CatalogView";
import { useT } from "@/hooks/useTranslation";

export function BrandProducts({ brandSlug }: { brandSlug: string }) {
  const all = useCatalogProducts();
  const tr = useT();
  const brandProducts = useMemo(
    () => all.filter((p) => p.brandSlug === brandSlug),
    [all, brandSlug]
  );

  if (brandProducts.length === 0) {
    return <div className="card py-20 text-center text-muted">{tr("brands.comingSoon")}</div>;
  }
  return <CatalogView products={brandProducts} />;
}
