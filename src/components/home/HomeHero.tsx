"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

export function HomeHero() {
  const tr = useT();
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <Image
        src="/images/hero-korea.png"
        alt="SonyShopKorea"
        fill
        priority
        className="object-cover object-[center_30%]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="container-site relative flex min-h-[100dvh] flex-col justify-end pb-12 pt-24 sm:pb-16 sm:pt-28 lg:pb-20">
        <div className="max-w-xl lg:max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest2 text-accent">
            {tr("hero.eyebrow")}
          </p>
          <h1 className="h-display text-4xl text-pearl sm:text-5xl lg:text-6xl">
            {tr("hero.title")}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-pearl/75">
            {tr("hero.text")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/c/cosmetics" className="btn-accent">
              {tr("hero.cta")}
              <I.ArrowRight size={18} />
            </Link>
            <Link href="/register" className="btn-light">
              {tr("hero.register")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeSectionTitle({ titleKey }: { titleKey: string }) {
  const tr = useT();
  return <>{tr(titleKey)}</>;
}
