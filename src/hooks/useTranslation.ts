"use client";

import { useCallback } from "react";
import { usePreferences } from "@/store/preferences";
import { t as translate, siteText, type Locale, type SiteTextKey } from "@/lib/i18n";

export function useT() {
  const locale = usePreferences((s) => s.locale);
  return useCallback(
    (key: string, params?: Record<string, string | number>) => translate(key, locale, params),
    [locale]
  );
}

export function useLocale(): Locale {
  return usePreferences((s) => s.locale);
}

export function useSiteText() {
  const locale = useLocale();
  return useCallback(
    (key: SiteTextKey, params?: Record<string, string | number>) => siteText(key, locale, params),
    [locale]
  );
}
