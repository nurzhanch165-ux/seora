import Link from "next/link";
import { sections } from "@/data/categories";
import { brands } from "@/data/brands";
import { products } from "@/data/products";
import { site } from "@/data/site";
import { Glyph } from "@/components/Glyph";
import { ProductVisual } from "@/components/ProductVisual";
import { FeaturedGrid } from "@/components/FeaturedGrid";
import { SectionHeading } from "@/components/SectionHeading";
import * as I from "@/components/icons";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Sections />
      <CategoryStrip />

      <section className="container-site mt-24">
        <SectionHeading eyebrow="Выбор покупателей" title="Хиты продаж" href="/sale" hrefLabel="Все популярные" />
        <FeaturedGrid kind="hit" />
      </section>

      <Advantages />

      <section className="container-site mt-24">
        <SectionHeading eyebrow="Только что приехали" title="Новинки каталога" href="/c/cosmetics" />
        <FeaturedGrid kind="new" />
      </section>

      <SaleBanner />

      <section className="container-site mt-24">
        <SectionHeading eyebrow="Выгодно" title="Товары по акции" href="/sale" />
        <FeaturedGrid kind="sale" />
      </section>

      <BrandsRow />
      <RegisterCta />
    </>
  );
}

function Hero() {
  const tiles = products.slice(0, 3);
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sand/70 via-paper to-paper" />
      <div className="container-site grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        <div className="animate-fadeUp">
          <p className="eyebrow mb-4">Прямо из Сеула · по всему миру</p>
          <h1 className="h-display text-4xl sm:text-5xl lg:text-[58px]">
            Корейская косметика <br />и здоровье — <span className="text-accent">с заботой</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            {site.description} Выбирайте оригинальные средства, формируйте заказ и оплачивайте удобным способом.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/c/cosmetics" className="btn-primary">
              Перейти в каталог
              <I.ArrowRight size={18} />
            </Link>
            <Link href="/register" className="btn-outline">Регистрация</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
            <Trust icon={<I.Shield size={18} />} text="Только оригинал" />
            <Trust icon={<I.Truck size={18} />} text="Доставка по миру" />
            <Trust icon={<I.Sparkle size={18} />} text="Прямые поставки" />
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <ProductVisual tone={tiles[0].tone} glyph={tiles[0].glyph} className="aspect-[3/4] rounded-xl2 shadow-soft" glyphSize={64} />
            <div className="mt-10 grid gap-4">
              <ProductVisual tone={tiles[1].tone} glyph={tiles[1].glyph} className="aspect-square rounded-xl2 shadow-soft" glyphSize={52} />
              <ProductVisual tone={tiles[2].tone} glyph={tiles[2].glyph} className="aspect-[4/5] rounded-xl2 shadow-soft" glyphSize={52} />
            </div>
          </div>
          <div className="absolute -bottom-4 left-6 flex items-center gap-3 rounded-2xl border border-line bg-surface/95 px-5 py-3 shadow-lift backdrop-blur">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
              <I.StarFilled size={18} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">4.9 из 5</p>
              <p className="text-xs text-muted">более 2000 отзывов</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-accent">{icon}</span>
      {text}
    </span>
  );
}

function Sections() {
  return (
    <section className="container-site mt-8 grid gap-5 md:grid-cols-2">
      {sections.map((s) => (
        <Link
          key={s.slug}
          href={`/c/${s.slug}`}
          className="group relative overflow-hidden rounded-xl2 border border-line bg-surface p-8 transition-shadow hover:shadow-lift"
        >
          <div className="relative z-10 max-w-[60%]">
            <p className="eyebrow mb-2">{s.tagline}</p>
            <h3 className="h-display text-3xl">{s.name}</h3>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink group-hover:text-accent">
              Открыть раздел
              <I.ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <div className="pointer-events-none absolute -right-6 -top-6 grid grid-cols-2 gap-3 opacity-90">
            {s.categories.slice(0, 4).map((c) => (
              <span key={c.slug} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Glyph name={c.icon} size={26} />
              </span>
            ))}
          </div>
        </Link>
      ))}
    </section>
  );
}

