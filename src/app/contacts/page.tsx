import { ContactsPageClient } from "@/components/contacts/ContactsPageClient";
import { t } from "@/lib/i18n";

export const metadata = { title: t("contacts.title", "ru") };

export default function ContactsPage() {
  return <ContactsPageClient />;
}
