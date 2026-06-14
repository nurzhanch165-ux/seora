"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/store/auth";
import { useAdminAuth } from "@/store/adminAuth";
import { useHydrated } from "@/lib/useHydrated";
import { Breadcrumbs } from "./Breadcrumbs";
import * as I from "./icons";

const nav = [
  { href: "/account", label: "Мои заказы", icon: I.Box },
  { href: "/account/profile", label: "Профиль", icon: I.User },
  { href: "/account/wishlist", label: "Избранное", icon: I.Heart },
];

export function AccountShell({ children, title }: { children: React.ReactNode; title: string }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const account = useAuth((s) => s.current);
  const logout = useAuth((s) => s.logout);
  const adminLoggedIn = useAdminAuth((s) => s.loggedIn);
  const adminReady = useAdminAuth((s) => s.ready);
  const adminCheck = useAdminAuth((s) => s.check);

  useEffect(() => {
    adminCheck();
  }, [adminCheck]);

  if (!hydrated || !adminReady) return <div className="container-site py-20 text-center text-muted">Загрузка…</div>;

  if (!account && !adminLoggedIn) {
    return (
      <div className="container-site py-8">
        <Breadcrumbs items={[{ label: "Личный кабинет" }]} />
        <div className="card mx-auto mt-8 flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <I.User size={26} />
          </span>
          <h1 className="h-display text-2xl">Войдите в личный кабинет</h1>
          <p className="text-sm text-muted">Здесь хранятся ваши заказы, статусы и избранное.</p>
          <div className="flex gap-3">
            <Link href="/login" className="btn-primary">Войти</Link>
            <Link href="/register" className="btn-outline">Регистрация</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Личный кабинет" }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">{title}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <div className="card mb-4 p-5">
            <p className="text-sm font-medium text-ink">
              {account ? `${account.firstName} ${account.lastName}` : "Администратор"}
            </p>
            <p className="mt-0.5 text-xs text-muted">{account ? account.phone : "Служебный вход"}</p>
          </div>
          <nav className="card overflow-hidden">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 border-b border-line px-5 py-3.5 text-sm transition-colors last:border-0 ${
                    active ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="flex w-full items-center gap-3 px-5 py-3.5 text-sm text-muted transition-colors hover:bg-ink/5 hover:text-sale"
            >
              <I.ArrowUpRight size={18} />
              Выйти
            </button>
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
