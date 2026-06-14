"use client";

import Link from "next/link";
import { useWishlist } from "@/store/wishlist";
import { useCatalogProducts } from "@/store/catalog";
import { AccountShell } from "@/components/AccountShell";
import { ProductGrid } from "@/components/ProductGrid";
import * as I from "@/components/icons";

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const products = useCatalogProducts();
  const liked = products.filter((p) => ids.includes(p.id));

  return (
    <AccountShell title="Избранное">
      {liked.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <I.Heart size={26} />
          </span>
          <p className="text-lg font-medium">В избранном пусто</p>
          <p className="max-w-sm text-sm text-muted">Нажимайте на сердечко у товара, чтобы сохранить его и купить позже.</p>
          <Link href="/c/cosmetics" className="btn-primary">В каталог</Link>
        </div>
      ) : (
        <ProductGrid products={liked} />
      )}
    </AccountShell>
  );
}
