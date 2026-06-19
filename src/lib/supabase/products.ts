import type { Product, Tone } from "@/data/products";
import type { IconKey } from "@/data/categories";

// Строка таблицы products (snake_case) -> доменный тип Product (camelCase)
export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand_slug: string;
  section_slug: string;
  category_slug: string;
  sub_slug: string;
  glyph: string;
  tone: string;
  images: string[] | null;
  price: number | string;
  old_price: number | string | null;
  short_description: string;
  full_description: string;
  usage: string;
  result: string;
  how_to_use: string;
  volume: string;
  weight: string;
  shelf_life: string;
  months_supply: string;
  country: string;
  manufacturer: string;
  certificates: string[] | null;
  stock: number | string;
  rating: number | string;
  reviews: number | string;
  tags: string[] | null;
  sku?: string | null;
  active?: boolean | null;
};

export function mapProductRow(row: ProductRow): Product {
  const images = row.images && row.images.length ? row.images : undefined;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brandSlug: row.brand_slug,
    sectionSlug: (row.section_slug as Product["sectionSlug"]) ?? "cosmetics",
    categorySlug: row.category_slug,
    subSlug: row.sub_slug,
    glyph: (row.glyph as IconKey) ?? "Sparkle",
    tone: (row.tone as Tone) ?? "sand",
    images,
    price: Number(row.price) || 0,
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    shortDescription: row.short_description ?? "",
    fullDescription: row.full_description ?? "",
    usage: row.usage ?? "",
    result: row.result ?? "",
    howToUse: row.how_to_use ?? "",
    volume: row.volume ?? "",
    weight: row.weight ?? "",
    shelfLife: row.shelf_life ?? "",
    monthsSupply: row.months_supply ?? "",
    country: row.country ?? "",
    manufacturer: row.manufacturer ?? "",
    certificates: row.certificates ?? [],
    stock: Number(row.stock) || 0,
    rating: Number(row.rating) || 0,
    reviews: Number(row.reviews) || 0,
    tags: (row.tags as Product["tags"]) ?? [],
    sku: row.sku ?? undefined,
    active: row.active !== false,
  };
}

// Product (camelCase) -> строка для вставки/обновления в БД (snake_case)
export function productToRow(p: Product): Record<string, unknown> {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand_slug: p.brandSlug,
    section_slug: p.sectionSlug,
    category_slug: p.categorySlug,
    sub_slug: p.subSlug,
    glyph: p.glyph,
    tone: p.tone,
    images: p.images ?? [],
    price: p.price,
    old_price: p.oldPrice ?? null,
    short_description: p.shortDescription,
    full_description: p.fullDescription,
    usage: p.usage,
    result: p.result,
    how_to_use: p.howToUse,
    volume: p.volume,
    weight: p.weight,
    shelf_life: p.shelfLife,
    months_supply: p.monthsSupply,
    country: p.country,
    manufacturer: p.manufacturer,
    certificates: p.certificates ?? [],
    stock: p.stock,
    rating: p.rating,
    reviews: p.reviews,
    tags: p.tags ?? [],
    sku: p.sku ?? p.id,
    active: p.active !== false,
    updated_at: new Date().toISOString(),
  };
}
