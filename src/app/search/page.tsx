"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { brandName } from "@/data/brands";
import { useCatalogProducts } from "@/store/catalog";
import { CatalogView } from "@/components/CatalogView";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

function SearchInner() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const products = useCatalogProducts();
  const tr = useT();

  const results = useMemo(() => {
    if (!q) return [];
    return products.filter((p) => {
      const hay = `${p.name} ${brandName(p.brandSlug)} ${p.shortDescription} ${p.fullDescription}`.toLowerCase();
      return hay.includes(q);
    });
  }, [q, products]);

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("search.title") }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">
        {tr("search.title")}{q && <>: <span className="text-accent">«{params.get("q")}»</span></>}
      </h1>

      {!q ? (
        <div className="card mt-8 flex flex-col items-center gap-3 py-20 text-center">
          <I.Search size={32} className="text-faint" />
          <p className="text-muted">{tr("search.emptyQuery")}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center gap-3 py-20 text-center">
          <I.Search size={32} className="text-faint" />
          <p className="text-muted">{tr("search.noResults")}</p>
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
  const tr = useT();
  return (
    <Suspense fallback={<div className="container-site py-20 text-center text-muted">{tr("common.loading")}</div>}>
      <SearchInner />
    </Suspense>
  );
}
