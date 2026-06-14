"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { brandName } from "@/data/brands";
import { useCatalogProducts } from "@/store/catalog";
import { CatalogView } from "@/components/CatalogView";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import * as I from "@/components/icons";

function SearchInner() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const products = useCatalogProducts();

  const results = useMemo(() => {
    if (!q) return [];
    return products.filter((p) => {
      const hay = `${p.name} ${brandName(p.brandSlug)} ${p.shortDescription} ${p.fullDescription}`.toLowerCase();
      return hay.includes(q);
    });
  }, [q, products]);

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Поиск" }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">
        Поиск{q && <>: <span className="text-accent">«{params.get("q")}»</span></>}
      </h1>

      {!q ? (
        <div className="card mt-8 flex flex-col items-center gap-3 py-20 text-center">
          <I.Search size={32} className="text-faint" />
          <p className="text-muted">Введите запрос в поиске вверху страницы.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center gap-3 py-20 text-center">
          <I.Search size={32} className="text-faint" />
          <p className="text-muted">По запросу ничего не найдено. Попробуйте другое слово.</p>
        </div>
      ) : (
        <div className="mt-8">
          <CatalogView products={results} />
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-site py-20 text-center text-muted">Загрузка…</div>}>
      <SearchInner />
    </Suspense>
  );
}
