import { sections } from "@/data/categories";
import { t, type Locale } from "@/lib/i18n";

function lookup(key: string, locale: Locale, fallback: string) {
  const val = t(key, locale);
  return val === key ? fallback : val;
}

export function sectionLabel(slug: string, locale: Locale): string {
  const sec = sections.find((s) => s.slug === slug);
  return lookup(`cat.section.${slug}`, locale, sec?.name ?? slug);
}

export function sectionTagline(slug: string, locale: Locale): string {
  const sec = sections.find((s) => s.slug === slug);
  return lookup(`cat.sectionTagline.${slug}`, locale, sec?.tagline ?? "");
}

export function categoryLabel(sectionSlug: string, categorySlug: string, locale: Locale): string {
  const sec = sections.find((s) => s.slug === sectionSlug);
  const cat = sec?.categories.find((c) => c.slug === categorySlug);
  return lookup(`cat.category.${categorySlug}`, locale, cat?.name ?? categorySlug);
}

export function subcategoryLabel(
  sectionSlug: string,
  categorySlug: string,
  subSlug: string,
  locale: Locale
): string {
  const sec = sections.find((s) => s.slug === sectionSlug);
  const cat = sec?.categories.find((c) => c.slug === categorySlug);
  const sub = cat?.subs.find((s) => s.slug === subSlug);
  return lookup(`cat.sub.${subSlug}`, locale, sub?.name ?? subSlug);
}

export function useCatalogLabels(locale: Locale) {
  return {
    section: (slug: string) => sectionLabel(slug, locale),
    sectionTagline: (slug: string) => sectionTagline(slug, locale),
    category: (sectionSlug: string, categorySlug: string) => categoryLabel(sectionSlug, categorySlug, locale),
    sub: (sectionSlug: string, categorySlug: string, subSlug: string) =>
      subcategoryLabel(sectionSlug, categorySlug, subSlug, locale),
  };
}
