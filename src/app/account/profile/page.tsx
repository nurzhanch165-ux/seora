"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { AccountShell } from "@/components/AccountShell";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

export default function ProfilePage() {
  const account = useAuth((s) => s.current);
  const updateProfile = useAuth((s) => s.updateProfile);
  const changePassword = useAuth((s) => s.changePassword);
  const tr = useT();

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
      setError(res.error ?? tr("account.profile.saveFailed"));
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
      setPwdError(tr("account.profile.passwordsMismatch"));
      return;
    }
    const res = await changePassword(pwd.current, pwd.next);
    if (!res.ok) {
      setPwdError(res.error ?? tr("auth.forgot.changeFailed"));
      return;
    }
    setPwd({ current: "", next: "", confirm: "" });
    setPwdSaved(true);
    setTimeout(() => setPwdSaved(false), 2000);
  }

  return (
    <AccountShell title={tr("account.profile")}>
      <div className="space-y-6">
        <form onSubmit={save} className="card space-y-5 p-6 md:p-8">
          <div>
            <h2 className="text-lg font-medium">{tr("account.profile.loginData")}</h2>
            <p className="text-sm text-muted">{tr("account.profile.loginHint")}</p>
          </div>
          <Input label={tr("auth.field.login")} value={form.login} onChange={(v) => set("login", v)} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label={tr("auth.field.lastName")} value={form.lastName} onChange={(v) => set("lastName", v)} />
            <Input label={tr("auth.field.firstName")} value={form.firstName} onChange={(v) => set("firstName", v)} />
            <Input label={tr("auth.field.middleName")} value={form.middleName} onChange={(v) => set("middleName", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={tr("auth.field.country")} value={form.country} onChange={(v) => set("country", v)} />
            <Input label={tr("auth.field.city")} value={form.city} onChange={(v) => set("city", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label={tr("auth.field.phone")} value={form.phone} onChange={(v) => set("phone", v)} />
            <Input label={tr("auth.field.whatsapp")} value={form.whatsapp} onChange={(v) => set("whatsapp", v)} />
            <Input label={tr("auth.field.telegram")} value={form.telegram} onChange={(v) => set("telegram", v)} />
          </div>
          <Input label={tr("auth.field.email")} value={form.email} onChange={(v) => set("email", v)} />

          {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">{tr("common.save")}</button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-success">
                <I.Check size={16} /> {tr("common.saved")}
              </span>
            )}
          </div>
        </form>

        <form onSubmit={savePwd} className="card space-y-5 p-6 md:p-8">
          <div>
            <h2 className="text-lg font-medium">{tr("account.profile.changePassword")}</h2>
            <p className="text-sm text-muted">{tr("account.profile.changePasswordHint")}</p>
          </div>
          <Input label={tr("account.profile.currentPassword")} type="password" value={pwd.current} onChange={(v) => setPwd((p) => ({ ...p, current: v }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={tr("account.profile.newPassword")} type="password" value={pwd.next} onChange={(v) => setPwd((p) => ({ ...p, next: v }))} />
            <Input label={tr("account.profile.repeatPassword")} type="password" value={pwd.confirm} onChange={(v) => setPwd((p) => ({ ...p, confirm: v }))} />
          </div>
          {pwdError && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{pwdError}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">{tr("account.profile.changePasswordBtn")}</button>
            {pwdSaved && (
              <span className="flex items-center gap-1.5 text-sm text-success">
                <I.Check size={16} /> {tr("account.profile.passwordChanged")}
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
