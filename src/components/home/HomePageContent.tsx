"use client";

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
import { useT, useLocale, useSiteText } from "@/hooks/useTranslation";
import { sectionLabel, sectionTagline } from "@/lib/catalogI18n";
import * as I from "@/components/icons";

const BRAND_STRIP = ["COSRX", "Laneige", "Innisfree", "Sulwhasoo", "Dr.Jart+", "Missha", "Etude", "Nature Republic"];

export function HomePageContent() {
  return (
    <>
      <HomeHero />
      <StreamsPromo />
      <BrandMarquee />
      <AboutBlock />
      <CategoriesBlock />
      <WhyUsBlock />
      <HowToOrderBlock />

      <section className="container-site mt-16 sm:mt-20">
        <Reveal>
          <HomeSectionHeading titleKey="home.hits" href="/sale" hrefLabelKey="home.hits" />
        </Reveal>
        <FeaturedGrid kind="hit" />
      </section>

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
  const tr = useT();
  const locale = useLocale();

  return (
    <section className="container-site mt-20 sm:mt-28">
      <Reveal>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card lg:col-span-5">
            <Image
              src="/images/about-health.png"
              alt={tr("home.about.title")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
          <div className="lg:col-span-7">
            <h2 className="h-display text-3xl sm:text-4xl lg:text-[2.75rem]">{tr("home.aboutHeading")}</h2>
            <p className="mt-5 max-w-[55ch] text-base leading-relaxed text-muted">{tr("home.aboutText")}</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
              {sections.map((s) => (
                <Link
                  key={s.slug}
                  href={`/c/${s.slug}`}
                  className="group border border-line bg-surface p-5 transition-all hover:border-accent/40 hover:shadow-lift"
                >
                  <p className="text-[10px] uppercase tracking-wider text-faint">{sectionTagline(s.slug, locale)}</p>
                  <p className="mt-2 font-display text-lg font-semibold text-ink group-hover:text-accent">
                    {sectionLabel(s.slug, locale)}
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
  const tr = useT();
  const HOME_CATEGORIES = [
    { slug: "cosmetics", nameKey: "home.category.cosmetics", icon: "Sparkle" as const, href: "/c/cosmetics" },
    { slug: "vitamins", nameKey: "home.category.vitamins", icon: "Pill" as const, href: "/c/health" },
    { slug: "health", nameKey: "home.category.health", icon: "HealthHeart" as const, href: "/c/health" },
    { slug: "home", nameKey: "home.category.home", icon: "Jar" as const, href: "/c/home" },
    { slug: "clothes", nameKey: "home.category.clothes", icon: "Woman" as const, href: "/c/clothes" },
    { slug: "shoes", nameKey: "home.category.shoes", icon: "Man" as const, href: "/c/shoes" },
  ];

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
                <span className="line-clamp-2 text-sm font-medium text-ink">{tr(c.nameKey)}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUsBlock() {
  const tr = useT();
  const WHY_US = [
    { icon: <I.Truck size={22} />, title: tr("home.why.direct"), text: tr("home.why.directText") },
    { icon: <I.Whatsapp size={22} />, title: tr("home.why.support"), text: tr("home.why.supportText") },
    { icon: <I.Shield size={22} />, title: tr("home.why.shipping"), text: tr("home.why.shippingText") },
    { icon: <I.Box size={22} />, title: tr("home.why.combo"), text: tr("home.why.comboText") },
    { icon: <I.Sparkle size={22} />, title: tr("home.why.fresh"), text: tr("home.why.freshText") },
    { icon: <I.StarFilled size={22} />, title: tr("home.why.rare"), text: tr("home.why.rareText") },
  ];

  return (
    <section className="section-dark mt-20 sm:mt-28">
      <div className="container-site py-16 sm:py-24">
        <Reveal>
          <h2 className="h-display max-w-lg text-3xl text-pearl sm:text-4xl">{tr("home.whyHeading")}</h2>
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
  const tr = useT();
  const steps = [
    tr("home.how.register"),
    tr("home.how.choose"),
    tr("home.how.cart"),
    tr("home.how.recipient"),
    tr("home.how.delivery"),
    tr("home.how.pay"),
    tr("home.how.pack"),
    tr("home.how.ship"),
  ];

  return (
    <section className="container-site mt-20 sm:mt-28">
      <Reveal>
        <SectionHeading title={tr("home.how.title")} />
      </Reveal>
      <div className="relative">
        <div className="absolute left-4 top-0 hidden h-full w-px bg-line lg:block" aria-hidden="true" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
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
        <Link href="/register" className="btn-primary">{tr("home.how.registerBtn")}</Link>
        <Link href="/delivery" className="btn-outline">{tr("home.how.deliveryBtn")}</Link>
      </Reveal>
    </section>
  );
}

function StreamsPromo() {
  const tr = useT();

  return (
    <section className="container-site mt-10 sm:mt-14">
      <Reveal>
        <div className="relative min-h-[320px] overflow-hidden rounded-card sm:min-h-[380px]">
          <Image src="/images/streams-bg.png" alt="" fill className="object-cover" sizes="(max-width: 1280px) 100vw, 1280px" />
          <div className="absolute inset-0 bg-ink/70" />
          <div className="relative flex min-h-[320px] flex-col justify-end p-8 sm:min-h-[380px] sm:p-12 lg:max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">{tr("home.streams.eyebrow")}</p>
            <h2 className="mt-3 h-display text-2xl text-pearl sm:text-3xl">{tr("home.streams.title")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-pearl/70 sm:text-base">{tr("home.streams.text")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/streams" className="btn-accent">{tr("home.streams.cta")}</Link>
              <a href={site.contacts.tiktokLink} target="_blank" rel="noreferrer" className="btn-light">TikTok</a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function SaleBanner() {
  const tr = useT();

  return (
    <section className="container-site mt-20 sm:mt-28">
      <Reveal>
        <div className="grid overflow-hidden rounded-card border border-line bg-surface lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <h2 className="h-display text-2xl sm:text-3xl">{tr("home.sale.title")}</h2>
            <p className="mt-4 max-w-md text-muted">{tr("home.sale.text")}</p>
            <Link href="/sale" className="btn-accent mt-8 w-fit">
              {tr("home.sale.cta")}
              <I.ArrowRight size={18} />
            </Link>
          </div>
          <div className="relative min-h-[200px] bg-accent-soft lg:min-h-[280px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-[120px] font-bold leading-none text-accent/15 sm:text-[160px]">−30%</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function RegisterCta() {
  const tr = useT();
  const features = [
    tr("home.cta.feature1"),
    tr("home.cta.feature2"),
    tr("home.cta.feature3"),
    tr("home.cta.feature4"),
  ];

  return (
    <section className="container-site mt-20 pb-20 sm:mt-28 sm:pb-28">
      <Reveal>
        <div className="overflow-hidden rounded-card bg-ink text-pearl">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:p-16">
            <div>
              <h2 className="h-display text-2xl sm:text-3xl lg:text-4xl">{tr("home.cta.title")}</h2>
              <p className="mt-4 max-w-md text-pearl/65">{tr("home.cta.text")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="btn-accent">{tr("home.cta.create")}</Link>
                <Link href="/login" className="btn-light">{tr("home.cta.login")}</Link>
              </div>
            </div>
            <ul className="space-y-3">
              {features.map((t) => (
                <li key={t} className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3.5 text-sm">
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
