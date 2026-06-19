"use client";

import Link from "next/link";
import { Product } from "@/data/products";
import { brandName } from "@/data/brands";
import { useCart, type StreamContext } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useCartToast } from "@/store/cartToast";
import { useHydrated } from "@/lib/useHydrated";
import { useT } from "@/hooks/useTranslation";
import { useLocalizedProduct } from "@/hooks/useLocalizedProduct";
import { useDisplayPrice } from "@/components/LocaleCurrencyBar";
import { ProductVisual } from "./ProductVisual";
import * as I from "./icons";

type Props = {
  product: Product;
  streamClosed?: boolean;
  streamContext?: StreamContext;
  onAdd?: () => void;
};

export function ProductCard({ product: rawProduct, streamClosed, streamContext, onAdd }: Props) {
  const product = useLocalizedProduct(rawProduct);
  const add = useCart((s) => s.add);
  const showToast = useCartToast((s) => s.show);
  const toggle = useWishlist((s) => s.toggle);
  const ids = useWishlist((s) => s.ids);
  const hydrated = useHydrated();
  const tr = useT();
  const liked = hydrated && ids.includes(product.id);
  const displayPrice = useDisplayPrice(product.price);
  const displayOldRaw = useDisplayPrice(product.oldPrice ?? 0);
  const displayOld = product.oldPrice ? displayOldRaw : null;
  const outOfStock = product.stock <= 0;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  function handleAdd() {
    if (streamClosed || outOfStock) return;
    add(product.id, product.slug, 1, streamContext ?? null);
    showToast(product.name);
    onAdd?.();
  }

  return (
    <div className="group relative flex min-w-0 flex-col">
      <div className="relative overflow-hidden rounded-card border border-line bg-surface">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          <ProductVisual
            tone={product.tone}
            glyph={product.glyph}
            brand={brandName(product.brandSlug)}
            image={product.images?.[0]}
            className="aspect-[4/5] w-full transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.tags.includes("new") && <span className="tag">{tr("product.tag.new")}</span>}
          {discount > 0 && (
            <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              −{discount}%
            </span>
          )}
          {outOfStock && (
            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              {tr("product.outOfStock")}
            </span>
          )}
        </div>

        <button
          onClick={() => toggle(product.id)}
          aria-label={tr("product.wishlist")}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-soft transition-all hover:text-accent active:scale-95"
        >
          {liked ? <I.HeartFilled size={18} className="text-accent" /> : <I.Heart size={18} />}
        </button>

        {!streamClosed && !outOfStock && (
          <button
            onClick={handleAdd}
            className="absolute inset-x-3 bottom-3 hidden translate-y-2 rounded-full bg-ink py-2.5 text-xs font-medium text-pearl opacity-0 transition-all duration-300 ease-smooth hover:bg-accent group-hover:translate-y-0 group-hover:opacity-100 lg:block"
          >
            {tr("product.addToCart")}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <span className="text-[10px] font-medium uppercase tracking-wider text-faint">
          {brandName(product.brandSlug)}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-ink hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
          <I.StarFilled size={13} className="text-accent" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-faint">({product.reviews})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-display text-base font-semibold text-ink">{displayPrice}</span>
          {displayOld && <span className="text-sm text-faint line-through">{displayOld}</span>}
        </div>
        {streamClosed ? (
          <p className="mt-2 text-center text-xs text-muted">{tr("product.streamClosed")}</p>
        ) : outOfStock ? (
          <button disabled className="mt-2 w-full rounded-full bg-mist py-2.5 text-xs font-medium text-muted lg:hidden">
            {tr("product.outOfStock")}
          </button>
        ) : (
          <button
            onClick={handleAdd}
            className="mt-2 w-full rounded-full bg-ink py-2.5 text-xs font-medium text-pearl transition-colors hover:bg-accent lg:hidden"
          >
            {tr("product.addToCart")}
          </button>
        )}
      </div>
    </div>
  );
}
