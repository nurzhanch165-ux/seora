"use client";

import { notFound } from "next/navigation";
import { getSection, getCategory } from "@/data/categories";
import { Breadcrumbs, Crumb } from "@/components/Breadcrumbs";
import { SubLink } from "@/components/CatalogView";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { Glyph } from "@/components/Glyph";
import { useT, useLocale } from "@/hooks/useTranslation";
import { sectionLabel, sectionTagline, categoryLabel, subcategoryLabel } from "@/lib/catalogI18n";

type Props = {
  sectionSlug: string;
  categorySlug?: string;
  subSlug?: string;
};

export function CatalogPageClient({ sectionSlug, categorySlug, subSlug }: Props) {
  const tr = useT();
  const locale = useLocale();

  const section = getSection(sectionSlug);
  if (!section) notFound();

  const category = categorySlug ? getCategory(sectionSlug, categorySlug) : undefined;
  if (categorySlug && !category) notFound();

  const sub = subSlug ? category?.subs.find((s) => s.slug === subSlug) : undefined;
  if (subSlug && !sub) notFound();

  const crumbs: Crumb[] = [{ label: sectionLabel(section.slug, locale), href: `/c/${section.slug}` }];
  if (category) {
    crumbs.push({
      label: categoryLabel(sectionSlug, category.slug, locale),
      href: sub ? `/c/${section.slug}/${category.slug}` : undefined,
    });
  }
  if (sub) crumbs.push({ label: subcategoryLabel(sectionSlug, category!.slug, sub.slug, locale) });

  let subLinks: SubLink[] = [];
  let subTitle = tr("catalog.categories");
  if (category) {
    subTitle = tr("catalog.subcategories");
    subLinks = category.subs.map((s) => ({
      slug: s.slug,
      name: subcategoryLabel(sectionSlug, category.slug, s.slug, locale),
      href: `/c/${section.slug}/${category.slug}/${s.slug}`,
      active: s.slug === subSlug,
    }));
  } else {
    subLinks = section.categories.map((c) => ({
      slug: c.slug,
      name: categoryLabel(sectionSlug, c.slug, locale),
      href: `/c/${section.slug}/${c.slug}`,
    }));
  }

  const title = sub
    ? subcategoryLabel(sectionSlug, category!.slug, sub.slug, locale)
    : category
      ? categoryLabel(sectionSlug, category.slug, locale)
      : sectionLabel(section.slug, locale);
  const description = category ? undefined : sectionTagline(section.slug, locale);

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={crumbs} />

      <div className="mb-10 mt-6 flex items-center gap-4">
        {category && (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Glyph name={category.icon} size={30} />
          </span>
        )}
        <div>
          <h1 className="h-display text-3xl md:text-4xl">{title}</h1>
          {description && <p className="mt-2 text-muted">{description}</p>}
        </div>
      </div>

      <CatalogBrowser
        sectionSlug={sectionSlug}
        categorySlug={categorySlug}
        subSlug={subSlug}
        subLinks={subLinks}
        subTitle={subTitle}
      />
    </div>
  );
}
