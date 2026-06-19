import { AboutPageClient } from "@/components/about/AboutPageClient";
import { t } from "@/lib/i18n";

export const metadata = { title: t("about.title", "ru") };

export default function AboutPage() {
  return <AboutPageClient />;
}
