"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyCode } from "@/lib/currency";
import type { Locale } from "@/lib/i18n";

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
      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "sonyshopkorea-prefs" }
  )
);
