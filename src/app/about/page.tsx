import Link from "next/link";
import { site } from "@/data/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import * as I from "@/components/icons";

export const metadata = { title: "О компании" };

export default function AboutPage() {
  const values = [
    { icon: <I.Shield size={22} />, title: "Только оригинал", text: "Прямые поставки и сертификаты качества на каждую позицию." },
    { icon: <I.Sparkle size={22} />, title: "Тщательный отбор", text: "Подбираем средства, которые действительно работают." },
    { icon: <I.Truck size={22} />, title: "Бережная доставка", text: "Аккуратная упаковка и отправка по всему миру." },
    { icon: <I.Whatsapp size={22} />, title: "Поддержка", text: "Поможем с выбором в WhatsApp и Telegram." },
  ];

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "О компании" }]} />

      <div className="mt-6 overflow-hidden rounded-xl2 bg-gradient-to-br from-sand to-paper p-8 md:p-14">
        <p className="eyebrow mb-3">О компании</p>
        <h1 className="h-display max-w-2xl text-3xl md:text-5xl">{site.name} — корейский уход и здоровье с доставкой по миру</h1>
        <p className="mt-5 max-w-2xl text-muted">{site.description}</p>
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
        <Link href="/c/cosmetics" className="btn-primary">Смотреть каталог</Link>
        <Link href="/contacts" className="btn-outline">Контакты</Link>
      </div>
    </div>
  );
}
