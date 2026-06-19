"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sections } from "@/data/categories";
import { site } from "@/data/site";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/store/auth";
import { useHydrated } from "@/lib/useHydrated";
import { LocaleCurrencyBar } from "./LocaleCurrencyBar";
import { useT } from "@/hooks/useTranslation";
import { Glyph } from "./Glyph";
import * as I from "./icons";

export function Header() {
  const tr = useT();
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cartCount = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const currentId = useAuth((s) => s.current?.id ?? null);

  const [mega, setMega] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    setMega(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  function openMega(slug: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(slug);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setMega(null), 120);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  }

  const navPill =
    "inline-flex items-center gap-1 rounded-full border border-transparent px-3.5 py-2 text-[13px] font-medium transition-colors xl:px-4";

  const navLink = (href: string, label: string, accent = false) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`${navPill} ${
          active
            ? "border-ink bg-ink text-pearl"
            : accent
              ? "text-accent hover:border-accent/20 hover:bg-accent-soft"
              : "text-ink/70 hover:border-ink/10 hover:bg-ink/5 hover:text-ink"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <div className="relative sticky top-0 z-40">
      <header className="relative border-b border-line bg-pearl shadow-soft">
        <div className="hidden border-b border-line/60 bg-ink md:block">
          <div className="container-site flex h-9 items-center justify-between text-[11px] text-pearl/80">
            <span>{tr("topbar.tagline")}</span>
            <div className="flex items-center gap-4">
              <LocaleCurrencyBar compact light />
              <a href={site.contacts.whatsappLink} className="link-underline hover:text-white">
                WhatsApp
              </a>
              <a href={site.contacts.telegramLink} className="link-underline hover:text-white">
                Telegram
              </a>
              <Link href="/delivery" className="link-underline hover:text-white">
                Доставка
              </Link>
            </div>
          </div>
        </div>

        <div className="container-site flex h-14 min-w-0 items-center justify-between gap-2 sm:h-16 md:h-[68px]">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              className="icon-btn -ml-1 shrink-0 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Меню"
            >
              <I.Menu />
            </button>
            <Link href="/" className="group flex min-w-0 shrink items-center gap-2.5 select-none">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold tracking-tight text-pearl sm:h-9 sm:w-9">
                SK
              </span>
              <span className="hidden truncate font-display text-sm font-semibold tracking-tight text-ink sm:block md:text-base">
                {site.name}
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            {sections.map((s) => (
              <div key={s.slug} onMouseEnter={() => openMega(s.slug)} onMouseLeave={scheduleClose}>
                <Link
                  href={`/c/${s.slug}`}
                  className={`${navPill} ${
                    mega === s.slug
                      ? "border-ink/10 bg-ink/5 text-ink"
                      : "text-ink/70 hover:border-ink/10 hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {s.name}
                  <I.ChevronDown
                    size={14}
                    className={`shrink-0 transition-transform duration-200 ${mega === s.slug ? "rotate-180" : ""}`}
                  />
                </Link>
              </div>
            ))}
            {navLink("/streams", tr("nav.streams"), true)}
            {navLink("/sale", tr("nav.sale"), true)}
            {navLink("/brands", tr("nav.brands"))}
            {navLink("/contacts", tr("nav.contacts"))}
          </nav>

          <div className="flex shrink-0 items-center gap-0">
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Поиск">
              <I.Search />
            </button>
            <Link href="/account/wishlist" className="icon-btn relative max-[359px]:hidden" aria-label="Избранное">
              <I.Heart />
              {hydrated && wishCount > 0 && <Badge>{wishCount}</Badge>}
            </Link>
            <Link href={currentId ? "/account" : "/login"} className="icon-btn" aria-label="Кабинет">
              <I.User />
            </Link>
            <Link href="/cart" className="icon-btn relative" aria-label="Корзина">
              <I.Bag />
              {hydrated && cartCount > 0 && <Badge>{cartCount > 99 ? "99+" : cartCount}</Badge>}
            </Link>
          </div>
        </div>

      </header>

        {mega && (
          <div
            className="absolute inset-x-0 top-full hidden border-t border-line bg-surface shadow-lift lg:block"
            onMouseEnter={() => openMega(mega)}
            onMouseLeave={scheduleClose}
          >
            <div className="container-site grid grid-cols-4 gap-x-8 gap-y-7 py-8">
              {sections
                .find((s) => s.slug === mega)
                ?.categories.map((cat) => (
                  <div key={cat.slug}>
                    <Link
                      href={`/c/${mega}/${cat.slug}`}
                      onClick={() => setMega(null)}
                      className="group mb-3 flex items-center gap-2.5 text-sm font-semibold text-ink"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
                        <Glyph name={cat.icon} size={17} />
                      </span>
                      <span className="link-underline">{cat.name}</span>
                    </Link>
                    <ul className="space-y-1.5 pl-[46px]">
                      {cat.subs.slice(0, 6).map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={`/c/${mega}/${cat.slug}/${sub.slug}`}
                            onClick={() => setMega(null)}
                            className="text-[13px] text-muted transition-colors hover:text-accent"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-ink/40 animate-fadeIn" onClick={() => setSearchOpen(false)}>
          <div className="bg-surface px-5 py-6 shadow-lift sm:px-8" onClick={(e) => e.stopPropagation()}>
            <div className="container-site">
              <form onSubmit={submitSearch} className="flex items-center gap-3 border-b border-line pb-4">
                <I.Search className="text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tr("nav.search")}
                  className="w-full bg-transparent py-2 font-display text-lg text-ink outline-none placeholder:text-faint"
                />
                <button type="button" className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="Закрыть">
                  <I.Close />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
      {children}
    </span>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const tr = useT();
  const [openSection, setOpenSection] = useState<string | null>(sections[0].slug);
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink/50 animate-fadeIn" onClick={onClose} />
      <div className="absolute left-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-pearl shadow-lift">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <span className="font-display text-base font-semibold">{site.name}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Закрыть">
            <I.Close />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {sections.map((s) => (
            <div key={s.slug} className="border-b border-line py-2">
              <button
                className="flex w-full items-center justify-between py-2 text-left text-base font-medium"
                onClick={() => setOpenSection(openSection === s.slug ? null : s.slug)}
              >
                {s.name}
                <I.ChevronDown className={`transition-transform ${openSection === s.slug ? "rotate-180" : ""}`} />
              </button>
              {openSection === s.slug && (
                <ul className="space-y-1 pb-2">
                  {s.categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/c/${s.slug}/${cat.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2 py-1.5 text-sm text-muted"
                      >
                        <Glyph name={cat.icon} size={16} className="text-accent" />
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div className="mt-4 space-y-1">
            <LocaleCurrencyBar />
            <Link href="/streams" onClick={onClose} className="block py-2.5 text-base font-medium text-accent">
              {tr("nav.streams")}
            </Link>
            <Link href="/sale" onClick={onClose} className="block py-2.5 text-base font-medium text-accent">
              {tr("nav.sale")}
            </Link>
            <Link href="/brands" onClick={onClose} className="block py-2.5 text-base">
              {tr("nav.brands")}
            </Link>
            <Link href="/delivery" onClick={onClose} className="block py-2.5 text-base">
              {tr("nav.delivery")}
            </Link>
            <Link href="/contacts" onClick={onClose} className="block py-2.5 text-base">
              {tr("nav.contacts")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
