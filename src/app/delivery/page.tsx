import { DeliveryPageClient } from "@/components/DeliveryPageClient";
import { t } from "@/lib/i18n";

export const metadata = { title: t("delivery.breadcrumb", "ru") };

export default function DeliveryPage() {
  return <DeliveryPageClient />;
}
