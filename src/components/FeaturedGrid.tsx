"use client";

import { useMemo } from "react";
import { useCatalogProducts } from "@/store/catalog";
import { ProductGrid } from "./ProductGrid";

type Kind = "hit" | "new" | "sale";

export function FeaturedGrid({ kind, limit = 4 }: { kind: Kind; limit?: number }) {
  const all = useCatalogProducts();

  const list = useMemo(() => {
    const filtered = all.filter((p) =>
      kind === "sale" ? p.tags.includes("sale") || !!p.oldPrice : p.tags.includes(kind)
    );
    return filtered.slice(0, limit);
  }, [all, kind, limit]);

  if (list.length === 0) {
    return <p className="text-sm text-muted">Скоро здесь появятся товары.</p>;
  }

  return <ProductGrid products={list} />;
}
