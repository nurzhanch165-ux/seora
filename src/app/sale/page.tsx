"use client";

import { useMemo } from "react";
import { useCatalogProducts } from "@/store/catalog";
import { CatalogView } from "@/components/CatalogView";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function SalePage() {
  const all = useCatalogProducts();
  const saleProducts = useMemo(
    () => all.filter((p) => p.tags.includes("sale") || p.oldPrice),
    [all]
  );

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Акции" }]} />
      <div className="mt-6 overflow-hidden rounded-xl2 bg-ink px-8 py-12 text-paper">
        <p className="eyebrow mb-2 text-accent">Выгодные предложения</p>
        <h1 className="h-display text-3xl md:text-4xl">Акции и скидки</h1>
        <p className="mt-3 max-w-lg text-paper/70">
          Специальные цены на популярные средства для кожи и здоровья. Успейте, пока товар в наличии.
        </p>
      </div>

      <div className="mt-10">
        {saleProducts.length > 0 ? (
          <CatalogView products={saleProducts} />
        ) : (
          <div className="card py-20 text-center text-muted">Сейчас нет товаров со скидкой.</div>
        )}
      </div>
    </div>
  );
}
