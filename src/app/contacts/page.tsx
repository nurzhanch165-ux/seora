import { ContactsPageClient } from "@/components/contacts/ContactsPageClient";
import { t } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale.server";

export function generateMetadata() {
  return { title: t("contacts.title", getRequestLocale()) };
}

export default function ContactsPage() {
  return <ContactsPageClient />;
}
