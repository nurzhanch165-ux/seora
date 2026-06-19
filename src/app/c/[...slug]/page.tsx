import { getSection, getCategory } from "@/data/categories";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";
import { t } from "@/lib/i18n";

type Props = { params: { slug: string[] } };

export function generateMetadata({ params }: Props) {
  const [sectionSlug, categorySlug] = params.slug;
  const section = getSection(sectionSlug);
  const category = categorySlug ? getCategory(sectionSlug, categorySlug) : undefined;
  const title = category?.name ?? section?.name ?? t("catalog.title", "ru");
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
