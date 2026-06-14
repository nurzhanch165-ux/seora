"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useAdminAuth } from "@/store/adminAuth";
import { useOrders } from "@/store/orders";
import { useCatalogProducts } from "@/store/catalog";
import { brandName } from "@/data/brands";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";
import { exportOrderExcel } from "@/lib/excel";
import { Customer, Delivery } from "@/lib/types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductVisual } from "@/components/ProductVisual";
import * as I from "@/components/icons";

const DELIVERY_METHODS = ["Международная почта", "СДЭК", "Карго (авиа)", "Самовывоз со склада"];

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
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const createOrder = useOrders((s) => s.createOrder);
  const catalog = useCatalogProducts();

  const items = useMemo(
    () => lines.map((l) => ({ line: l, product: catalog.find((p) => p.id === l.productId) })).filter((x) => x.product),
    [lines, catalog]
  );
  const total = items.reduce((s, x) => s + x.product!.price * x.line.qty, 0);

  const [customer, setCustomer] = useState<Customer>({
    lastName: "", firstName: "", middleName: "", country: "", city: "",
    phone: "", whatsapp: "", telegram: "", email: "",
  });
  const [delivery, setDelivery] = useState<Delivery>({
    country: "", city: "", address: "", zip: "", recipient: "", recipientPhone: "",
    method: DELIVERY_METHODS[0], comment: "",
  });
  const [comment, setComment] = useState("");
  const [agreeData, setAgreeData] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  if (!hydrated || !adminReady) return <div className="container-site py-20 text-center text-muted">Загрузка…</div>;

  if (items.length === 0) {
    return (
      <div className="container-site py-8">
        <Breadcrumbs items={[{ label: "Оформление" }]} />
        <div className="card mt-8 flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-lg font-medium">В корзине нет товаров</p>
          <Link href="/c/cosmetics" className="btn-primary">Перейти в каталог</Link>
        </div>
      </div>
    );
  }

  if (!account && !adminLoggedIn) {
    return (
      <div className="container-site py-8">
        <Breadcrumbs items={[{ label: "Оформление" }]} />
        <div className="card mx-auto mt-8 flex max-w-lg flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <I.User size={26} />
          </span>
          <h1 className="h-display text-2xl">Войдите, чтобы оформить заказ</h1>
          <p className="max-w-sm text-sm text-muted">
            Регистрация нужна, чтобы сохранить заказ в личном кабинете, прислать Excel-файл и статус. Email указывать не обязательно.
          </p>
          <div className="mt-2 flex gap-3">
            <Link href="/register?next=/checkout" className="btn-primary">Регистрация</Link>
            <Link href="/login?next=/checkout" className="btn-outline">Войти</Link>
          </div>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const required: [string, string][] = [
      ["Фамилия", customer.lastName], ["Имя", customer.firstName], ["Отчество", customer.middleName],
      ["Страна", customer.country], ["Город", customer.city], ["Телефон", customer.phone],
      ["WhatsApp", customer.whatsapp], ["Telegram", customer.telegram],
      ["Получатель", delivery.recipient], ["Телефон получателя", delivery.recipientPhone],
      ["Страна доставки", delivery.country], ["Город доставки", delivery.city], ["Адрес", delivery.address],
    ];
    const missing = required.filter(([, v]) => !v.trim()).map(([k]) => k);
    if (missing.length) {
      setError(`Заполните обязательные поля: ${missing.join(", ")}.`);
      return;
    }
    if (!agreeData) {
      setError("Необходимо согласие на обработку персональных данных.");
      return;
    }

    setSubmitting(true);
    const res = await createOrder({
      number: genNumber(),
      createdAt: new Date().toISOString(),
      customerId: account?.id ?? null,
      customer: { ...customer, email: customer.email?.trim() || undefined },
      delivery: { ...delivery, comment },
      items: items.map((x) => ({
        productId: x.product!.id, slug: x.product!.slug, name: x.product!.name,
        brand: brandName(x.product!.brandSlug), price: x.product!.price, qty: x.line.qty,
      })),
      total,
      comment,
    });
    setSubmitting(false);
    if (!res.ok || !res.order) {
      setError(res.error ?? "Не удалось создать заказ. Попробуйте ещё раз.");
      return;
    }

    exportOrderExcel(res.order);
    clear();
    router.push(`/checkout/success?n=${encodeURIComponent(res.order.number)}`);
  }

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Корзина", href: "/cart" }, { label: "Оформление" }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">Оформление заказа</h1>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Section title="Контактные данные" hint="Используются для связи и уведомлений">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Фамилия *" value={customer.lastName} onChange={(v) => setCustomer({ ...customer, lastName: v })} />
              <Field label="Имя *" value={customer.firstName} onChange={(v) => setCustomer({ ...customer, firstName: v })} />
              <Field label="Отчество *" value={customer.middleName} onChange={(v) => setCustomer({ ...customer, middleName: v })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Страна *" value={customer.country} onChange={(v) => setCustomer({ ...customer, country: v })} />
              <Field label="Город *" value={customer.city} onChange={(v) => setCustomer({ ...customer, city: v })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Телефон *" value={customer.phone} onChange={(v) => setCustomer({ ...customer, phone: v })} />
              <Field label="WhatsApp *" value={customer.whatsapp} onChange={(v) => setCustomer({ ...customer, whatsapp: v })} />
              <Field label="Telegram *" value={customer.telegram} onChange={(v) => setCustomer({ ...customer, telegram: v })} />
            </div>
            <Field label="Email (необязательно)" value={customer.email ?? ""} onChange={(v) => setCustomer({ ...customer, email: v })} />
          </Section>

          <Section title="Доставка" hint="Куда отправить заказ">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Получатель *" value={delivery.recipient} onChange={(v) => setDelivery({ ...delivery, recipient: v })} />
              <Field label="Телефон получателя *" value={delivery.recipientPhone} onChange={(v) => setDelivery({ ...delivery, recipientPhone: v })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Страна *" value={delivery.country} onChange={(v) => setDelivery({ ...delivery, country: v })} />
              <Field label="Город *" value={delivery.city} onChange={(v) => setDelivery({ ...delivery, city: v })} />
              <Field label="Индекс" value={delivery.zip} onChange={(v) => setDelivery({ ...delivery, zip: v })} />
            </div>
            <Field label="Адрес *" value={delivery.address} onChange={(v) => setDelivery({ ...delivery, address: v })} />
            <div>
              <label className="field-label">Способ доставки</label>
              <div className="flex flex-wrap gap-2">
                {DELIVERY_METHODS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setDelivery({ ...delivery, method: m })}
                    className={`chip ${delivery.method === m ? "border-accent bg-accent-soft text-accent" : ""}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Комментарий к заказу" hint="Пожелания, удобный способ связи, вопросы">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Например: свяжитесь со мной в WhatsApp, доставка после 18:00…"
              className="field resize-none"
            />
          </Section>

          <div className="space-y-3">
            <Checkbox checked={agreeData} onChange={setAgreeData}>
              Согласен на обработку персональных данных
            </Checkbox>
            <Checkbox checked={agreeMarketing} onChange={setAgreeMarketing}>
              Хочу получать уведомления об акциях, новинках и прямых эфирах
            </Checkbox>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card overflow-hidden">
            <div className="border-b border-line p-5">
              <h2 className="text-lg font-medium">Ваш заказ</h2>
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto p-5">
              {items.map(({ line, product }) => (
                <div key={line.productId} className="flex gap-3">
                  <ProductVisual tone={product!.tone} glyph={product!.glyph} image={product!.images?.[0]} className="h-14 w-14 shrink-0 rounded-lg" glyphSize={22} />
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-2 leading-snug text-ink">{product!.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{line.qty} × {formatPrice(product!.price)}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(product!.price * line.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-line p-5">
              <div className="flex justify-between text-base font-semibold text-ink">
                <span>Итого</span>
                <span>{formatPrice(total)}</span>
              </div>
              {error && (
                <p className="mt-4 rounded-lg bg-sale/10 px-3 py-2 text-xs text-sale">{error}</p>
              )}
              <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full disabled:opacity-60">
                <I.Box size={18} /> {submitting ? "Формируем заказ…" : "Сформировать заказ"}
              </button>
              <p className="mt-3 text-center text-xs text-muted">
                Excel-файл скачается автоматически. Реквизиты для оплаты — на следующем шаге.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-surface p-4 text-xs text-muted">
            <I.Info size={16} className="mt-0.5 shrink-0 text-accent" />
            {site.payment.note}
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <div className="mb-5">
        <h2 className="text-lg font-medium">{title}</h2>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="field" />
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
