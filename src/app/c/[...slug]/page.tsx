import { getSection, getCategory } from "@/data/categories";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";
import { t } from "@/lib/i18n";
import { sectionLabel, categoryLabel } from "@/lib/catalogI18n";
import { getRequestLocale } from "@/lib/locale.server";

type Props = { params: { slug: string[] } };

export function generateMetadata({ params }: Props) {
  const locale = getRequestLocale();
  const [sectionSlug, categorySlug] = params.slug;
  const section = getSection(sectionSlug);
  const category = categorySlug ? getCategory(sectionSlug, categorySlug) : undefined;
  const title = category
    ? categoryLabel(sectionSlug, categorySlug, locale)
    : section
      ? sectionLabel(sectionSlug, locale)
      : t("catalog.title", locale);
  return { title };
}

export default function CatalogPage({ params }: Props) {
  const [sectionSlug, categorySlug, subSlug] = params.slug;
  return (
    <CatalogPageClient
      sectionSlug={sectionSlug}
      categorySlug={categorySlug}
      subSlug={subSlug}
    />
  );
}
