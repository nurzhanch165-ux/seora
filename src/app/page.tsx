import Link from "next/link";
import Image from "next/image";
import { sections } from "@/data/categories";
import { site } from "@/data/site";
import { Glyph } from "@/components/Glyph";
import { FeaturedGrid } from "@/components/FeaturedGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { Reveal } from "@/components/Reveal";
import * as I from "@/components/icons";

const HOME_CATEGORIES = [
  { slug: "cosmetics", name: "Косметика", icon: "Sparkle" as const, href: "/c/cosmetics" },
  { slug: "vitamins", name: "Витамины и БАДы", icon: "Pill" as const, href: "/c/health" },
  { slug: "health", name: "Товары для здоровья", icon: "HealthHeart" as const, href: "/c/health" },
  { slug: "home", name: "Товары для дома", icon: "Jar" as const, href: "/c/home" },
  { slug: "clothes", name: "Одежда", icon: "Woman" as const, href: "/c/clothes" },
  { slug: "shoes", name: "Обувь", icon: "Man" as const, href: "/c/shoes" },
];

const WHY_US = [
  { icon: <I.Truck size={22} />, title: "Напрямую из Южной Кореи", text: "Закупка и отправка со склада в Сеуле." },
  { icon: <I.Whatsapp size={22} />, title: "Поддержка на русском", text: "Поможем с выбором и оформлением." },
  { icon: <I.Shield size={22} />, title: "Международная доставка", text: "Казахстан, Европа, Корея и другие страны." },
  { icon: <I.Box size={22} />, title: "Сборный заказ", text: "Разные категории в одной корзине." },
  { icon: <I.Sparkle size={22} />, title: "Свежие новинки", text: "Регулярно пополняем каталог." },
  { icon: <I.StarFilled size={22} />, title: "Редкие позиции", text: "То, чего нет в обычных магазинах." },
];

const HOW_TO_ORDER = [
  "Зарегистрируйтесь на сайте",
  "Выберите товары",
  "Добавьте в корзину",
  "Укажите данные получателя",
  "Выберите доставку",
  "Оплатите заказ",
  "Сборка на складе",
  "Отправка и трекинг",
];

