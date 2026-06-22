import { sections as STATIC_SECTIONS, type Section, type Category, type SubCategory, type IconKey } from "@/data/categories";
import { brands as STATIC_BRANDS, type Brand } from "@/data/brands";

export type ExtraBrand = Brand;
export type ExtraCategory = { sectionSlug: Section["slug"]; slug: string; name: string; icon: IconKey; subs?: SubCategory[] };
export type ExtraSubcategory = { sectionSlug: Section["slug"]; categorySlug: string; slug: string; name: string };

export type CatalogExtras = {
  extraBrands: ExtraBrand[];
  extraCategories: ExtraCategory[];
  extraSubcategories: ExtraSubcategory[];
};

export const EMPTY_EXTRAS: CatalogExtras = {
  extraBrands: [],
  extraCategories: [],
  extraSubcategories: [],
};

function slugifyBrand(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "brand";
}

export function brandSlugFromName(name: string): string {
  return slugifyBrand(name);
}

export function mergeSections(extras: CatalogExtras): Section[] {
  const result: Section[] = STATIC_SECTIONS.map((s) => ({
    ...s,
    categories: s.categories.map((c) => ({
      ...c,
      subs: [...c.subs],
    })),
  }));

  for (const extra of extras.extraCategories) {
    const section = result.find((s) => s.slug === extra.sectionSlug);
    if (!section) continue;
    if (section.categories.some((c) => c.slug === extra.slug)) continue;
    section.categories.push({
      slug: extra.slug,
      name: extra.name,
      icon: extra.icon,
      subs: extra.subs ?? [],
    });
  }

  for (const extra of extras.extraSubcategories) {
    const section = result.find((s) => s.slug === extra.sectionSlug);
    const category = section?.categories.find((c) => c.slug === extra.categorySlug);
    if (!category) continue;
    if (category.subs.some((s) => s.slug === extra.slug)) continue;
    category.subs.push({ slug: extra.slug, name: extra.name });
  }

  return result;
}

export function mergeBrands(extras: CatalogExtras): Brand[] {
  const map = new Map<string, Brand>();
  STATIC_BRANDS.forEach((b) => map.set(b.slug, b));
  extras.extraBrands.forEach((b) => map.set(b.slug, b));
  return Array.from(map.values());
}

export function getMergedSection(slug: string, extras: CatalogExtras): Section | undefined {
  return mergeSections(extras).find((s) => s.slug === slug);
}

export function getMergedCategory(sectionSlug: string, categorySlug: string, extras: CatalogExtras) {
  return getMergedSection(sectionSlug, extras)?.categories.find((c) => c.slug === categorySlug);
}

export function brandNameFromSlug(slug: string, extras: CatalogExtras = EMPTY_EXTRAS): string {
  return mergeBrands(extras).find((b) => b.slug === slug)?.name ?? slug;
}
