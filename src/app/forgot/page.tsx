"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/store/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import * as I from "@/components/icons";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const resetPassword = useAuth((s) => s.resetPassword);

  const [login, setLogin] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!login.trim() || !phone.trim()) {
      setError("Укажите логин и телефон, чтобы мы нашли ваш аккаунт.");
      return;
    }
    if (!password || !confirm) {
      setError("Введите новый пароль дважды.");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают.");
      return;
    }
    const res = await resetPassword(login, phone, password);
    if (!res.ok) {
      setError(res.error ?? "Не удалось изменить пароль.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1800);
  }

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Вход", href: "/login" }, { label: "Восстановление пароля" }]} />
      <div className="mx-auto mt-6 max-w-md">
        <h1 className="h-display text-3xl md:text-4xl">Восстановление пароля</h1>
        <p className="mt-2 text-muted">
          Подтвердите, что аккаунт ваш: введите логин и номер телефона, указанные при регистрации, — и задайте новый пароль.
        </p>

        {done ? (
          <div className="card mt-8 flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <I.Check size={26} />
            </span>
            <p className="text-lg font-medium">Пароль изменён</p>
            <p className="text-sm text-muted">Перенаправляем на страницу входа…</p>
          </div>
        ) : (
          <form onSubmit={submit} className="card mt-8 space-y-4 p-6 md:p-8">
            <div>
              <label className="field-label">Логин</label>
              <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="ваш логин" className="field" />
            </div>
            <div>
              <label className="field-label">Телефон при регистрации</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 700 000 00 00" className="field" />
            </div>
            <div>
              <label className="field-label">Новый пароль</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="field" />
            </div>
            <div>
              <label className="field-label">Повторите новый пароль</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className="field" />
            </div>
            {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}
            <button type="submit" className="btn-primary w-full">Сохранить новый пароль</button>
            <p className="text-center text-sm text-muted">
              Вспомнили пароль?{" "}
              <Link href="/login" className="font-medium text-accent hover:underline">Войти</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
