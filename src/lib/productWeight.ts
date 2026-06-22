import type { Product } from "@/data/products";

/** Минимальный вес посылки для расчёта международной доставки (кг) */
export const MIN_SHIPPING_WEIGHT_KG = 0.5;

const SECTION_DEFAULT_KG: Record<Product["sectionSlug"], number> = {
  cosmetics: 0.15,
  health: 0.2,
  home: 0.35,
  clothes: 0.4,
  shoes: 0.7,
};

/** Парсит массу из строки: «55 г», «1.2 kg», «500ml», «60 капсул» → кг */
export function parseWeightKgFromText(text: string): number | null {
  const s = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (!s) return null;

  const kgMatch = s.match(/(\d+[.,]?\d*)\s*(?:kg|кг|kilogram)/i);
  if (kgMatch) {
    const n = Number(kgMatch[1].replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  const gMatch = s.match(/(\d+[.,]?\d*)\s*(?:g|г|gram|grams|грамм)/i);
  if (gMatch) {
    const n = Number(gMatch[1].replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n / 1000 : null;
  }

  const mlMatch = s.match(/(\d+[.,]?\d*)\s*(?:ml|мл|milliliter)/i);
  if (mlMatch) {
    const n = Number(mlMatch[1].replace(",", "."));
    // жидкости косметики ~1 г/мл
    return Number.isFinite(n) && n > 0 ? (n * 1.05) / 1000 : null;
  }

  const capsMatch = s.match(/(\d+[.,]?\d*)\s*(?:капс|caps|capsule|табл|tablet|stick|стик|sachet|пак)/i);
  if (capsMatch) {
    const n = Number(capsMatch[1].replace(",", "."));
    return Number.isFinite(n) && n > 0 ? (n * 0.55) / 1000 : null;
  }

  const bareNum = s.match(/^(\d+[.,]?\d*)$/);
  if (bareNum) {
    const n = Number(bareNum[1].replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return null;
    // голое число без единиц — если > 20, считаем граммами
    return n > 20 ? n / 1000 : n;
  }

  return null;
}

/** Определяет вес товара в кг из полей карточки */
export function inferProductWeightKg(product: Pick<Product, "weight" | "volume" | "sectionSlug" | "name">): number {
  for (const src of [product.weight, product.volume, product.name]) {
    const parsed = parseWeightKgFromText(src);
    if (parsed != null) return roundKg(parsed);
  }
  return SECTION_DEFAULT_KG[product.sectionSlug] ?? 0.2;
}

export function resolveProductWeightKg(
  product: Pick<Product, "weightKg" | "weight" | "volume" | "sectionSlug" | "name">
): number {
  if (product.weightKg != null && product.weightKg > 0) {
    return roundKg(product.weightKg);
  }
  return inferProductWeightKg(product);
}

export function getProductWeightKg(product: Product): number {
  return resolveProductWeightKg(product);
}

export function cartTotalWeightKg(
  items: { product: Product; qty: number }[]
): number {
  const total = items.reduce(
    (sum, { product, qty }) => sum + getProductWeightKg(product) * qty,
    0
  );
  return roundKg(total);
}

export function billableShippingWeightKg(totalKg: number): number {
  return roundKg(Math.max(totalKg, MIN_SHIPPING_WEIGHT_KG));
}

function roundKg(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function formatWeightKg(kg: number, locale: "ru" | "en" | "ko" = "ru"): string {
  if (kg >= 1) {
    const label = locale === "en" ? "kg" : locale === "ko" ? "kg" : "кг";
    return `${kg.toFixed(2).replace(/\.?0+$/, "")} ${label}`;
  }
  const g = Math.round(kg * 1000);
  const label = locale === "en" ? "g" : locale === "ko" ? "g" : "г";
  return `${g} ${label}`;
}
