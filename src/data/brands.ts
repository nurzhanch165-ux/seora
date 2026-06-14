export type Brand = { slug: string; name: string; country: string };

export const brands: Brand[] = [
  { slug: "cosrx", name: "COSRX", country: "Южная Корея" },
  { slug: "beauty-of-joseon", name: "Beauty of Joseon", country: "Южная Корея" },
  { slug: "anua", name: "Anua", country: "Южная Корея" },
  { slug: "medi-peel", name: "Medi-Peel", country: "Южная Корея" },
  { slug: "some-by-mi", name: "SOME BY MI", country: "Южная Корея" },
  { slug: "numbuzin", name: "Numbuzin", country: "Южная Корея" },
  { slug: "torriden", name: "Torriden", country: "Южная Корея" },
  { slug: "round-lab", name: "Round Lab", country: "Южная Корея" },
  { slug: "sulwhasoo", name: "Sulwhasoo", country: "Южная Корея" },
  { slug: "missha", name: "MISSHA", country: "Южная Корея" },
  { slug: "innisfree", name: "innisfree", country: "Южная Корея" },
  { slug: "kwangdong", name: "Kwangdong", country: "Южная Корея" },
  { slug: "nutrione", name: "Nutrione", country: "Южная Корея" },
  { slug: "atomy", name: "Atomy", country: "Южная Корея" },
  { slug: "gnm", name: "GNM", country: "Южная Корея" },
];

export function brandName(slug: string): string {
  return brands.find((b) => b.slug === slug)?.name ?? slug;
}
