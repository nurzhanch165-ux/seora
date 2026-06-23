import { BrandsPageClient } from "@/components/brands/BrandsPageClient";
import { t } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale.server";

export function generateMetadata() {
  return { title: t("brands.title", getRequestLocale()) };
}

export default function BrandsPage() {
  return <BrandsPageClient />;
}
