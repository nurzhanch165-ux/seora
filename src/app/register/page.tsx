"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { useHydrated } from "@/lib/useHydrated";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import * as I from "@/components/icons";

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const register = useAuth((s) => s.register);
  const current = useAuth((s) => s.current);
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && current) router.replace(next);
  }, [hydrated, current, next, router]);

  const [form, setForm] = useState({
    login: "", lastName: "", firstName: "", middleName: "", country: "", city: "",
    phone: "", whatsapp: "", telegram: "", email: "", password: "",
  });
  const [agreeData, setAgreeData] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(true);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const required: [string, string][] = [
      ["Логин", form.login], ["Фамилия", form.lastName], ["Имя", form.firstName], ["Отчество", form.middleName],
      ["Страна", form.country], ["Город", form.city], ["Телефон", form.phone],
      ["WhatsApp", form.whatsapp], ["Telegram", form.telegram], ["Пароль", form.password],
    ];
    const missing = required.filter(([, v]) => !v.trim()).map(([k]) => k);
    if (missing.length) {
      setError(`Заполните: ${missing.join(", ")}.`);
      return;
    }
    if (form.login.trim().length < 3) {
      setError("Логин должен быть не короче 3 символов.");
      return;
    }
    if (form.password.length < 4) {
      setError("Пароль должен быть не короче 4 символов.");
      return;
    }
    if (!agreeData) {
      setError("Необходимо согласие на обработку персональных данных.");
      return;
    }
    setSubmitting(true);
    const res = await register({ ...form, email: form.email.trim() || undefined, agreeData, agreeMarketing });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Не удалось зарегистрироваться.");
      return;
    }
    router.push(next);
  }

  if (hydrated && current) {
    return <div className="container-site py-20 text-center text-muted">Вы уже вошли. Открываем кабинет…</div>;
  }

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Регистрация" }]} />
      <div className="mx-auto mt-6 max-w-2xl">
        <h1 className="h-display text-3xl md:text-4xl">Регистрация</h1>
        <p className="mt-2 text-muted">
          Придумайте логин и пароль для входа. Email указывать не обязательно — главное телефон и мессенджеры, чтобы мы могли связаться и присылать статус заказа.
        </p>

        <form onSubmit={submit} className="card mt-8 space-y-5 p-6 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Логин *" value={form.login} onChange={(v) => set("login", v)} placeholder="например, aigerim_a" />
            <Input label="Пароль *" type="password" value={form.password} onChange={(v) => set("password", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Фамилия *" value={form.lastName} onChange={(v) => set("lastName", v)} />
            <Input label="Имя *" value={form.firstName} onChange={(v) => set("firstName", v)} />
            <Input label="Отчество *" value={form.middleName} onChange={(v) => set("middleName", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Страна *" value={form.country} onChange={(v) => set("country", v)} />
            <Input label="Город *" value={form.city} onChange={(v) => set("city", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Телефон *" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+7 700 000 00 00" />
            <Input label="WhatsApp *" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} />
            <Input label="Telegram *" value={form.telegram} onChange={(v) => set("telegram", v)} placeholder="@username" />
          </div>
          <Input label="Email (необязательно)" value={form.email} onChange={(v) => set("email", v)} />

          <div className="space-y-3 pt-1">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
              <input type="checkbox" checked={agreeData} onChange={(e) => setAgreeData(e.target.checked)} className="mt-0.5 h-4 w-4 accent-accent" />
              <span>Согласен на обработку персональных данных *</span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
              <input type="checkbox" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 accent-accent" />
              <span>Получать уведомления об акциях, новинках и прямых эфирах</span>
            </label>
          </div>

          {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? "Создаём аккаунт…" : "Создать аккаунт"}
          </button>
          <p className="text-center text-sm text-muted">
            Уже есть аккаунт?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-accent hover:underline">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container-site py-20 text-center text-muted">Загрузка…</div>}>
      <RegisterInner />
    </Suspense>
  );
}
