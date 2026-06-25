"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useAdminAuth } from "@/store/adminAuth";
import { useHydrated } from "@/lib/useHydrated";
import { useT } from "@/hooks/useTranslation";
import * as I from "./icons";

export function MobileBottomNav() {
  const tr = useT();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cartCount = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const currentId = useAuth((s) => s.current?.id ?? null);
  const adminLoggedIn = useAdminAuth((s) => s.loggedIn);

  const accountHref = adminLoggedIn ? "/admin" : currentId ? "/account" : "/login";

  const items = [
    { href: "/", label: tr("nav.home"), icon: I.Home, match: (p: string) => p === "/" },
    { href: "/c/cosmetics", label: tr("nav.catalog"), icon: I.Grid, match: (p: string) => p.startsWith("/c/") || p.startsWith("/product/") || p.startsWith("/search") },
    { href: "/cart", label: tr("nav.cart"), icon: I.Bag, match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout"), badge: cartCount },
    { href: accountHref, label: tr("nav.account"), icon: I.User, match: (p: string) => p.startsWith("/account") || p.startsWith("/login") || p.startsWith("/admin") },
  ];

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label={tr("nav.mobileBottom")}
      className="sticky bottom-0 z-30 border-t border-line bg-surface md:hidden"
    >
      <div className="container-site grid grid-cols-4 gap-0.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {items.map(({ href, label, icon: Icon, match, badge }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors ${
                active ? "text-accent" : "text-muted hover:text-ink"
              }`}
            >
              <span className="relative">
                <Icon size={22} />
                {hydrated && badge != null && badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
