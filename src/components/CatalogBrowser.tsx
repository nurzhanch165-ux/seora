"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCatalogProducts } from "@/store/catalog";
import { CatalogView, SubLink } from "./CatalogView";

export function CatalogBrowser({
  sectionSlug,
  categorySlug,
  subSlug,
  subLinks,
  subTitle,
}: {
  sectionSlug: string;
  categorySlug?: string;
  subSlug?: string;
  subLinks: SubLink[];
  subTitle: string;
}) {
  const all = useCatalogProducts();

  const products = useMemo(() => {
    let list = all.filter((p) => p.sectionSlug === sectionSlug);
    if (categorySlug) list = list.filter((p) => p.categorySlug === categorySlug);
    if (subSlug) {
      const subFiltered = list.filter((p) => p.subSlug === subSlug);
      if (subFiltered.length) list = subFiltered;
    }
    return list;
  }, [all, sectionSlug, categorySlug, subSlug]);

  if (products.length === 0) {
    return (
      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">{subTitle}</h4>
          <ul className="space-y-1.5">
            {subLinks.map((l) => (
              <li key={l.slug}>
                <Link href={l.href} className="block rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-ink/5 hover:text-ink">
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div className="card flex flex-col items-center justify-center gap-3 py-24 text-center">
          <p className="text-lg font-medium text-ink">Скоро здесь появятся товары</p>
          <p className="max-w-md text-sm text-muted">
            Мы постоянно добавляем новинки из Кореи. Загляните в соседние категории или напишите менеджеру — поможем с подбором.
          </p>
        </div>
      </div>
    );
  }

  return <CatalogView products={products} subLinks={subLinks} subTitle={subTitle} />;
}
