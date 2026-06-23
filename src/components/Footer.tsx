"use client";

import Link from "next/link";
import { sections } from "@/data/categories";
import { site } from "@/data/site";
import { useT, useLocale, useSiteText } from "@/hooks/useTranslation";
import { sectionLabel, categoryLabel } from "@/lib/catalogI18n";
import * as I from "./icons";

export function Footer() {
  const tr = useT();
  const trSite = useSiteText();
  const locale = useLocale();

  return (
    <footer className="mt-8 border-t border-line bg-surface">
      <div className="container-site grid min-w-0 grid-cols-1 gap-10 py-14 sm:grid-cols-2 sm:py-16 md:grid-cols-4 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-pearl">
              SK
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">{site.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{trSite("description")}</p>
          <div className="mt-6 flex items-center gap-2">
            <Social href={site.contacts.whatsappLink} label="WhatsApp">
              <I.Whatsapp size={18} />
            </Social>
            <Social href={site.contacts.telegramLink} label="Telegram">
              <I.Telegram size={18} />
            </Social>
            <Social href={site.contacts.instagramLink} label="Instagram">
              <I.Instagram size={18} />
            </Social>
            <Social href={site.contacts.tiktokLink} label="TikTok">
              <I.TikTok size={18} />
            </Social>
            <Social href={site.contacts.youtubeLink} label="YouTube">
              <I.YouTube size={18} />
            </Social>
          </div>
        </div>

        {sections.map((s) => (
          <div key={s.slug}>
            <h4 className="mb-4 font-display text-sm font-semibold text-ink">{sectionLabel(s.slug, locale)}</h4>
            <ul className="space-y-2.5">
              {s.categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/c/${s.slug}/${c.slug}`}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {categoryLabel(s.slug, c.slug, locale)}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={`/c/${s.slug}`} className="text-sm font-medium text-accent">
                  {tr("footer.allCategories")}
                </Link>
              </li>
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-4 font-display text-sm font-semibold text-ink">{tr("footer.buyers")}</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            <li><Link href="/delivery" className="hover:text-accent">{tr("footer.deliveryPay")}</Link></li>
            <li><Link href="/about" className="hover:text-accent">{tr("footer.about")}</Link></li>
            <li><Link href="/sale" className="hover:text-accent">{tr("footer.sale")}</Link></li>
            <li><Link href="/streams" className="hover:text-accent">{tr("nav.streams")}</Link></li>
            <li><Link href="/contacts" className="hover:text-accent">{tr("footer.contacts")}</Link></li>
            <li><Link href="/login" className="hover:text-accent">{tr("footer.account")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-semibold text-ink">{tr("footer.contacts")}</h4>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2">
              <I.Whatsapp size={16} className="text-accent" />
              {site.contacts.whatsapp}
            </li>
            <li className="flex items-center gap-2">
              <I.Telegram size={16} className="text-accent" />
              {site.contacts.telegram}
            </li>
            <li className="flex items-start gap-2 break-all">
              <I.Mail size={16} className="mt-0.5 shrink-0 text-accent" />
              {site.contacts.email}
            </li>
            <li className="flex items-start gap-2">
              <I.Pin size={16} className="mt-0.5 text-accent" />
              {tr("contacts.address")}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-faint md:flex-row md:text-left">
          <span>{tr("footer.copyright", { year: new Date().getFullYear(), name: site.name })}</span>
          <Link href="/privacy" className="max-w-md leading-relaxed hover:text-accent">{tr("footer.privacyLink")}</Link>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-all hover:border-accent hover:bg-accent hover:text-white"
    >
      {children}
    </a>
  );
}
