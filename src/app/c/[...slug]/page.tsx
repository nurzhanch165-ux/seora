import { notFound } from "next/navigation";
import { getSection, getCategory } from "@/data/categories";
import { Breadcrumbs, Crumb } from "@/components/Breadcrumbs";
import { SubLink } from "@/components/CatalogView";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { Glyph } from "@/components/Glyph";

type Props = { params: { slug: string[] } };

export function generateMetadata({ params }: Props) {
  const [sectionSlug, categorySlug] = params.slug;
  const section = getSection(sectionSlug);
  const category = categorySlug ? getCategory(sectionSlug, categorySlug) : undefined;
  const title = category?.name ?? section?.name ?? "Каталог";
  return { title };
}

export default function CatalogPage({ params }: Props) {
  const [sectionSlug, categorySlug, subSlug] = params.slug;
  const section = getSection(sectionSlug);
  if (!section) notFound();

  const category = categorySlug ? getCategory(sectionSlug, categorySlug) : undefined;
  if (categorySlug && !category) notFound();

  const sub = subSlug ? category?.subs.find((s) => s.slug === subSlug) : undefined;
  if (subSlug && !sub) notFound();

  // Breadcrumbs
  const crumbs: Crumb[] = [{ label: section.name, href: `/c/${section.slug}` }];
  if (category) crumbs.push({ label: category.name, href: sub ? `/c/${section.slug}/${category.slug}` : undefined });
  if (sub) crumbs.push({ label: sub.name });

  // Sidebar links
  let subLinks: SubLink[] = [];
  let subTitle = "Категории";
  if (category) {
    subTitle = "Подкатегории";
    subLinks = category.subs.map((s) => ({
      slug: s.slug,
      name: s.name,
      href: `/c/${section.slug}/${category.slug}/${s.slug}`,
      active: s.slug === subSlug,
    }));
  } else {
    subLinks = section.categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      href: `/c/${section.slug}/${c.slug}`,
    }));
  }

  const title = sub?.name ?? category?.name ?? section.name;
  const description = category ? undefined : section.tagline;

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
