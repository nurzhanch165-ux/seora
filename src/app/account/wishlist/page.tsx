"use client";

import Link from "next/link";
import { useWishlist } from "@/store/wishlist";
import { useCatalogProducts } from "@/store/catalog";
import { AccountShell } from "@/components/AccountShell";
import { ProductGrid } from "@/components/ProductGrid";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const products = useCatalogProducts();
  const liked = products.filter((p) => ids.includes(p.id));
  const tr = useT();

  return (
    <AccountShell title={tr("account.wishlist")}>
      {liked.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <I.Heart size={26} />
          </span>
          <p className="text-lg font-medium">{tr("account.wishlist.empty")}</p>
          <p className="max-w-sm text-sm text-muted">{tr("account.wishlist.emptyHint")}</p>
          <Link href="/c/cosmetics" className="btn-primary">{tr("common.toCatalog")}</Link>
        </div>
      ) : (
        <ProductGrid products={liked} />
      )}
    </AccountShell>
  );
}
