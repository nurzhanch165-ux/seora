import "server-only";
import type { Locale } from "@/lib/i18n";

const SOURCE: Locale = "ru";
const TARGETS: Locale[] = ["en", "ko"];

const FIELD_KEYS = [
  "name",
  "shortDescription",
  "fullDescription",
  "usage",
  "result",
  "howToUse",
  "volume",
  "weight",
  "shelfLife",
  "monthsSupply",
  "country",
  "manufacturer",
] as const;

export type ProductLocaleFields = Partial<Record<(typeof FIELD_KEYS)[number], string>>;

export type ProductI18n = Partial<Record<Locale, ProductLocaleFields>>;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Бесплатный перевод через MyMemory (без ключа; для prod можно добавить TRANSLATE_API_EMAIL). */
export async function translateText(text: string, to: Locale, from: Locale = SOURCE): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || from === to) return trimmed;

  const email = process.env.TRANSLATE_API_EMAIL;
  const params = new URLSearchParams({
    q: trimmed.slice(0, 500),
    langpair: `${from}|${to}`,
  });
  if (email) params.set("de", email);

  const res = await fetch(`https://api.mymemory.translated.net/get?${params}`, {
    next: { revalidate: 0 },
  });
  const json = await res.json().catch(() => ({}));
  const translated = json?.responseData?.translatedText as string | undefined;
  if (!translated || translated === trimmed) return trimmed;
  if (/^MYMEMORY WARNING/i.test(translated)) return trimmed;
  return translated;
}

export async function translateFields(
  fields: ProductLocaleFields,
  from: Locale = SOURCE
): Promise<ProductI18n> {
  const ru: ProductLocaleFields = { ...fields };
  const result: ProductI18n = { [from]: ru };

  for (const locale of TARGETS) {
    if (locale === from) continue;
    const out: ProductLocaleFields = {};
    for (const key of FIELD_KEYS) {
      const src = fields[key];
      if (!src?.trim()) continue;
      out[key] = await translateText(src, locale, from);
      await sleep(120);
    }
    result[locale] = out;
  }

  return result;
}

export async function buildProductI18n(fields: ProductLocaleFields): Promise<ProductI18n> {
  return translateFields(fields, SOURCE);
}
