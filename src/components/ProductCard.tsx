"use client";

import Link from "next/link";
import { Product } from "@/data/products";
import { brandName } from "@/data/brands";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/lib/useHydrated";
import { ProductVisual } from "./ProductVisual";
import * as I from "./icons";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const toggle = useWishlist((s) => s.toggle);
  const ids = useWishlist((s) => s.ids);
  const hydrated = useHydrated();
  const liked = hydrated && ids.includes(product.id);
  const discount =
    product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <div className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-xl2 border border-line">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          <ProductVisual
            tone={product.tone}
            glyph={product.glyph}
            brand={brandName(product.brandSlug)}
            image={product.images?.[0]}
            className="aspect-[4/5] w-full transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
          />
        </Link>

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.tags.includes("new") && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper">
              Новинка
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-sale px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              −{discount}%
            </span>
          )}
          {product.tags.includes("hit") && !product.tags.includes("new") && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Хит
            </span>
          )}
        </div>

        <button
          onClick={() => toggle(product.id)}
          aria-label="В избранное"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-soft transition-colors hover:text-accent"
        >
          {liked ? <I.HeartFilled size={18} className="text-accent" /> : <I.Heart size={18} />}
        </button>

        {/* quick add */}
        <button
          onClick={() => add(product.id, product.slug)}
          className="absolute inset-x-3 bottom-3 hidden translate-y-3 rounded-full bg-ink py-2.5 text-xs font-medium text-paper opacity-0 transition-all duration-300 ease-smooth hover:bg-accent group-hover:translate-y-0 group-hover:opacity-100 lg:block"
        >
          Добавить в корзину
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <span className="text-[11px] uppercase tracking-wider text-faint">{brandName(product.brandSlug)}</span>
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 text-sm leading-snug text-ink hover:text-accent">
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
          <I.StarFilled size={13} className="text-accent" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-faint">· {product.reviews}</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-base font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-sm text-faint line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
