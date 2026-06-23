"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { useHydrated } from "@/lib/useHydrated";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useT } from "@/hooks/useTranslation";

function RegisterInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const register = useAuth((s) => s.register);
  const current = useAuth((s) => s.current);
  const hydrated = useHydrated();
  const tr = useT();

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
      [tr("auth.field.login"), form.login],
      [tr("auth.field.lastName"), form.lastName],
      [tr("auth.field.firstName"), form.firstName],
      [tr("auth.field.middleName"), form.middleName],
      [tr("auth.field.country"), form.country],
      [tr("auth.field.city"), form.city],
      [tr("auth.field.phone"), form.phone],
      [tr("auth.field.whatsapp"), form.whatsapp],
      [tr("auth.field.telegram"), form.telegram],
      [tr("auth.field.password"), form.password],
    ];
    const missing = required.filter(([, v]) => !v.trim()).map(([k]) => k);
    if (missing.length) {
      setError(tr("auth.fillRequired", { fields: missing.join(", ") }));
      return;
    }
    if (form.login.trim().length < 3) {
      setError(tr("auth.loginMinLength"));
      return;
    }
    if (form.password.length < 4) {
      setError(tr("auth.passwordMinLength"));
      return;
    }
    if (!agreeData) {
      setError(tr("auth.consentRequired"));
      return;
    }
    setSubmitting(true);
    const res = await register({ ...form, email: form.email.trim() || undefined, agreeData, agreeMarketing });
    setSubmitting(false);
    if (!res.ok) {
      const errKey = res.error ?? "auth.registerFailed";
      setError(errKey.includes(".") ? tr(errKey) : errKey);
      return;
    }
    router.push(next);
  }

  if (hydrated && current) {
    return <div className="container-site py-20 text-center text-muted">{tr("auth.alreadyLoggedIn")}</div>;
  }

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("auth.register") }]} />
      <div className="mx-auto mt-6 max-w-2xl">
        <h1 className="h-display text-3xl md:text-4xl">{tr("auth.register")}</h1>
        <p className="mt-2 text-muted">{tr("auth.registerHint")}</p>

        <form onSubmit={submit} className="card mt-8 space-y-5 p-6 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={`${tr("auth.field.login")} *`} value={form.login} onChange={(v) => set("login", v)} placeholder="aigerim_a" />
            <Input label={`${tr("auth.field.password")} *`} type="password" value={form.password} onChange={(v) => set("password", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label={`${tr("auth.field.lastName")} *`} value={form.lastName} onChange={(v) => set("lastName", v)} />
            <Input label={`${tr("auth.field.firstName")} *`} value={form.firstName} onChange={(v) => set("firstName", v)} />
            <Input label={`${tr("auth.field.middleName")} *`} value={form.middleName} onChange={(v) => set("middleName", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={`${tr("auth.field.country")} *`} value={form.country} onChange={(v) => set("country", v)} />
            <Input label={`${tr("auth.field.city")} *`} value={form.city} onChange={(v) => set("city", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label={`${tr("auth.field.phone")} *`} value={form.phone} onChange={(v) => set("phone", v)} placeholder="+7 700 000 00 00" />
            <Input label={`${tr("auth.field.whatsapp")} *`} value={form.whatsapp} onChange={(v) => set("whatsapp", v)} />
            <Input label={`${tr("auth.field.telegram")} *`} value={form.telegram} onChange={(v) => set("telegram", v)} placeholder="@username" />
          </div>
          <Input label={tr("auth.field.email")} value={form.email} onChange={(v) => set("email", v)} />

          <div className="space-y-3 pt-1">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
              <input type="checkbox" checked={agreeData} onChange={(e) => setAgreeData(e.target.checked)} className="mt-0.5 h-4 w-4 accent-accent" />
              <span>{tr("auth.agreeData")}</span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
              <input type="checkbox" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 accent-accent" />
              <span>{tr("auth.agreeMarketing")}</span>
            </label>
          </div>

          {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? tr("auth.creating") : tr("auth.createAccount")}
          </button>
          <p className="text-center text-sm text-muted">
            {tr("auth.haveAccount")}{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-accent hover:underline">{tr("auth.signIn")}</Link>
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
  const tr = useT();
  return (
    <Suspense fallback={<div className="container-site py-20 text-center text-muted">{tr("common.loading")}</div>}>
      <RegisterInner />
    </Suspense>
  );
}
