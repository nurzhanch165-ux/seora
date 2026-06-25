"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAuth } from "@/store/auth";
import { useAdminAuth } from "@/store/adminAuth";
import { useHydrated } from "@/lib/useHydrated";
import { Breadcrumbs } from "./Breadcrumbs";
import { useT } from "@/hooks/useTranslation";
import * as I from "./icons";

export function AccountShell({ children, title }: { children: React.ReactNode; title: string }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const account = useAuth((s) => s.current);
  const logout = useAuth((s) => s.logout);
  const adminLoggedIn = useAdminAuth((s) => s.loggedIn);
  const tr = useT();

  const nav = useMemo(
    () => [
      { href: "/account", label: tr("account.myOrders"), icon: I.Box },
      { href: "/account/profile", label: tr("account.profile"), icon: I.User },
      { href: "/account/wishlist", label: tr("account.wishlist"), icon: I.Heart },
    ],
    [tr]
  );

  if (!hydrated) return <div className="container-site py-20 text-center text-muted">{tr("common.loading")}</div>;

  if (!account && !adminLoggedIn) {
    return (
      <div className="container-site pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 sm:py-8 sm:pb-8">
        <Breadcrumbs items={[{ label: tr("account.title") }]} />
        <div className="card mx-auto mt-6 flex max-w-md flex-col items-center gap-4 py-16 text-center sm:mt-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <I.User size={26} />
          </span>
          <h1 className="h-display text-2xl">{tr("account.loginPrompt")}</h1>
          <p className="text-sm text-muted">{tr("account.loginPromptHint")}</p>
          <div className="flex gap-3">
            <Link href="/login" className="btn-primary">{tr("auth.signIn")}</Link>
            <Link href="/register" className="btn-outline">{tr("auth.register")}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-site pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 sm:py-8 sm:pb-8">
      <Breadcrumbs items={[{ label: tr("account.title") }]} />
      <h1 className="mt-4 h-display text-2xl sm:mt-6 sm:text-3xl md:text-4xl">{title}</h1>

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[260px_1fr] lg:gap-8">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div className="card mb-4 flex items-center justify-between gap-3 p-4 sm:block sm:p-5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {account ? `${account.firstName} ${account.lastName}` : tr("account.admin")}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">{account ? account.phone : tr("account.serviceLogin")}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:overflow-visible lg:rounded-card lg:border lg:border-line lg:bg-surface lg:pb-0">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-w-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-colors sm:px-4 sm:py-2.5 sm:text-sm lg:gap-3 lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:px-5 lg:py-3.5 lg:last:border-0 ${
                    active
                      ? "border-accent bg-accent-soft font-medium text-accent lg:bg-accent-soft"
                      : "border-line bg-surface text-muted hover:border-accent/30 hover:text-ink lg:border-0 lg:bg-transparent lg:hover:bg-ink/5"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
            {adminLoggedIn && (
              <Link
                href="/admin"
                className="flex min-w-0 items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3.5 py-2 text-[13px] text-accent transition-colors sm:px-4 sm:py-2.5 sm:text-sm lg:gap-3 lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:px-5 lg:py-3.5"
              >
                <I.Shield size={18} className="shrink-0" />
                <span className="truncate">{tr("account.goToAdmin")}</span>
              </Link>
            )}
            <button
              onClick={() => { void logout().then(() => router.push("/")); }}
              className="flex min-w-0 items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] text-muted transition-colors hover:text-sale sm:px-4 sm:py-2.5 sm:text-sm lg:hidden"
            >
              <I.ArrowUpRight size={18} className="shrink-0" />
              <span className="truncate">{tr("account.logout")}</span>
            </button>
            <button
              onClick={() => { void logout().then(() => router.push("/")); }}
              className="hidden w-full items-center gap-3 px-5 py-3.5 text-sm text-muted transition-colors hover:bg-ink/5 hover:text-sale lg:flex"
            >
              <I.ArrowUpRight size={18} />
              {tr("account.logout")}
            </button>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
