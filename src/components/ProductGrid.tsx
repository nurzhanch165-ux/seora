"use client";

import { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, streamClosed }: { products: Product[]; streamClosed?: boolean }) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} streamClosed={streamClosed} />
      ))}
    </div>
  );
}