const BRAND_STRIP = ["COSRX", "Laneige", "Innisfree", "Sulwhasoo", "Dr.Jart+", "Missha", "Etude", "Nature Republic"];

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <BrandMarquee />
      <AboutBlock />
      <CategoriesBlock />
      <WhyUsBlock />
      <HowToOrderBlock />

      <section className="container-site mt-20 sm:mt-28">
        <Reveal>
          <HomeSectionHeading titleKey="home.hits" href="/sale" hrefLabelKey="home.hits" />
        </Reveal>
        <FeaturedGrid kind="hit" />
      </section>

      <StreamsPromo />

      <section className="container-site mt-20 sm:mt-28">
        <Reveal>
          <HomeSectionHeading titleKey="home.new" href="/c/cosmetics" />
        </Reveal>
        <FeaturedGrid kind="new" />
      </section>

      <SaleBanner />
      <RegisterCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <Image
        src="/images/hero-korea.png"
        alt="Корейская косметика SonyShopKorea"
        fill
        priority
        className="object-cover object-[center_30%]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="container-site relative flex min-h-[100dvh] flex-col justify-end pb-12 pt-24 sm:pb-16 sm:pt-28 lg:pb-20">
        <div className="max-w-xl lg:max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest2 text-accent">
            Прямо из Сеула
          </p>
          <h1 className="h-display text-4xl text-pearl sm:text-5xl lg:text-6xl">
            Корейская красота с доставкой по миру
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-pearl/75">
            Косметика, витамины и товары для здоровья. Оригинальная продукция из Южной Кореи.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/c/cosmetics" className="btn-accent">
              В каталог
              <I.ArrowRight size={18} />
            </Link>
            <Link href="/register" className="btn-light">
              Регистрация
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandMarquee() {
  const items = [...BRAND_STRIP, ...BRAND_STRIP];
  return (
    <section className="border-y border-line bg-surface py-4" aria-hidden="true">
      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee gap-12 px-4">
          {items.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="whitespace-nowrap font-display text-sm font-semibold tracking-widest2 text-ink/30"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutBlock() {
  return (
    <section className="container-site mt-20 sm:mt-28">
      <Reveal>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card lg:col-span-5">
            <Image
              src="/images/about-health.png"
              alt="Товары для здоровья из Кореи"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
          <div className="lg:col-span-7">
            <h2 className="h-display text-3xl sm:text-4xl lg:text-[2.75rem]">SonyShopKorea</h2>
            <p className="mt-5 max-w-[55ch] text-base leading-relaxed text-muted">
              Магазин корейских товаров с доставкой из Южной Кореи в Казахстан, Европу и другие страны.
              Косметика, витамины, здоровье, дом, одежда и обувь.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              {sections.map((s) => (
                <Link
                  key={s.slug}
                  href={`/c/${s.slug}`}
                  className="group border border-line bg-surface p-5 transition-all hover:border-accent/40 hover:shadow-lift"
                >
                  <p className="text-[10px] uppercase tracking-wider text-faint">{s.tagline}</p>
                  <p className="mt-2 font-display text-lg font-semibold text-ink group-hover:text-accent">
                    {s.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function CategoriesBlock() {
  return (
    <section className="section-muted mt-20 sm:mt-28">
      <div className="container-site py-16 sm:py-20">
        <Reveal>
          <HomeSectionHeading titleKey="home.categories.title" />
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {HOME_CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60}>
              <Link
                href={c.href}
                className="group flex min-w-0 flex-col items-center gap-3 border border-line bg-surface p-5 text-center transition-all hover:border-accent/30 hover:shadow-soft"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-105">
                  <Glyph name={c.icon} size={26} />
                </span>
                <span className="line-clamp-2 text-sm font-medium text-ink">{c.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUsBlock() {
  return (
    <section className="section-dark mt-20 sm:mt-28">
      <div className="container-site py-16 sm:py-24">
        <Reveal>
          <h2 className="h-display max-w-lg text-3xl text-pearl sm:text-4xl">
            Почему покупают у нас
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-px overflow-hidden border border-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map((it, i) => (
            <Reveal key={it.title} delay={i * 50}>
              <div className="bg-slate/80 p-7 sm:p-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                  {it.icon}
                </span>
                <h3 className="mt-5 font-display text-base font-semibold text-pearl">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-pearl/60">{it.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowToOrderBlock() {
  return (
    <section className="container-site mt-20 sm:mt-28">
      <Reveal>
        <SectionHeading title="Как сделать заказ" />
      </Reveal>
      <div className="relative">
        <div className="absolute left-4 top-0 hidden h-full w-px bg-line lg:block" aria-hidden="true" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_TO_ORDER.map((step, i) => (
            <Reveal key={step} delay={i * 40}>
              <div className="relative border border-line bg-surface p-6 lg:pl-10">
                <span className="font-display text-2xl font-bold text-accent/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-sm font-medium leading-snug text-ink">{step}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal className="mt-10 flex flex-wrap gap-3">
        <Link href="/register" className="btn-primary">
          Зарегистрироваться
        </Link>
        <Link href="/delivery" className="btn-outline">
          Узнать о доставке
        </Link>
      </Reveal>
    </section>
  );
}

function StreamsPromo() {
  return (
    <section className="container-site mt-20 sm:mt-28">
      <Reveal>
        <div className="relative min-h-[320px] overflow-hidden rounded-card sm:min-h-[380px]">
          <Image
            src="/images/streams-bg.png"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-ink/70" />
          <div className="relative flex min-h-[320px] flex-col justify-end p-8 sm:min-h-[380px] sm:p-12 lg:max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">Прямые эфиры</p>
            <h2 className="mt-3 h-display text-2xl text-pearl sm:text-3xl">Раздел «Стримы»</h2>
            <p className="mt-4 text-sm leading-relaxed text-pearl/70 sm:text-base">
              Товары с эфиров доступны 24 часа после стрима. Следите за новинками в TikTok и Telegram.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/streams" className="btn-accent">
                Смотреть стримы
              </Link>
              <a href={site.contacts.tiktokLink} target="_blank" rel="noreferrer" className="btn-light">
                TikTok
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function SaleBanner() {
  return (
    <section className="container-site mt-20 sm:mt-28">
      <Reveal>
        <div className="grid overflow-hidden rounded-card border border-line bg-surface lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <h2 className="h-display text-2xl sm:text-3xl">До −30% на уход и нутрицевтики</h2>
            <p className="mt-4 max-w-md text-muted">
              Подобрали лучшие средства для кожи и здоровья по специальным ценам.
            </p>
            <Link href="/sale" className="btn-accent mt-8 w-fit">
              Смотреть акции
              <I.ArrowRight size={18} />
            </Link>
          </div>
          <div className="relative min-h-[200px] bg-accent-soft lg:min-h-[280px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-[120px] font-bold leading-none text-accent/15 sm:text-[160px]">
                −30%
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function RegisterCta() {
  return (
    <section className="container-site mt-20 pb-20 sm:mt-28 sm:pb-28">
      <Reveal>
        <div className="overflow-hidden rounded-card bg-ink text-pearl">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:p-16">
            <div>
              <h2 className="h-display text-2xl sm:text-3xl lg:text-4xl">
                Личный кабинет для ваших заказов
              </h2>
              <p className="mt-4 max-w-md text-pearl/65">
                История заказов, Excel-файл, статусы доставки и уведомления об акциях.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="btn-accent">
                  Создать аккаунт
                </Link>
                <Link href="/login" className="btn-light">
                  Войти
                </Link>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                "История и статусы заказов",
                "Excel-файл заказа в один клик",
                "Загрузка подтверждения оплаты",
                "Уведомления об акциях и стримах",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3.5 text-sm"
                >
                  <I.Check size={18} className="shrink-0 text-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
