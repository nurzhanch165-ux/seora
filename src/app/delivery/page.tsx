import Link from "next/link";
import { site } from "@/data/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import * as I from "@/components/icons";

export const metadata = { title: "Доставка и оплата" };

export default function DeliveryPage() {
  const steps = [
    { n: "01", title: "Оформление заказа", text: "Добавьте товары в корзину и оформите заказ на сайте." },
    { n: "02", title: "Оплата по реквизитам", text: "Оплатите сумму заказа в выбранной валюте." },
    { n: "03", title: "Подтверждение", text: "Загрузите скриншот оплаты в личном кабинете." },
    { n: "04", title: "Отгрузка", text: "Заказ собирается на складе в Корее и отправляется выбранным способом." },
  ];

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Доставка и оплата" }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">Доставка по странам</h1>
      <p className="mt-2 max-w-2xl text-muted">{site.shippingNote}</p>

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
          title="Казахстан"
          methods={[
            { name: "Авиа (K)", price: "9 $/кг", desc: "Быстрая авиадоставка" },
            { name: "Карго (CK)", price: "4 $/кг", desc: "Экономичная карго-доставка" },
          ]}
        />
        <CountryCard
          flag="EU"
          title="Европа"
          methods={[
            { name: "EMS", price: "Почта Кореи", desc: "Единственный способ — EMS из Южной Кореи" },
          ]}
          note="Для Европы доступен только EMS. Авиа и карго не предлагаются."
        />
        <CountryCard
          flag="KR"
          title="Южная Корея"
          methods={[
            { name: "Внутри страны", price: "По Корее", desc: "Доставка по адресу внутри Южной Кореи" },
          ]}
        />
      </div>

      <div className="mt-10 card p-6">
        <h2 className="flex items-center gap-2 text-lg font-medium"><I.Shield size={20} className="text-accent" /> Оплата и валюта</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>Базовые цены указаны в корейских вонах (KRW)</li>
          <li>Можно выбрать отображение в KZT, USD или EUR (+3% комиссия конвертации)</li>
          <li><span className="text-ink">Банк:</span> {site.payment.bank}</li>
          <li><span className="text-ink">Карта:</span> {site.payment.cardNumber}</li>
          <li><span className="text-ink">Получатель:</span> {site.payment.cardHolder}</li>
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/c/cosmetics" className="btn-primary">Перейти в каталог</Link>
        <Link href="/contacts" className="btn-outline">Связаться с нами</Link>
      </div>
    </div>
  );
}

function CountryCard({
  flag,
  title,
  methods,
  note,
}: {
  flag: string;
  title: string;
  methods: { name: string; price: string; desc: string }[];
  note?: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">{flag}</span>
        <h2 className="text-lg font-medium text-ink">{title}</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {methods.map((m) => (
          <li key={m.name} className="rounded-xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-ink">{m.name}</span>
              <span className="text-xs font-semibold text-accent">{m.price}</span>
            </div>
            <p className="mt-1 text-xs text-muted">{m.desc}</p>
          </li>
        ))}
      </ul>
      {note && <p className="mt-3 text-xs text-muted">{note}</p>}
    </div>
  );
}
