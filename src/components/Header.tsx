"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sections } from "@/data/categories";
import { brands } from "@/data/brands";
import { site } from "@/data/site";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/store/auth";
import { useHydrated } from "@/lib/useHydrated";
import { Glyph } from "./Glyph";
import * as I from "./icons";

export function Header() {
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

  // Close all menus when the route changes (e.g. after picking a category)
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

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      {/* Announcement */}
      <div className="hidden border-b border-line/70 bg-ink text-paper md:block">
        <div className="container-site flex h-9 items-center justify-between text-[12px]">
          <span className="tracking-wide">Прямые поставки из Южной Кореи · Оригинальная продукция</span>
          <div className="flex items-center gap-5">
            <a href={site.contacts.whatsappLink} className="link-underline">WhatsApp</a>
            <a href={site.contacts.telegramLink} className="link-underline">Telegram</a>
            <Link href="/delivery" className="link-underline">Доставка</Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-site flex h-16 items-center justify-between gap-4 md:h-20">
        <div className="flex items-center gap-3">
          <button
            className="btn-ghost -ml-2 px-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Меню"
          >
            <I.Menu />
          </button>
          <Link href="/" className="select-none">
            <span className="font-serif text-2xl font-light tracking-[0.28em] text-ink md:text-[26px]">
              {site.name}
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {sections.map((s) => (
            <div
              key={s.slug}
              onMouseEnter={() => openMega(s.slug)}
              onMouseLeave={scheduleClose}
            >
              <Link
                href={`/c/${s.slug}`}
                className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors ${
                  mega === s.slug ? "bg-ink/5 text-ink" : "text-ink/80 hover:text-ink"
                }`}
              >
                {s.name}
                <I.ChevronDown size={15} className={`transition-transform ${mega === s.slug ? "rotate-180" : ""}`} />
              </Link>
            </div>
          ))}
          <Link href="/sale" className="rounded-full px-4 py-2 text-sm text-sale hover:bg-sale/5">Акции</Link>
          <Link href="/brands" className="rounded-full px-4 py-2 text-sm text-ink/80 hover:text-ink">Бренды</Link>
          <Link href="/contacts" className="rounded-full px-4 py-2 text-sm text-ink/80 hover:text-ink">Контакты</Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-1">
          <button className="btn-ghost px-2.5" onClick={() => setSearchOpen(true)} aria-label="Поиск">
            <I.Search />
          </button>
          <Link href="/account/wishlist" className="btn-ghost relative px-2.5" aria-label="Избранное">
            <I.Heart />
            {hydrated && wishCount > 0 && <Badge>{wishCount}</Badge>}
          </Link>
          <Link href={currentId ? "/account" : "/login"} className="btn-ghost px-2.5" aria-label="Кабинет">
            <I.User />
          </Link>
          <Link href="/cart" className="btn-ghost relative px-2.5" aria-label="Корзина">
            <I.Bag />
            {hydrated && cartCount > 0 && <Badge>{cartCount}</Badge>}
          </Link>
        </div>
      </div>

      {/* Mega menu */}
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
                    className="group mb-3 flex items-center gap-2 text-sm font-medium text-ink"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Glyph name={cat.icon} size={17} />
                    </span>
                    <span className="link-underline">{cat.name}</span>
                  </Link>
                  <ul className="space-y-1.5 pl-10">
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
                    {cat.subs.length > 6 && (
                      <li>
                        <Link href={`/c/${mega}/${cat.slug}`} className="text-[13px] font-medium text-accent">
                          Все подкатегории
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm animate-fadeIn" onClick={() => setSearchOpen(false)}>
          <div className="bg-surface px-5 py-6 shadow-lift sm:px-8" onClick={(e) => e.stopPropagation()}>
            <div className="container-site">
              <form onSubmit={submitSearch} className="flex items-center gap-3">
                <I.Search className="text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск товаров: коллаген, тонер, омега-3…"
                  className="w-full bg-transparent py-2 text-lg text-ink outline-none placeholder:text-faint"
                />
                <button type="button" className="btn-ghost px-2" onClick={() => setSearchOpen(false)} aria-label="Закрыть">
                  <I.Close />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <MobileMenu onClose={() => setMobileOpen(false)} />
      )}
    </header>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
      {children}
    </span>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>(sections[0].slug);
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink/40 animate-fadeIn" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-surface p-5 shadow-lift">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-serif text-xl tracking-[0.25em]">{site.name}</span>
          <button className="btn-ghost px-2" onClick={onClose} aria-label="Закрыть">
            <I.Close />
          </button>
        </div>
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
        <div className="mt-4 space-y-2">
          <Link href="/sale" onClick={onClose} className="block py-2 text-base text-sale">Акции</Link>
          <Link href="/brands" onClick={onClose} className="block py-2 text-base">Бренды</Link>
          <Link href="/delivery" onClick={onClose} className="block py-2 text-base">Доставка</Link>
          <Link href="/contacts" onClick={onClose} className="block py-2 text-base">Контакты</Link>
        </div>
      </div>
    </div>
  );
}
