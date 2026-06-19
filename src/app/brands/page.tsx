import { BrandsPageClient } from "@/components/brands/BrandsPageClient";
import { t } from "@/lib/i18n";

export const metadata = { title: t("brands.title", "ru") };

export default function BrandsPage() {
  return <BrandsPageClient />;
}
