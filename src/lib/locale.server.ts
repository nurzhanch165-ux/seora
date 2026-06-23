import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";

export function parseLocale(raw?: string | null): Locale {
  if (raw === "en" || raw === "ko") return raw;
  return "ru";
}

export function getRequestLocale(): Locale {
  return parseLocale(cookies().get("locale")?.value);
}
