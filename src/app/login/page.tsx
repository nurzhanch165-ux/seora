"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/store/auth";
import { useAdminAuth } from "@/store/adminAuth";
import { Breadcrumbs } from "@/components/Breadcrumbs";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const login = useAuth((s) => s.login);
  const adminLogin = useAdminAuth((s) => s.login);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Сначала проверяем вход администратора (по логину и паролю)
    const asAdmin = await adminLogin(identifier.trim(), password);
    if (asAdmin.ok) {
      router.push("/admin");
      return;
    }

    // Затем — обычный клиент по логину
    const asClient = await login(identifier, password);
    setSubmitting(false);
    if (asClient.ok) {
      router.push(next);
      return;
    }

    setError(asClient.error ?? "Неверный логин или пароль.");
  }

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Вход" }]} />
      <div className="mx-auto mt-6 max-w-md">
        <h1 className="h-display text-3xl md:text-4xl">Вход</h1>
        <p className="mt-2 text-muted">
          Введите логин и пароль. Администратор входит здесь же по своему логину.
        </p>

        <form onSubmit={submit} className="card mt-8 space-y-4 p-6 md:p-8">
          <div>
            <label className="field-label">Логин</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ваш логин"
              autoComplete="username"
              className="field"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="field-label">Пароль</label>
              <Link href="/forgot" className="text-xs font-medium text-accent hover:underline">Забыли пароль?</Link>
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
            {submitting ? "Входим…" : "Войти"}
          </button>
          <p className="text-center text-sm text-muted">
            Нет аккаунта?{" "}
            <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-accent hover:underline">Зарегистрироваться</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-site py-20 text-center text-muted">Загрузка…</div>}>
      <LoginInner />
    </Suspense>
  );
}
