"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminAuth } from "@/store/adminAuth";
import { useAdminSession } from "@/hooks/useAdminSession";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const tr = useT();
  const { checked, loggedIn } = useAdminSession("redirectIfAuthed");
  const login = useAdminAuth((s) => s.login);

  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await login(form.login, form.password);
    setSubmitting(false);
    if (!res.ok) {
      const key = res.error ?? "admin.login.failed";
      setError(key.includes(".") ? tr(key) : res.error ?? tr("admin.login.failed"));
      return;
    }
    router.replace("/admin");
  }

  if (!checked || loggedIn) {
    return <div className="container-site py-20 text-center text-muted">{tr("common.loading")}</div>;
  }

  return (
    <div className="container-site flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="card p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <I.Shield size={26} />
            </span>
            <h1 className="mt-4 h-display text-2xl">{tr("admin.login.title")}</h1>
            <p className="mt-1 text-sm text-muted">{tr("admin.login.subtitle")}</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="field-label">{tr("auth.loginField")}</label>
              <input
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                placeholder="admin"
                autoComplete="username"
                className="field"
              />
            </div>
            <div>
              <label className="field-label">{tr("auth.password")}</label>
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
              {submitting ? tr("auth.signingIn") : tr("auth.signIn")}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-faint">
            {tr("admin.login.defaultsHint", { login: "admin", password: "admin123" })}
          </p>
        </div>
      </div>
    </div>
  );
}
