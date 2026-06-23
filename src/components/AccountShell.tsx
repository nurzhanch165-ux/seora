"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
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
  const adminReady = useAdminAuth((s) => s.ready);
  const adminCheck = useAdminAuth((s) => s.check);
  const tr = useT();

  const nav = useMemo(
    () => [
      { href: "/account", label: tr("account.myOrders"), icon: I.Box },
      { href: "/account/profile", label: tr("account.profile"), icon: I.User },
      { href: "/account/wishlist", label: tr("account.wishlist"), icon: I.Heart },
    ],
    [tr]
  );

  useEffect(() => {
    adminCheck();
  }, [adminCheck]);

  if (!hydrated || !adminReady) return <div className="container-site py-20 text-center text-muted">{tr("common.loading")}</div>;

  if (!account && !adminLoggedIn) {
    return (
      <div className="container-site py-8">
        <Breadcrumbs items={[{ label: tr("account.title") }]} />
        <div className="card mx-auto mt-8 flex max-w-md flex-col items-center gap-4 py-16 text-center">
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
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("account.title") }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">{title}</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card mb-4 p-4 sm:p-5">
            <p className="text-sm font-medium text-ink">
              {account ? `${account.firstName} ${account.lastName}` : tr("account.admin")}
            </p>
            <p className="mt-0.5 text-xs text-muted">{account ? account.phone : tr("account.serviceLogin")}</p>
          </div>
          <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto scroll-pl-4 px-4 pb-1 sm:-mx-0 sm:px-0 lg:flex-col lg:overflow-visible lg:rounded-card lg:border lg:border-line lg:bg-surface lg:pb-0">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-colors sm:px-4 sm:py-2.5 sm:text-sm lg:gap-3 lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:px-5 lg:py-3.5 lg:last:border-0 ${
                    active
                      ? "border-accent bg-accent-soft font-medium text-accent lg:bg-accent-soft"
                      : "border-line bg-surface text-muted hover:border-accent/30 hover:text-ink lg:border-0 lg:bg-transparent lg:hover:bg-ink/5"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            {adminLoggedIn && (
              <Link
                href="/admin"
                className="flex shrink-0 items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-4 py-2.5 text-sm text-accent transition-colors lg:gap-3 lg:rounded-none lg:border-0 lg:border-b lg:border-line lg:px-5 lg:py-3.5"
              >
                <I.Shield size={18} />
                {tr("account.goToAdmin")}
              </Link>
            )}
            <button
              onClick={() => { void logout().then(() => router.push("/")); }}
              className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-muted transition-colors hover:text-sale lg:hidden"
            >
              <I.ArrowUpRight size={18} />
              {tr("account.logout")}
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
