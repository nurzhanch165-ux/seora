import Link from "next/link";
import { site } from "@/data/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import * as I from "@/components/icons";

export const metadata = { title: "Доставка и оплата" };

export default function DeliveryPage() {
  const steps = [
    { n: "01", title: "Оформление заказа", text: "Добавьте товары в корзину и нажмите «Сформировать заказ» — система создаст Excel-файл." },
    { n: "02", title: "Оплата по реквизитам", text: "Вы видите сумму и реквизиты. Оплатите удобным способом." },
    { n: "03", title: "Подтверждение", text: "Загрузите скриншот оплаты в личном кабинете — менеджер подтвердит заказ." },
    { n: "04", title: "Отгрузка и доставка", text: "Оплаченные заказы попадают в ближайшую отправку. Вы получаете уведомление об отправке." },
  ];

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Доставка и оплата" }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">Доставка и оплата</h1>
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

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-lg font-medium"><I.Truck size={20} className="text-accent" /> Способы доставки</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2"><I.Check size={16} className="text-success" /> Международная почта</li>
            <li className="flex items-center gap-2"><I.Check size={16} className="text-success" /> СДЭК</li>
            <li className="flex items-center gap-2"><I.Check size={16} className="text-success" /> Карго (авиа)</li>
            <li className="flex items-center gap-2"><I.Check size={16} className="text-success" /> Самовывоз со склада</li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-lg font-medium"><I.Shield size={20} className="text-accent" /> Оплата</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li><span className="text-ink">Банк:</span> {site.payment.bank}</li>
            <li><span className="text-ink">Карта:</span> {site.payment.cardNumber}</li>
            <li><span className="text-ink">Получатель:</span> {site.payment.cardHolder}</li>
          </ul>
          <p className="mt-4 text-xs text-muted">{site.payment.note}</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/c/cosmetics" className="btn-primary">Перейти в каталог</Link>
        <Link href="/contacts" className="btn-outline">Связаться с нами</Link>
      </div>
    </div>
  );
}
