"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyCode } from "@/lib/currency";
import type { Locale } from "@/lib/i18n";

function syncLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

type PreferencesState = {
  locale: Locale;
  currency: CurrencyCode;
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: CurrencyCode) => void;
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: "ru",
      currency: "KRW",
      setLocale: (locale) => {
        syncLocaleCookie(locale);
        set({ locale });
      },
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "sonyshopkorea-prefs",
      onRehydrateStorage: () => (state) => {
        if (state?.locale) syncLocaleCookie(state.locale);
      },
    }
  )
);
