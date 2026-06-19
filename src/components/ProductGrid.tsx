"use client";

import { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { useLocalizedProducts } from "@/hooks/useLocalizedProduct";
import type { StreamContext } from "@/store/cart";

export function ProductGrid({
  products,
  streamClosed,
  streamContext,
}: {
  products: Product[];
  streamClosed?: boolean;
  streamContext?: StreamContext;
}) {
  const localized = useLocalizedProducts(products);

  return (
    <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-4">
      {localized.map((p) => (
        <ProductCard key={p.id} product={p} streamClosed={streamClosed} streamContext={streamContext} />
      ))}
    </div>
  );
}
