"use client";

import Link from "next/link";
import { site } from "@/data/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useT, useSiteText } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

export function AboutPageClient() {
  const tr = useT();
  const trSite = useSiteText();

  const values = [
    { icon: <I.Shield size={22} />, title: tr("about.value.original"), text: tr("about.value.originalText") },
    { icon: <I.Sparkle size={22} />, title: tr("about.value.curation"), text: tr("about.value.curationText") },
    { icon: <I.Truck size={22} />, title: tr("about.value.delivery"), text: tr("about.value.deliveryText") },
    { icon: <I.Whatsapp size={22} />, title: tr("about.value.support"), text: tr("about.value.supportText") },
  ];

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("about.title") }]} />

      <div className="mt-6 overflow-hidden rounded-xl2 bg-gradient-to-br from-sand to-paper p-8 md:p-14">
        <p className="eyebrow mb-3">{tr("about.title")}</p>
        <h1 className="h-display max-w-2xl text-3xl md:text-5xl">
          {trSite("aboutHeroTitle", { name: site.name })}
        </h1>
        <p className="mt-5 max-w-2xl text-muted">{trSite("description")}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <div key={v.title} className="card p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">{v.icon}</span>
            <h3 className="mt-4 text-base font-medium text-ink">{v.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/c/cosmetics" className="btn-primary">{tr("about.browseCatalog")}</Link>
        <Link href="/contacts" className="btn-outline">{tr("contacts.title")}</Link>
      </div>
    </div>
  );
}
