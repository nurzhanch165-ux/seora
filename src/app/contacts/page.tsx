import { site } from "@/data/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import * as I from "@/components/icons";

export const metadata = { title: "Контакты" };

export default function ContactsPage() {
  const cards = [
    { icon: <I.Whatsapp size={22} />, label: "WhatsApp", value: site.contacts.whatsapp, href: site.contacts.whatsappLink },
    { icon: <I.Telegram size={22} />, label: "Telegram", value: site.contacts.telegram, href: site.contacts.telegramLink },
    { icon: <I.Instagram size={22} />, label: "Instagram", value: site.contacts.instagram, href: site.contacts.instagramLink },
    { icon: <I.TikTok size={22} />, label: "TikTok", value: site.contacts.tiktok, href: site.contacts.tiktokLink },
    { icon: <I.YouTube size={22} />, label: "YouTube", value: site.contacts.youtube, href: site.contacts.youtubeLink },
    { icon: <I.Mail size={22} />, label: "Email", value: site.contacts.email, href: `mailto:${site.contacts.email}` },
  ];

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Контакты" }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">Контакты</h1>
      <p className="mt-2 max-w-xl text-muted">
        Напишите нам удобным способом — поможем подобрать товар, оформить и отправить заказ.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-4 rounded-xl2 border border-line bg-surface p-5 transition-shadow hover:shadow-lift"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">{c.icon}</span>
            <div>
              <p className="text-xs uppercase tracking-wider text-faint">{c.label}</p>
              <p className="text-sm font-medium text-ink">{c.value}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="card flex items-start gap-4 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent"><I.Phone size={22} /></span>
          <div>
            <p className="text-xs uppercase tracking-wider text-faint">Телефон в Корее</p>
            <p className="text-sm font-medium text-ink">{site.contacts.koreaPhone}</p>
          </div>
        </div>
        <div className="card flex items-start gap-4 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent"><I.Pin size={22} /></span>
          <div>
            <p className="text-xs uppercase tracking-wider text-faint">Склад отправки</p>
            <p className="text-sm font-medium text-ink">{site.contacts.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
