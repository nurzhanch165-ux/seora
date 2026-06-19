"use client";

import Link from "next/link";
import { useState } from "react";
import { Product } from "@/data/products";
import { brandName } from "@/data/brands";
import { getSection, getCategory } from "@/data/categories";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useHydrated } from "@/lib/useHydrated";
import { useT, useLocale } from "@/hooks/useTranslation";
import { useLocalizedProduct } from "@/hooks/useLocalizedProduct";
import { categoryLabel } from "@/lib/catalogI18n";
import { ProductVisual } from "./ProductVisual";
import * as I from "./icons";

export function ProductDetail({ product: rawProduct }: { product: Product }) {
  const product = useLocalizedProduct(rawProduct);
  const add = useCart((s) => s.add);
  const toggle = useWishlist((s) => s.toggle);
  const ids = useWishlist((s) => s.ids);
  const hydrated = useHydrated();
  const liked = hydrated && ids.includes(product.id);
  const tr = useT();
  const locale = useLocale();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const images = product.images ?? [];
  const [activeImage, setActiveImage] = useState(0);

  const category = getCategory(product.sectionSlug, product.categorySlug);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  function handleAdd() {
    add(product.id, product.slug, qty, null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductVisual
            tone={product.tone}
            glyph={product.glyph}
            brand={brandName(product.brandSlug)}
            image={images[activeImage]}
            className="aspect-square w-full rounded-card border border-line"
            glyphSize={96}
          />
          {images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.slice(0, 8).map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-xl border ${i === activeImage ? "border-accent" : "border-line"}`}
                >
                  <ProductVisual tone={product.tone} glyph={product.glyph} image={src} className="aspect-square w-full" />
                </button>
              ))}
            </div>
          ) : (
            images.length === 0 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {[72, 60, 52, 44].map((s, i) => (
                  <ProductVisual
                    key={i}
                    tone={product.tone}
                    glyph={product.glyph}
                    className={`aspect-square rounded-xl border ${i === 0 ? "border-accent" : "border-line"}`}
                    glyphSize={s * 0.4}
                  />
                ))}
              </div>
            )
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3">
            <Link href={`/brands/${product.brandSlug}`} className="font-medium uppercase tracking-wider text-accent">
              {brandName(product.brandSlug)}
            </Link>
            {category && (
              <Link href={`/c/${product.sectionSlug}/${product.categorySlug}`} className="text-muted hover:text-ink">
                {categoryLabel(product.sectionSlug, product.categorySlug, locale)}
              </Link>
            )}
          </div>

          <h1 className="mt-3 font-display text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted">
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <I.StarFilled key={i} size={14} className={i < Math.round(product.rating) ? "text-accent" : "text-line"} />
              ))}
            </span>
            <span className="font-medium text-ink">{product.rating.toFixed(1)}</span>
            <span className="text-faint">· {tr("product.reviews", { count: product.reviews })}</span>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-muted">{product.shortDescription}</p>

          <div className="mt-6 flex flex-wrap items-end gap-2 sm:gap-3">
            <span className="text-2xl font-semibold text-ink sm:text-3xl">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="text-lg text-faint line-through">{formatPrice(product.oldPrice)}</span>
                <span className="rounded-full bg-sale/10 px-2.5 py-1 text-xs font-semibold text-sale">−{discount}%</span>
              </>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1.5 text-success">
                <I.Check size={16} /> {tr("product.inStock", { count: product.stock })}
              </span>
            ) : (
              <span className="text-sale">{tr("product.noStock")}</span>
            )}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center self-start rounded-full border border-line">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-12 w-12 items-center justify-center text-ink hover:text-accent" aria-label={tr("product.less")}>
                <I.Minus size={18} />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="flex h-12 w-12 items-center justify-center text-ink hover:text-accent" aria-label={tr("product.more")}>
                <I.Plus size={18} />
              </button>
            </div>
            <button onClick={handleAdd} className="btn-primary h-12 w-full sm:min-w-[200px] sm:flex-1">
              {added ? (
                <>
                  <I.Check size={18} /> {tr("product.addedToCart")}
                </>
              ) : (
                <>
                  <I.Bag size={18} /> <span className="truncate">{tr("product.addWithPrice", { price: formatPrice(product.price * qty) })}</span>
                </>
              )}
            </button>
            <button
              onClick={() => toggle(product.id)}
              aria-label={tr("product.wishlist")}
              className="flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent sm:self-auto"
            >
              {liked ? <I.HeartFilled size={20} className="text-accent" /> : <I.Heart size={20} />}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Assurance icon={<I.Shield size={18} />} title={tr("product.assurance.original")} text={tr("product.assurance.originalText")} />
            <Assurance icon={<I.Truck size={18} />} title={tr("product.assurance.delivery")} text={tr("product.assurance.deliveryText")} />
            <Assurance icon={<I.Box size={18} />} title={tr("product.assurance.excel")} text={tr("product.assurance.excelText")} />
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-line bg-line text-sm">
            <Fact label={tr("product.fact.volume")} value={product.volume} />
            <Fact label={tr("product.fact.weight")} value={product.weight} />
            <Fact label={tr("product.fact.monthsSupply")} value={product.monthsSupply} />
            <Fact label={tr("product.fact.shelfLife")} value={product.shelfLife} />
          </dl>
        </div>
      </div>

      <div className="mt-12 grid min-w-0 gap-6 sm:mt-16 lg:grid-cols-3">
        <InfoCard title={tr("product.section.description")} icon={<I.Info size={18} />}>
          <p>{product.fullDescription}</p>
        </InfoCard>
        <InfoCard title={tr("product.section.usage")} icon={<I.Sparkle size={18} />}>
          <p>{product.usage}</p>
        </InfoCard>
        <InfoCard title={tr("product.section.result")} icon={<I.Check size={18} />}>
          <p>{product.result}</p>
        </InfoCard>
        <InfoCard title={tr("product.section.howToUse")} icon={<I.Droplet size={18} />}>
          <p>{product.howToUse}</p>
        </InfoCard>

        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-medium">
            <I.Box size={18} className="text-accent" /> {tr("product.section.specs")}
          </h3>
          <dl className="space-y-2.5 text-sm">
            <SpecRow label={tr("product.spec.country")} value={product.country} />
            <SpecRow label={tr("product.spec.manufacturer")} value={product.manufacturer} />
            <SpecRow label={tr("product.spec.volume")} value={product.volume} />
            <SpecRow label={tr("product.spec.weight")} value={product.weight} />
            <SpecRow label={tr("product.spec.shelfLife")} value={product.shelfLife} />
            <SpecRow label={tr("product.spec.monthsSupply")} value={product.monthsSupply} />
          </dl>
        </div>

        <InfoCard title={tr("product.section.certificates")} icon={<I.Shield size={18} />}>
          <ul className="space-y-2">
            {product.certificates.map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm">
                <I.Check size={16} className="text-success" />
                {c}
              </li>
            ))}
          </ul>
        </InfoCard>
      </div>
    </>
  );
}

function Assurance({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5">
      <span className="text-accent">{icon}</span>
      <div className="leading-tight">
        <p className="text-xs font-medium text-ink">{title}</p>
        <p className="text-[11px] text-muted">{text}</p>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface p-3.5">
      <dt className="text-[11px] uppercase tracking-wider text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h3 className="mb-3 flex items-center gap-2 text-base font-medium">
        <span className="text-accent">{icon}</span> {title}
      </h3>
      <div className="text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line pb-2 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
