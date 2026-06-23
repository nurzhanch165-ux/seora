import { AboutPageClient } from "@/components/about/AboutPageClient";
import { t } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale.server";

export function generateMetadata() {
  return { title: t("about.title", getRequestLocale()) };
}

export default function AboutPage() {
  return <AboutPageClient />;
}
