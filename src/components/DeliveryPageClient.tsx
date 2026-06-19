"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useT, useSiteText } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

export function DeliveryPageClient() {
  const tr = useT();
  const trSite = useSiteText();

  const steps = [
    { n: "01", title: tr("delivery.step1.title"), text: tr("delivery.step1.text") },
    { n: "02", title: tr("delivery.step2.title"), text: tr("delivery.step2.text") },
    { n: "03", title: tr("delivery.step3.title"), text: tr("delivery.step3.text") },
    { n: "04", title: tr("delivery.step4.title"), text: tr("delivery.step4.text") },
  ];

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("delivery.breadcrumb") }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">{tr("delivery.title")}</h1>
      <p className="mt-2 max-w-2xl text-muted">{trSite("shippingNote")}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="card p-6">
            <span className="font-serif text-2xl text-accent">{s.n}</span>
            <h3 className="mt-3 text-base font-medium text-ink">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <CountryCard
          flag="KZ"
          title={tr("delivery.kz")}
          methods={[
            { name: tr("delivery.avia"), price: tr("delivery.pricePerKg", { price: "9" }), desc: tr("delivery.aviaDesc") },
            { name: tr("delivery.cargo"), price: tr("delivery.pricePerKg", { price: "4" }), desc: tr("delivery.cargoDesc") },
          ]}
        />
        <CountryCard
          flag="EU"
          title={tr("delivery.eu")}
          methods={[{ name: tr("delivery.ems"), price: "EMS", desc: tr("delivery.emsDesc") }]}
        />
        <CountryCard
          flag="KR"
          title={tr("delivery.kr")}
          methods={[{ name: tr("delivery.domestic"), price: "—", desc: tr("delivery.domesticDesc") }]}
        />
      </div>

      <div className="mt-12 card p-6 md:p-8">
        <h2 className="text-lg font-medium text-ink">{tr("delivery.paymentTitle")}</h2>
        <p className="mt-2 text-sm text-muted">{tr("delivery.paymentText")}</p>
        <Link href="/checkout" className="btn-primary mt-4 inline-flex">
          {tr("cart.checkout")}
          <I.ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

function CountryCard({
  flag,
  title,
  methods,
}: {
  flag: string;
  title: string;
  methods: { name: string; price: string; desc: string }[];
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">{flag}</span>
        <h3 className="text-lg font-medium text-ink">{title}</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {methods.map((m) => (
          <li key={m.name} className="rounded-xl bg-pearl px-4 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium text-ink">{m.name}</span>
              <span className="text-sm text-accent">{m.price}</span>
            </div>
            <p className="mt-1 text-xs text-muted">{m.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
