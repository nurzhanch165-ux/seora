"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/store/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const resetPassword = useAuth((s) => s.resetPassword);
  const tr = useT();

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
      setError(tr("auth.forgot.loginPhoneRequired"));
      return;
    }
    if (!password || !confirm) {
      setError(tr("auth.forgot.enterPasswordTwice"));
      return;
    }
    if (password !== confirm) {
      setError(tr("auth.forgot.passwordsMismatch"));
      return;
    }
    const res = await resetPassword(login, phone, password);
    if (!res.ok) {
      setError(res.error ?? tr("auth.forgot.changeFailed"));
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1800);
  }

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("auth.login"), href: "/login" }, { label: tr("auth.forgot.title") }]} />
      <div className="mx-auto mt-6 max-w-md">
        <h1 className="h-display text-3xl md:text-4xl">{tr("auth.forgot.title")}</h1>
        <p className="mt-2 text-muted">{tr("auth.forgot.hint")}</p>

        {done ? (
          <div className="card mt-8 flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <I.Check size={26} />
            </span>
            <p className="text-lg font-medium">{tr("auth.forgot.passwordChanged")}</p>
            <p className="text-sm text-muted">{tr("auth.forgot.redirectToLogin")}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="card mt-8 space-y-4 p-6 md:p-8">
            <div>
              <label className="field-label">{tr("auth.loginField")}</label>
              <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder={tr("auth.loginPlaceholder")} className="field" />
            </div>
            <div>
              <label className="field-label">{tr("auth.forgot.phoneAtRegistration")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 700 000 00 00" className="field" />
            </div>
            <div>
              <label className="field-label">{tr("auth.forgot.newPassword")}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="field" />
            </div>
            <div>
              <label className="field-label">{tr("auth.forgot.repeatPassword")}</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className="field" />
            </div>
            {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}
            <button type="submit" className="btn-primary w-full">{tr("auth.forgot.savePassword")}</button>
            <p className="text-center text-sm text-muted">
              {tr("auth.forgot.rememberPassword")}{" "}
              <Link href="/login" className="font-medium text-accent hover:underline">{tr("auth.signIn")}</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
