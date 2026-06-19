"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useAdminAuth } from "@/store/adminAuth";
import { useOrders } from "@/store/orders";
import { useCatalogProducts } from "@/store/catalog";
import { usePreferences } from "@/store/preferences";
import { brandName } from "@/data/brands";
import { site } from "@/data/site";
import { useHydrated } from "@/lib/useHydrated";
import { exportOrderExcel } from "@/lib/excel";
import { useExchangeRates } from "@/store/exchangeRates";
import { convertFromKrw, formatCurrency } from "@/lib/currency";
import { useT, useSiteText, useLocale } from "@/hooks/useTranslation";
import { COUNTRIES, deliveryMethodLabel, getDeliveryMethods, defaultMethod, type DeliveryMethodId } from "@/lib/delivery";
import { Customer, Delivery } from "@/lib/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductVisual } from "@/components/ProductVisual";
import * as I from "@/components/icons";

function genNumber() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.floor(100 + Math.random() * 900);
  return `SSK-${ymd}-${rnd}`;
}

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const account = useAuth((s) => s.current);
  const adminLoggedIn = useAdminAuth((s) => s.loggedIn);
  const adminReady = useAdminAuth((s) => s.ready);
  const adminCheck = useAdminAuth((s) => s.check);
  const currency = usePreferences((s) => s.currency);
  const rates = useExchangeRates((s) => s.rates);
  const tr = useT();
  const trSite = useSiteText();
  const locale = useLocale();
  const lines = useCart((s) => s.lines);
  const streamContext = useCart((s) => s.streamContext);
  const clear = useCart((s) => s.clear);
  const createOrder = useOrders((s) => s.createOrder);
  const catalog = useCatalogProducts();

  const [customer, setCustomer] = useState<Customer>({
    lastName: "", firstName: "", middleName: "", country: "", city: "",
    phone: "", whatsapp: "", telegram: "", email: "",
  });
  const [delivery, setDelivery] = useState<Delivery>({
    country: "", city: "", address: "", zip: "", recipient: "", recipientPhone: "",
    method: "", comment: "",
  });
  const [methodId, setMethodId] = useState<DeliveryMethodId>("avia");
  const [comment, setComment] = useState("");
  const [agreeData, setAgreeData] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const items = useMemo(
    () => lines.map((l) => ({ line: l, product: catalog.find((p) => p.id === l.productId) })).filter((x) => x.product),
    [lines, catalog]
  );
  const totalKrw = items.reduce((s, x) => s + x.product!.price * x.line.qty, 0);
  const conversion = convertFromKrw(totalKrw, currency, rates);
  const total = conversion.total;

  const deliveryMethods = useMemo(
    () => getDeliveryMethods(delivery.country || customer.country),
    [delivery.country, customer.country]
  );

  useEffect(() => {
    if (delivery.country || customer.country) {
      const def = defaultMethod(delivery.country || customer.country);
      setMethodId(def.id);
    }
  }, [delivery.country, customer.country]);

  useEffect(() => {
    adminCheck();
  }, [adminCheck]);

  useEffect(() => {
    if (account) {
      setCustomer({
        lastName: account.lastName, firstName: account.firstName, middleName: account.middleName,
        country: account.country, city: account.city, phone: account.phone,
        whatsapp: account.whatsapp, telegram: account.telegram, email: account.email ?? "",
      });
      setDelivery((d) => ({
        ...d,
        country: account.country, city: account.city,
        recipient: `${account.lastName} ${account.firstName}`.trim(),
        recipientPhone: account.phone,
      }));
    }
  }, [account]);

  if (!hydrated || !adminReady) return <div className="container-site py-20 text-center text-muted">{tr("common.loading")}</div>;

  if (items.length === 0) {
    return (
      <div className="container-site py-8">
        <Breadcrumbs items={[{ label: tr("checkout.breadcrumb") }]} />
        <div className="card mt-8 flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-lg font-medium">{tr("checkout.emptyCart")}</p>
          <Link href="/c/cosmetics" className="btn-primary">{tr("common.goCatalog")}</Link>
        </div>
      </div>
    );
  }

  if (!account && !adminLoggedIn) {
    return (
      <div className="container-site py-8">
        <Breadcrumbs items={[{ label: tr("checkout.breadcrumb") }]} />
        <div className="card mx-auto mt-8 flex max-w-lg flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <I.User size={26} />
          </span>
          <h1 className="h-display text-2xl">{tr("checkout.loginRequired")}</h1>
          <p className="max-w-sm text-sm text-muted">{tr("checkout.loginRequiredHint")}</p>
          <div className="mt-2 flex gap-3">
            <Link href="/register?next=/checkout" className="btn-primary">{tr("auth.register")}</Link>
            <Link href="/login?next=/checkout" className="btn-outline">{tr("auth.signIn")}</Link>
          </div>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const required: [string, string][] = [
      [tr("checkout.field.lastName"), customer.lastName],
      [tr("checkout.field.firstName"), customer.firstName],
      [tr("checkout.field.middleName"), customer.middleName],
      [tr("checkout.field.country"), customer.country],
      [tr("checkout.field.city"), customer.city],
      [tr("checkout.field.phone"), customer.phone],
      [tr("checkout.field.whatsapp"), customer.whatsapp],
      [tr("checkout.field.telegram"), customer.telegram],
      [tr("checkout.field.recipient"), delivery.recipient],
      [tr("checkout.field.recipientPhone"), delivery.recipientPhone],
      [tr("checkout.field.deliveryCountry"), delivery.country],
      [tr("checkout.field.deliveryCity"), delivery.city],
      [tr("checkout.field.address"), delivery.address],
    ];
    const missing = required.filter(([, v]) => !v.trim()).map(([k]) => k);
    if (missing.length) {
      setError(tr("checkout.fillRequired", { fields: missing.join(", ") }));
      return;
    }
    if (!agreeData) {
      setError(tr("checkout.consentRequired"));
      return;
    }

    const methodLabel = getDeliveryMethods(delivery.country || customer.country).find((m) => m.id === methodId)?.label
      ?? deliveryMethodLabel(methodId, "ru");

    setSubmitting(true);
    const res = await createOrder({
      number: genNumber(),
      createdAt: new Date().toISOString(),
      customerId: account?.id ?? null,
      customer: { ...customer, email: customer.email?.trim() || undefined },
      delivery: { ...delivery, method: methodLabel, comment },
      items: items.map((x) => {
        const krw = x.product!.price;
        const conv = convertFromKrw(krw, currency, rates);
        return {
          productId: x.product!.id,
          slug: x.product!.slug,
          name: x.product!.name,
          brand: brandName(x.product!.brandSlug),
          price: krw,
          priceKrw: krw,
          priceConverted: conv.total,
          sku: x.product!.id,
          qty: x.line.qty,
        };
      }),
      total: totalKrw,
      totalKrw,
      totalConverted: total,
      currencyCode: currency,
      exchangeRate: rates[currency],
      feeAmount: conversion.fee,
      source: streamContext ? "stream" : "catalog",
      streamId: streamContext?.streamId ?? null,
      streamName: streamContext?.streamName ?? null,
      comment,
    });
    setSubmitting(false);
    if (!res.ok || !res.order) {
      setError(res.error ?? tr("checkout.createFailed"));
      return;
    }

    await exportOrderExcel(res.order);
    clear();
    router.push(`/checkout/success?n=${encodeURIComponent(res.order.number)}`);
  }

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("cart.title"), href: "/cart" }, { label: tr("checkout.breadcrumb") }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">{tr("checkout.title")}</h1>
      {streamContext && (
        <p className="mt-3 rounded-xl2 border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
          {tr("checkout.streamOrder")}: <span className="font-medium">{streamContext.streamName}</span>
        </p>
      )}

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Section title={tr("checkout.contactTitle")} hint={tr("checkout.contactHint")}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={`${tr("checkout.field.lastName")} ${tr("checkout.required")}`} value={customer.lastName} onChange={(v) => setCustomer({ ...customer, lastName: v })} />
              <Field label={`${tr("checkout.field.firstName")} ${tr("checkout.required")}`} value={customer.firstName} onChange={(v) => setCustomer({ ...customer, firstName: v })} />
              <Field label={`${tr("checkout.field.middleName")} ${tr("checkout.required")}`} value={customer.middleName} onChange={(v) => setCustomer({ ...customer, middleName: v })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`${tr("checkout.field.country")} ${tr("checkout.required")}`} value={customer.country} onChange={(v) => setCustomer({ ...customer, country: v })} list="countries-list" />
              <Field label={`${tr("checkout.field.city")} ${tr("checkout.required")}`} value={customer.city} onChange={(v) => setCustomer({ ...customer, city: v })} />
            </div>
            <datalist id="countries-list">
              {COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={`${tr("checkout.field.phone")} ${tr("checkout.required")}`} value={customer.phone} onChange={(v) => setCustomer({ ...customer, phone: v })} />
              <Field label={`${tr("checkout.field.whatsapp")} ${tr("checkout.required")}`} value={customer.whatsapp} onChange={(v) => setCustomer({ ...customer, whatsapp: v })} />
              <Field label={`${tr("checkout.field.telegram")} ${tr("checkout.required")}`} value={customer.telegram} onChange={(v) => setCustomer({ ...customer, telegram: v })} />
            </div>
            <Field label={tr("checkout.field.email")} value={customer.email ?? ""} onChange={(v) => setCustomer({ ...customer, email: v })} />
          </Section>

          <Section title={tr("checkout.deliveryTitle")} hint={tr("checkout.deliveryHint")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`${tr("checkout.field.recipient")} ${tr("checkout.required")}`} value={delivery.recipient} onChange={(v) => setDelivery({ ...delivery, recipient: v })} />
              <Field label={`${tr("checkout.field.recipientPhone")} ${tr("checkout.required")}`} value={delivery.recipientPhone} onChange={(v) => setDelivery({ ...delivery, recipientPhone: v })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={`${tr("checkout.field.country")} ${tr("checkout.required")}`} value={delivery.country} onChange={(v) => setDelivery({ ...delivery, country: v })} />
              <Field label={`${tr("checkout.field.city")} ${tr("checkout.required")}`} value={delivery.city} onChange={(v) => setDelivery({ ...delivery, city: v })} />
              <Field label={tr("checkout.field.zip")} value={delivery.zip} onChange={(v) => setDelivery({ ...delivery, zip: v })} />
            </div>
            <Field label={`${tr("checkout.field.address")} ${tr("checkout.required")}`} value={delivery.address} onChange={(v) => setDelivery({ ...delivery, address: v })} />
            <div>
              <label className="field-label">{tr("checkout.deliveryMethod")}</label>
              <div className="flex flex-wrap gap-2">
                {deliveryMethods.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMethodId(m.id)}
                    className={`chip ${methodId === m.id ? "border-accent bg-accent-soft text-accent" : ""}`}
                  >
                    {deliveryMethodLabel(m.id, locale)}{m.priceNote ? ` · ${m.priceNote}` : ""}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section title={tr("checkout.commentTitle")} hint={tr("checkout.commentHint")}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder={tr("checkout.commentPlaceholder")}
              className="field resize-none"
            />
          </Section>

          <div className="space-y-3">
            <Checkbox checked={agreeData} onChange={setAgreeData}>
              {tr("checkout.agreeData")}
            </Checkbox>
            <Checkbox checked={agreeMarketing} onChange={setAgreeMarketing}>
              {tr("checkout.agreeMarketing")}
            </Checkbox>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card overflow-hidden">
            <div className="border-b border-line p-5">
              <h2 className="text-lg font-medium">{tr("checkout.yourOrder")}</h2>
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto p-5">
              {items.map(({ line, product }) => (
                <div key={line.productId} className="flex gap-3">
                  <ProductVisual tone={product!.tone} glyph={product!.glyph} image={product!.images?.[0]} className="h-14 w-14 shrink-0 rounded-lg" glyphSize={22} />
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-2 leading-snug text-ink">{product!.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{line.qty} × {formatCurrency(convertFromKrw(product!.price, currency).total, currency)}</p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(convertFromKrw(product!.price * line.qty, currency).total, currency)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-line p-5">
              <div className="flex justify-between text-base font-semibold text-ink">
                <span>{tr("checkout.totalWithCurrency", { currency })}</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
              {currency !== "KRW" && (
                <p className="mt-1 text-xs text-muted">{tr("checkout.feeNote", { amount: formatCurrency(totalKrw, "KRW") })}</p>
              )}
              {error && (
                <p className="mt-4 rounded-lg bg-sale/10 px-3 py-2 text-xs text-sale">{error}</p>
              )}
              <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full disabled:opacity-60">
                <I.Box size={18} /> {submitting ? tr("checkout.submitting") : tr("checkout.submit")}
              </button>
              <p className="mt-3 text-center text-xs text-muted">{tr("checkout.excelNote")}</p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-surface p-4 text-xs text-muted">
            <I.Info size={16} className="mt-0.5 shrink-0 text-accent" />
            {trSite("paymentNote")}
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card p-4 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-medium">{title}</h2>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, list }: { label: string; value: string; onChange: (v: string) => void; list?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="field" list={list} />
    </div>
  );
}

function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line accent-accent" />
      <span>{children}</span>
    </label>
  );
}
