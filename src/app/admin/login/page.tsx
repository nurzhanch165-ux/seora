"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import * as I from "@/components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const ready = useAdminAuth((s) => s.ready);
  const loggedIn = useAdminAuth((s) => s.loggedIn);
  const check = useAdminAuth((s) => s.check);
  const login = useAdminAuth((s) => s.login);

  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    if (ready && loggedIn) router.replace("/admin");
  }, [ready, loggedIn, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await login(form.login, form.password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Не удалось войти.");
      return;
    }
    router.replace("/admin");
  }

  return (
    <div className="container-site flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="card p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <I.Shield size={26} />
            </span>
            <h1 className="mt-4 h-display text-2xl">Вход для администратора</h1>
            <p className="mt-1 text-sm text-muted">Управление заказами, складом и товарами</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="field-label">Логин</label>
              <input
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                placeholder="admin"
                autoComplete="username"
                className="field"
              />
            </div>
            <div>
              <label className="field-label">Пароль</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                className="field"
              />
            </div>
            {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? "Входим…" : "Войти"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-faint">
            Данные по умолчанию: логин <span className="font-medium text-ink">admin</span>, пароль <span className="font-medium text-ink">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
