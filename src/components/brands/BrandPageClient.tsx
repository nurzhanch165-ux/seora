"use client";

import { notFound } from "next/navigation";
import { brands, brandName } from "@/data/brands";
import { BrandProducts } from "@/components/BrandProducts";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useT } from "@/hooks/useTranslation";

export function BrandPageClient({ slug }: { slug: string }) {
  const tr = useT();
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("nav.brands"), href: "/brands" }, { label: brand.name }]} />
      <div className="mt-6">
        <h1 className="h-display text-3xl md:text-4xl">{brand.name}</h1>
        <p className="mt-2 text-muted">{brand.country}</p>
      </div>

      <div className="mt-10">
        <BrandProducts brandSlug={brand.slug} />
      </div>
    </div>
  );
}
