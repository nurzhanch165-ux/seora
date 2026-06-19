"use client";

import { usePreferences } from "@/store/preferences";
import { t as translate, type Locale } from "@/lib/i18n";

export function useT() {
  const locale = usePreferences((s) => s.locale);
  return (key: string) => translate(key, locale);
}

export function useLocale(): Locale {
  return usePreferences((s) => s.locale);
}
