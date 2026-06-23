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

async function translateChunk(text: string, to: Locale, from: Locale, attempt = 0): Promise<string> {
  const email = process.env.TRANSLATE_API_EMAIL;
  const params = new URLSearchParams({
    q: text,
    langpair: `${from}|${to}`,
  });
  if (email) params.set("de", email);

  const res = await fetch(`https://api.mymemory.translated.net/get?${params}`);
  const json = await res.json().catch(() => ({}));
  const translated = json?.responseData?.translatedText as string | undefined;

  if (/^MYMEMORY WARNING/i.test(translated ?? "")) {
    if (attempt < 4) {
      await sleep(2000 * (attempt + 1));
      return translateChunk(text, to, from, attempt + 1);
    }
    return text;
  }

  if (!translated || translated === text) return text;
  return translated;
}

export async function translateText(text: string, to: Locale, from: Locale = SOURCE): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || from === to) return trimmed;

  const maxChunk = 480;
  if (trimmed.length <= maxChunk) {
    return translateChunk(trimmed, to, from);
  }

  const parts: string[] = [];
  let rest = trimmed;
  while (rest.length > 0) {
    if (rest.length <= maxChunk) {
      parts.push(rest);
      break;
    }
    let cut = rest.lastIndexOf("\n", maxChunk);
    if (cut < maxChunk * 0.4) cut = rest.lastIndexOf(". ", maxChunk);
    if (cut < maxChunk * 0.4) cut = rest.lastIndexOf(" ", maxChunk);
    if (cut < 1) cut = maxChunk;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  const out: string[] = [];
  for (const part of parts) {
    out.push(await translateChunk(part, to, from));
    await sleep(150);
  }
  return out.join("\n\n");
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