function CategoryStrip() {
  const cats = sections.flatMap((s) => s.categories.map((c) => ({ ...c, section: s.slug }))).slice(0, 12);
  return (
    <section className="container-site mt-24">
      <SectionHeading eyebrow="Категории" title="Куда заглянуть" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {cats.map((c) => (
          <Link
            key={`${c.section}-${c.slug}`}
            href={`/c/${c.section}/${c.slug}`}
            className="group flex flex-col items-center gap-3 rounded-xl2 border border-line bg-surface px-3 py-6 text-center transition-colors hover:border-accent/40"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent transition-transform group-hover:scale-110">
              <Glyph name={c.icon} size={26} />
            </span>
            <span className="text-xs leading-tight text-ink">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Advantages() {
  const items = [
    { icon: <I.Shield size={24} />, title: "Оригинальная продукция", text: "Сертификаты GMP и контроль качества на каждый товар." },
    { icon: <I.Truck size={24} />, title: "Доставка по миру", text: "Отправки формируются дважды в неделю со склада в Корее." },
    { icon: <I.Box size={24} />, title: "Заказ в Excel", text: "Готовый файл заказа со всеми позициями и суммой." },
    { icon: <I.Whatsapp size={24} />, title: "Связь как удобно", text: "WhatsApp, Telegram и личный кабинет для статуса заказа." },
  ];
  return (
    <section className="container-site mt-24">
      <div className="grid gap-px overflow-hidden rounded-xl2 border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="bg-surface p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">{it.icon}</span>
            <h3 className="mt-4 text-base font-medium text-ink">{it.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SaleBanner() {
  return (
    <section className="container-site mt-24">
      <div className="relative overflow-hidden rounded-xl2 bg-ink px-8 py-14 text-paper md:px-14 md:py-16">
        <div className="relative z-10 max-w-xl">
          <p className="eyebrow mb-3 text-accent">Сезонная акция</p>
          <h2 className="h-display text-3xl md:text-4xl">До −30% на уход и нутрицевтики</h2>
          <p className="mt-4 text-paper/70">
            Подобрали лучшие средства для кожи и здоровья по специальным ценам. Количество ограничено.
          </p>
          <Link href="/sale" className="btn-accent mt-7">
            Смотреть акции
            <I.ArrowRight size={18} />
          </Link>
        </div>
        <I.Sparkle size={260} className="pointer-events-none absolute -right-10 -top-10 text-paper/5" strokeWidth={0.5} />
      </div>
    </section>
  );
}

function BrandsRow() {
  return (
    <section className="container-site mt-24">
      <SectionHeading eyebrow="Бренды" title="Корейские бренды" href="/brands" />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
        {brands.slice(0, 10).map((b) => (
          <Link
            key={b.slug}
            href={`/brands/${b.slug}`}
            className="flex h-24 items-center justify-center bg-surface px-4 text-center text-sm font-medium tracking-wide text-ink/70 transition-colors hover:bg-accent-soft hover:text-accent"
          >
            {b.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

function RegisterCta() {
  return (
    <section className="container-site mt-24">
      <div className="grid items-center gap-8 rounded-xl2 border border-line bg-surface p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
        <div>
          <p className="eyebrow mb-2">Личный кабинет</p>
          <h2 className="h-display text-3xl">Зарегистрируйтесь и получайте больше</h2>
          <p className="mt-4 max-w-lg text-muted">
            История заказов, статусы доставки, скачивание Excel-файла и уведомления об акциях, новинках и прямых эфирах.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary">Создать аккаунт</Link>
            <Link href="/login" className="btn-ghost">У меня уже есть аккаунт</Link>
          </div>
        </div>
        <ul className="space-y-3">
          {["История и статусы заказов", "Excel-файл заказа в один клик", "Загрузка подтверждения оплаты", "Уведомления об акциях и новинках"].map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink">
              <I.Check size={18} className="text-success" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
