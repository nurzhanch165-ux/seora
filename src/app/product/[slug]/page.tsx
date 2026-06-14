"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getSection, getCategory } from "@/data/categories";
import { Product } from "@/data/products";
import { useCatalogProducts } from "@/store/catalog";
import { useHydrated } from "@/lib/useHydrated";
import { Breadcrumbs, Crumb } from "@/components/Breadcrumbs";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/SectionHeading";

type Props = { params: { slug: string } };

function getRelated(all: Product[], product: Product, limit = 4): Product[] {
  return all
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .concat(all.filter((p) => p.id !== product.id && p.sectionSlug === product.sectionSlug))
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, limit);
}

export default function ProductPage({ params }: Props) {
  const hydrated = useHydrated();
  const all = useCatalogProducts();
  const product = useMemo(() => all.find((p) => p.slug === params.slug), [all, params.slug]);
  const related = useMemo(() => (product ? getRelated(all, product) : []), [all, product]);

  if (!product) {
    if (!hydrated) {
      return <div className="container-site py-20 text-center text-muted">Загрузка…</div>;
    }
    return (
      <div className="container-site py-20 text-center">
        <h1 className="h-display text-3xl">Товар не найден</h1>
        <p className="mt-3 text-muted">Возможно, он был удалён или ссылка неверна.</p>
        <Link href="/c/cosmetics" className="btn-primary mt-6 inline-flex">В каталог</Link>
      </div>
    );
  }

  const section = getSection(product.sectionSlug);
  const category = getCategory(product.sectionSlug, product.categorySlug);

  const crumbs: Crumb[] = [];
  if (section) crumbs.push({ label: section.name, href: `/c/${section.slug}` });
  if (category) crumbs.push({ label: category.name, href: `/c/${product.sectionSlug}/${product.categorySlug}` });
  crumbs.push({ label: product.name });

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={crumbs} />
      <div className="mt-8">
        <ProductDetail product={product} />
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeading eyebrow="Вам также понравится" title="Похожие товары" />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
