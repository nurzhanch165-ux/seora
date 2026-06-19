"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useCatalogProducts } from "@/store/catalog";
import { brandName } from "@/data/brands";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";
import { ProductVisual } from "@/components/ProductVisual";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import * as I from "@/components/icons";

export default function CartPage() {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const catalog = useCatalogProducts();

  const items = lines
    .map((l) => ({ line: l, product: catalog.find((p) => p.id === l.productId) }))
    .filter((x) => x.product);

  const total = items.reduce((sum, x) => sum + (x.product!.price * x.line.qty), 0);
  const totalOld = items.reduce(
    (sum, x) => sum + ((x.product!.oldPrice ?? x.product!.price) * x.line.qty),
    0
  );
  const saved = totalOld - total;

  if (!hydrated) {
    return <div className="container-site py-20 text-center text-muted">Загрузка корзины…</div>;
  }

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Корзина" }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">Корзина</h1>

      {items.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center justify-center gap-4 py-24 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <I.Bag size={28} />
          </span>
          <p className="text-lg font-medium">Корзина пока пуста</p>
          <p className="max-w-sm text-sm text-muted">Загляните в каталог — мы собрали лучшее из Кореи для кожи и здоровья.</p>
          <div className="mt-2 flex gap-3">
            <Link href="/c/cosmetics" className="btn-primary">Косметика</Link>
            <Link href="/c/health" className="btn-outline">Всё для здоровья</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map(({ line, product }) => (
              <div key={line.productId} className="flex min-w-0 gap-3 rounded-xl2 border border-line bg-surface p-3 sm:gap-4 sm:p-4">
                <Link href={`/product/${product!.slug}`} className="shrink-0">
                  <ProductVisual
                    tone={product!.tone}
                    glyph={product!.glyph}
                    image={product!.images?.[0]}
                    className="h-20 w-20 rounded-xl sm:h-28 sm:w-28"
                    glyphSize={34}
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <span className="text-[11px] uppercase tracking-wider text-faint">{brandName(product!.brandSlug)}</span>
                      <Link href={`/product/${product!.slug}`} className="block line-clamp-2 text-sm leading-snug text-ink hover:text-accent">
                        {product!.name}
                      </Link>
                    </div>
                    <button onClick={() => remove(line.productId)} className="text-faint transition-colors hover:text-sale" aria-label="Удалить">
                      <I.Trash size={18} />
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button onClick={() => setQty(line.productId, line.qty - 1)} className="flex h-9 w-9 items-center justify-center hover:text-accent" aria-label="Меньше">
                        <I.Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{line.qty}</span>
                      <button onClick={() => setQty(line.productId, line.qty + 1)} className="flex h-9 w-9 items-center justify-center hover:text-accent" aria-label="Больше">
                        <I.Plus size={16} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink">{formatPrice(product!.price * line.qty)}</p>
                      <p className="text-xs text-muted">{formatPrice(product!.price)} / шт.</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card p-6">
              <h2 className="text-lg font-medium">Итого</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-muted">
                  <dt>Товары ({items.reduce((s, x) => s + x.line.qty, 0)})</dt>
                  <dd className="text-ink">{formatPrice(totalOld)}</dd>
                </div>
                {saved > 0 && (
                  <div className="flex justify-between text-sale">
                    <dt>Скидка</dt>
                    <dd>−{formatPrice(saved)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                  <dt>К оплате</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </dl>
              <Link href="/checkout" className="btn-primary mt-5 w-full">
                Перейти к оформлению
                <I.ArrowRight size={18} />
              </Link>
              <p className="mt-3 text-center text-xs text-muted">
                После оформления вы получите Excel-файл заказа и реквизиты для оплаты.
              </p>
            </div>
            <Link href="/c/cosmetics" className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted hover:text-accent">
              <I.ChevronLeft size={16} /> Продолжить покупки
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
