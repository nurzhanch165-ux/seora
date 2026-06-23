import { DeliveryPageClient } from "@/components/DeliveryPageClient";
import { t } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale.server";

export function generateMetadata() {
  return { title: t("delivery.breadcrumb", getRequestLocale()) };
}

export default function DeliveryPage() {
  return <DeliveryPageClient />;
}
