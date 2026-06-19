import { en as enBase, ko as koBase, ru as ruBase, type Dict } from "./i18n/messages";
import categoryLocales from "./i18n/categoryLocales.json";

export type Locale = "ru" | "en" | "ko";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "ru", label: "Русский", flag: "RU" },
  { code: "en", label: "English", flag: "EN" },
  { code: "ko", label: "한국어", flag: "KR" },
];

const dicts: Record<Locale, Dict> = {
  ru: ruBase,
  en: { ...enBase, ...(categoryLocales.en ?? {}) },
  ko: { ...koBase, ...(categoryLocales.ko ?? {}) },
};

export function t(key: string, locale: Locale, params?: Record<string, string | number>): string {
  let text = dicts[locale][key] ?? dicts.ru[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

export type SiteTextKey = "description" | "shippingNote" | "paymentNote" | "aboutHeroTitle";

export function siteText(key: SiteTextKey, locale: Locale, params?: Record<string, string | number>): string {
  return t(`site.${key}`, locale, params);
}
