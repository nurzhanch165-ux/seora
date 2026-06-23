"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/store/preferences";
import { site } from "@/data/site";
import { t } from "@/lib/i18n";

export function LocaleSync() {
  const locale = usePreferences((s) => s.locale);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
  }, [locale]);

  useEffect(() => {
    const base = t("site.defaultTitle", locale, { name: site.name });
    const pageTitle = document.title.split(" · ")[0];
    if (pageTitle && pageTitle !== site.name && pageTitle !== base) {
      document.title = `${pageTitle} · ${site.name}`;
    } else {
      document.title = base;
    }
  }, [locale, pathname]);

  return null;
}
