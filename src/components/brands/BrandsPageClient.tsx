"use client";

import Link from "next/link";
import { brands } from "@/data/brands";
import { products } from "@/data/products";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

export function BrandsPageClient() {
  const tr = useT();
  const count = (slug: string) => products.filter((p) => p.brandSlug === slug).length;

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("nav.brands") }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">{tr("brands.title")}</h1>
      <p className="mt-2 max-w-xl text-muted">{tr("brands.subtitle")}</p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((b) => (
          <Link
            key={b.slug}
            href={`/brands/${b.slug}`}
            className="group flex flex-col justify-between rounded-xl2 border border-line bg-surface p-6 transition-shadow hover:shadow-lift"
          >
            <span className="font-serif text-xl text-ink">{b.name}</span>
            <div className="mt-6 flex items-center justify-between text-sm text-muted">
              <span>{tr("brands.productsCount", { count: count(b.slug) })}</span>
              <I.ArrowRight size={17} className="text-accent transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
