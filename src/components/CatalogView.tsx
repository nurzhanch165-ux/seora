"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Product } from "@/data/products";
import { brandName } from "@/data/brands";
import { formatPrice } from "@/lib/format";
import { ProductGrid } from "./ProductGrid";
import { useT } from "@/hooks/useTranslation";
import * as I from "./icons";

type SortKey = "popular" | "price-asc" | "price-desc" | "rating" | "new";

export type SubLink = { slug: string; name: string; href: string; active?: boolean };

export function CatalogView({
  products,
  subLinks = [],
  subTitle,
}: {
  products: Product[];
  subLinks?: SubLink[];
  subTitle?: string;
}) {
  const tr = useT();
  const [sort, setSort] = useState<SortKey>("popular");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);

  const sortOptions: { value: SortKey; label: string }[] = useMemo(
    () => [
      { value: "popular", label: tr("catalog.sort.popular") },
      { value: "price-asc", label: tr("catalog.sort.priceAsc") },
      { value: "price-desc", label: tr("catalog.sort.priceDesc") },
      { value: "rating", label: tr("catalog.sort.rating") },
      { value: "new", label: tr("catalog.sort.new") },
    ],
    [tr]
  );

  const availableBrands = useMemo(() => {
    const set = new Map<string, number>();
    products.forEach((p) => set.set(p.brandSlug, (set.get(p.brandSlug) ?? 0) + 1));
    return Array.from(set.entries()).map(([slug, count]) => ({ slug, count }));
  }, [products]);

  const priceCeiling = useMemo(
    () => Math.max(...products.map((p) => p.price), 0),
    [products]
  );

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedBrands.length) list = list.filter((p) => selectedBrands.includes(p.brandSlug));
    if (selectedTags.length) list = list.filter((p) => selectedTags.some((t) => p.tags.includes(t as "new" | "hit" | "sale")));
    if (maxPrice != null) list = list.filter((p) => p.price <= maxPrice);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        list.sort((a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new")));
        break;
      default:
        list.sort((a, b) => b.reviews - a.reviews);
    }
    return list;
  }, [products, selectedBrands, selectedTags, maxPrice, sort]);

  function toggleBrand(slug: string) {
    setSelectedBrands((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));
  }
  function toggleTag(tag: string) {
    setSelectedTags((s) => (s.includes(tag) ? s.filter((x) => x !== tag) : [...s, tag]));
  }
  function reset() {
    setSelectedBrands([]);
    setSelectedTags([]);
    setMaxPrice(null);
  }

  const filtersActive = selectedBrands.length + selectedTags.length + (maxPrice != null ? 1 : 0);

  const Sidebar = (
    <div className="space-y-8">
      {subLinks.length > 0 && (
        <FilterBlock title={subTitle ?? tr("catalog.categories")}>
          <ul className="space-y-1.5">
            {subLinks.map((l) => (
              <li key={l.slug}>
                <Link
                  href={l.href}
                  className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    l.active ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </FilterBlock>
      )}

      <FilterBlock title={tr("catalog.collections")}>
        <div className="flex flex-wrap gap-2">
          {[
            { tag: "new", label: tr("catalog.collection.new") },
            { tag: "hit", label: tr("catalog.collection.hit") },
            { tag: "sale", label: tr("catalog.collection.sale") },
          ].map((t) => (
            <button
              key={t.tag}
              onClick={() => toggleTag(t.tag)}
              className={`chip ${selectedTags.includes(t.tag) ? "border-accent bg-accent-soft text-accent" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FilterBlock>

      {priceCeiling > 0 && (
        <FilterBlock title={tr("catalog.priceUpTo")}>
          <input
            type="range"
            min={0}
            max={priceCeiling}
            step={500}
            value={maxPrice ?? priceCeiling}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>0</span>
            <span className="font-medium text-ink">{formatPrice(maxPrice ?? priceCeiling)}</span>
          </div>
        </FilterBlock>
      )}

      <FilterBlock title={tr("catalog.brand")}>
        <ul className="space-y-2">
          {availableBrands.map((b) => (
            <li key={b.slug}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted hover:text-ink">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b.slug)}
                  onChange={() => toggleBrand(b.slug)}
                  className="h-4 w-4 rounded border-line accent-accent"
                />
                <span className="flex-1">{brandName(b.slug)}</span>
                <span className="text-xs text-faint">{b.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterBlock>

      {filtersActive > 0 && (
        <button onClick={reset} className="text-sm text-accent hover:underline">
          {tr("catalog.resetFiltersCount", { count: filtersActive })}
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">{Sidebar}</aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {tr("catalog.found", { count: filtered.length })}
          </p>
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <button
              onClick={() => setMobileFilters(true)}
              className="btn-outline px-3 py-2 text-xs lg:hidden"
            >
              <I.Filter size={16} />
              {tr("catalog.filters")}{filtersActive ? ` · ${filtersActive}` : ""}
            </button>
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="w-full min-w-0 appearance-none rounded-full border border-line bg-surface py-2 pl-4 pr-9 text-xs font-medium text-ink outline-none focus:border-accent sm:w-auto"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <I.ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </div>

        {filtered.length > 0 ? (
          <ProductGrid products={filtered} />
        ) : (
          <div className="card flex flex-col items-center justify-center gap-3 py-20 text-center">
            <I.Search size={32} className="text-faint" />
            <p className="text-muted">{tr("catalog.noFilterResults")}</p>
            <button onClick={reset} className="btn-ghost">{tr("catalog.resetFilters")}</button>
          </div>
        )}
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 animate-fadeIn" onClick={() => setMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-surface p-6 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium">{tr("catalog.filters")}</h3>
              <button className="btn-ghost px-2" onClick={() => setMobileFilters(false)} aria-label={tr("common.close")}>
                <I.Close />
              </button>
            </div>
            {Sidebar}
            <button onClick={() => setMobileFilters(false)} className="btn-primary mt-8 w-full">
              {tr("catalog.showCount", { count: filtered.length })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">{title}</h4>
      {children}
    </div>
  );
}
