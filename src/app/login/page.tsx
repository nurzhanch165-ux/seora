"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { useAdminAuth } from "@/store/adminAuth";
import { useHydrated } from "@/lib/useHydrated";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useT } from "@/hooks/useTranslation";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const login = useAuth((s) => s.login);
  const current = useAuth((s) => s.current);
  const adminLogin = useAdminAuth((s) => s.login);
  const hydrated = useHydrated();
  const tr = useT();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hydrated && current) router.replace(next);
  }, [hydrated, current, next, router]);

  if (hydrated && current) {
    return <div className="container-site py-20 text-center text-muted">{tr("auth.alreadyLoggedIn")}</div>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const asAdmin = await adminLogin(identifier.trim(), password);
    if (asAdmin.ok) {
      router.push("/admin");
      return;
    }

    const asClient = await login(identifier, password);
    setSubmitting(false);
    if (asClient.ok) {
      router.push(next);
      return;
    }

    setError(asClient.error ?? tr("auth.invalidCredentials"));
  }

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("auth.login") }]} />
      <div className="mx-auto mt-6 max-w-md">
        <h1 className="h-display text-3xl md:text-4xl">{tr("auth.login")}</h1>
        <p className="mt-2 text-muted">{tr("auth.loginHint")}</p>

        <form onSubmit={submit} className="card mt-8 space-y-4 p-6 md:p-8">
          <div>
            <label className="field-label">{tr("auth.loginField")}</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={tr("auth.loginPlaceholder")}
              autoComplete="username"
              className="field"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="field-label">{tr("auth.password")}</label>
              <Link href="/forgot" className="text-xs font-medium text-accent hover:underline">{tr("auth.forgotPassword")}</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="field"
            />
          </div>
          {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? tr("auth.signingIn") : tr("auth.signIn")}
          </button>
          <p className="text-center text-sm text-muted">
            {tr("auth.noAccount")}{" "}
            <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-accent hover:underline">{tr("auth.registerLink")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const tr = useT();
  return (
    <Suspense fallback={<div className="container-site py-20 text-center text-muted">{tr("common.loading")}</div>}>
      <LoginInner />
    </Suspense>
  );
}
