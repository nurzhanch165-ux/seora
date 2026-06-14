"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { AccountShell } from "@/components/AccountShell";
import * as I from "@/components/icons";

export default function ProfilePage() {
  const account = useAuth((s) => s.current);
  const updateProfile = useAuth((s) => s.updateProfile);
  const changePassword = useAuth((s) => s.changePassword);

  const [form, setForm] = useState({
    login: "", lastName: "", firstName: "", middleName: "", country: "", city: "",
    phone: "", whatsapp: "", telegram: "", email: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    if (account) {
      setForm({
        login: account.login ?? "",
        lastName: account.lastName, firstName: account.firstName, middleName: account.middleName,
        country: account.country, city: account.city, phone: account.phone,
        whatsapp: account.whatsapp, telegram: account.telegram, email: account.email ?? "",
      });
    }
  }, [account]);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    const res = await updateProfile({
      login: form.login,
      lastName: form.lastName, firstName: form.firstName, middleName: form.middleName,
      country: form.country, city: form.city, phone: form.phone,
      whatsapp: form.whatsapp, telegram: form.telegram,
      email: form.email.trim() || undefined,
    });
    if (!res.ok) {
      setError(res.error ?? "Не удалось сохранить данные.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function savePwd(e: React.FormEvent) {
    e.preventDefault();
    setPwdError("");
    setPwdSaved(false);
    if (pwd.next !== pwd.confirm) {
      setPwdError("Новый пароль и подтверждение не совпадают.");
      return;
    }
    const res = await changePassword(pwd.current, pwd.next);
    if (!res.ok) {
      setPwdError(res.error ?? "Не удалось изменить пароль.");
      return;
    }
    setPwd({ current: "", next: "", confirm: "" });
    setPwdSaved(true);
    setTimeout(() => setPwdSaved(false), 2000);
  }

  return (
    <AccountShell title="Профиль">
      <div className="space-y-6">
        <form onSubmit={save} className="card space-y-5 p-6 md:p-8">
          <div>
            <h2 className="text-lg font-medium">Логин и данные</h2>
            <p className="text-sm text-muted">Логин используется для входа в личный кабинет.</p>
          </div>
          <Input label="Логин" value={form.login} onChange={(v) => set("login", v)} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Фамилия" value={form.lastName} onChange={(v) => set("lastName", v)} />
            <Input label="Имя" value={form.firstName} onChange={(v) => set("firstName", v)} />
            <Input label="Отчество" value={form.middleName} onChange={(v) => set("middleName", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Страна" value={form.country} onChange={(v) => set("country", v)} />
            <Input label="Город" value={form.city} onChange={(v) => set("city", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Телефон" value={form.phone} onChange={(v) => set("phone", v)} />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} />
            <Input label="Telegram" value={form.telegram} onChange={(v) => set("telegram", v)} />
          </div>
          <Input label="Email (необязательно)" value={form.email} onChange={(v) => set("email", v)} />

          {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Сохранить</button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-success">
                <I.Check size={16} /> Сохранено
              </span>
            )}
          </div>
        </form>

        <form onSubmit={savePwd} className="card space-y-5 p-6 md:p-8">
          <div>
            <h2 className="text-lg font-medium">Смена пароля</h2>
            <p className="text-sm text-muted">Чтобы изменить пароль, подтвердите текущий.</p>
          </div>
          <Input label="Текущий пароль" type="password" value={pwd.current} onChange={(v) => setPwd((p) => ({ ...p, current: v }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Новый пароль" type="password" value={pwd.next} onChange={(v) => setPwd((p) => ({ ...p, next: v }))} />
            <Input label="Повторите новый пароль" type="password" value={pwd.confirm} onChange={(v) => setPwd((p) => ({ ...p, confirm: v }))} />
          </div>
          {pwdError && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{pwdError}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Изменить пароль</button>
            {pwdSaved && (
              <span className="flex items-center gap-1.5 text-sm text-success">
                <I.Check size={16} /> Пароль изменён
              </span>
            )}
          </div>
        </form>
      </div>
    </AccountShell>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="field" />
    </div>
  );
}
