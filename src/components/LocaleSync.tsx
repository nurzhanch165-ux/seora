"use client";

import { useEffect } from "react";
import { usePreferences } from "@/store/preferences";

export function LocaleSync() {
  const locale = usePreferences((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
  }, [locale]);

  return null;
}
