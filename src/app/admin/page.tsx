"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/adminAuth";
import { useOrders } from "@/store/orders";
import { useCatalog, useCatalogProducts } from "@/store/catalog";
import { Product } from "@/data/products";
import { brandName } from "@/data/brands";
import { formatPrice, formatDateShort } from "@/lib/format";
import { ORDER_STATUSES, OrderStatus } from "@/lib/types";
import { exportOrderExcel, exportWarehouseExcel } from "@/lib/excel";
import { ProductVisual } from "@/components/ProductVisual";
import { ProductEditor } from "@/components/admin/ProductEditor";
import * as I from "@/components/icons";

type Tab = "orders" | "warehouse" | "products";

export default function AdminPage() {
  const router = useRouter();
  const ready = useAdminAuth((s) => s.ready);
  const loggedIn = useAdminAuth((s) => s.loggedIn);
  const check = useAdminAuth((s) => s.check);
  const logout = useAdminAuth((s) => s.logout);
  const loadAll = useOrders((s) => s.loadAll);
  const [tab, setTab] = useState<Tab>("orders");

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    if (ready && !loggedIn) router.replace("/admin/login");
    if (ready && loggedIn) loadAll();
  }, [ready, loggedIn, router, loadAll]);

  if (!ready) return <div className="container-site py-20 text-center text-muted">Загрузка…</div>;
  if (!loggedIn) return <div className="container-site py-20 text-center text-muted">Перенаправление на страницу входа…</div>;

  return (
    <div className="container-site py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="h-display text-3xl md:text-4xl">Администратор</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
            {([["orders", "Заказы"], ["warehouse", "Склад / Excel"], ["products", "Товары"]] as [Tab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${tab === t ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { logout(); router.replace("/admin/login"); }}
            className="btn-outline px-4 py-2 text-sm"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="mt-8">
        {tab === "orders" && <OrdersAdmin />}
        {tab === "warehouse" && <WarehouseAdmin />}
        {tab === "products" && <ProductsAdmin />}
      </div>
    </div>
  );
}

function OrdersAdmin() {
  const orders = useOrders((s) => s.orders);
  const setStatus = useOrders((s) => s.setStatus);
  const confirmPayment = useOrders((s) => s.confirmPayment);
  const [openId, setOpenId] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: orders.length,
    paid: orders.filter((o) => o.paymentConfirmed).length,
    awaiting: orders.filter((o) => !o.paymentConfirmed).length,
    revenue: orders.filter((o) => o.paymentConfirmed).reduce((s, o) => s + o.total, 0),
  }), [orders]);

  if (orders.length === 0) {
    return <div className="card py-20 text-center text-muted">Заказов пока нет. Оформите тестовый заказ в каталоге.</div>;
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Всего заказов" value={String(stats.total)} />
        <Stat label="Оплачено" value={String(stats.paid)} />
        <Stat label="Ожидают оплату" value={String(stats.awaiting)} />
        <Stat label="Выручка (оплачено)" value={formatPrice(stats.revenue)} />
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const open = openId === order.id;
          return (
            <div key={order.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <button onClick={() => setOpenId(open ? null : order.id)} className="flex items-center gap-3 text-left">
                  <I.ChevronDown size={18} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
                  <div>
                    <p className="font-medium text-ink">{order.number}</p>
                    <p className="text-xs text-muted">
                      {formatDateShort(order.createdAt)} · {order.customer.lastName} {order.customer.firstName} · {formatPrice(order.total)}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  {order.paymentConfirmed ? (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                      <I.Check size={14} /> Оплачен
                    </span>
                  ) : (
                    <button onClick={() => confirmPayment(order.id)} className="btn-accent px-3 py-1.5 text-xs">
                      Подтвердить оплату
                    </button>
                  )}
                  <select
                    value={order.status}
                    onChange={(e) => setStatus(order.id, e.target.value as OrderStatus)}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs outline-none focus:border-accent"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {open && (
                <div className="grid gap-6 border-t border-line p-5 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">Клиент</h4>
                    <dl className="space-y-1 text-sm text-muted">
                      <Row label="ФИО" value={`${order.customer.lastName} ${order.customer.firstName} ${order.customer.middleName}`} />
                      <Row label="Страна / город" value={`${order.customer.country}, ${order.customer.city}`} />
                      <Row label="Телефон" value={order.customer.phone} />
                      <Row label="WhatsApp" value={order.customer.whatsapp} />
                      <Row label="Telegram" value={order.customer.telegram} />
                      <Row label="Email" value={order.customer.email || "—"} />
                    </dl>
                    <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-ink">Доставка</h4>
                    <dl className="space-y-1 text-sm text-muted">
                      <Row label="Получатель" value={order.delivery.recipient} />
                      <Row label="Адрес" value={`${order.delivery.country}, ${order.delivery.city}, ${order.delivery.address} ${order.delivery.zip}`} />
                      <Row label="Способ" value={order.delivery.method} />
                    </dl>
                    {order.comment && (
                      <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-xs text-muted">Комментарий: {order.comment}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">Состав заказа</h4>
                    <div className="space-y-1.5 text-sm">
                      {order.items.map((it) => (
                        <div key={it.productId} className="flex justify-between gap-3">
                          <span className="text-ink">{it.name}</span>
                          <span className="shrink-0 text-muted">{it.qty} × {formatPrice(it.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between border-t border-line pt-2 text-sm font-semibold">
                      <span>Итого</span><span>{formatPrice(order.total)}</span>
                    </div>

                    <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-ink">Скриншот оплаты</h4>
                    {order.paymentScreenshot ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={order.paymentScreenshot} alt="Оплата" className="max-h-56 rounded-lg border border-line" />
                    ) : (
                      <p className="text-sm text-muted">Скриншот ещё не загружен клиентом.</p>
                    )}

                    <button onClick={() => exportOrderExcel(order)} className="btn-outline mt-4 text-sm">
                      <I.Download size={16} /> Excel заказа
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function WarehouseAdmin() {
  const orders = useOrders((s) => s.orders);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [paidOnly, setPaidOnly] = useState(true);

  function preset(days: number) {
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - days + 1);
    setFrom(start.toISOString().slice(0, 10));
    setTo(now.toISOString().slice(0, 10));
  }

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (paidOnly && !o.paymentConfirmed) return false;
      const d = o.createdAt.slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [orders, from, to, paidOnly]);

  const totalSum = filtered.reduce((s, o) => s + o.total, 0);

  function exportNow() {
    const label = from || to ? `${from || "…"} — ${to || "…"}` : "все даты";
    exportWarehouseExcel(filtered, `${label}${paidOnly ? " · только оплаченные" : ""}`);
  }

  return (
    <div className="card p-6 md:p-8">
      <h2 className="text-lg font-medium">Общий Excel-файл для склада</h2>
      <p className="mt-1 text-sm text-muted">
        Объедините заказы за период в один файл для отгрузки. Отправки формируются дважды в неделю.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => preset(1)} className="chip">Сегодня</button>
        <button onClick={() => preset(7)} className="chip">За неделю</button>
        <button onClick={() => preset(30)} className="chip">За месяц</button>
        <button onClick={() => { setFrom(""); setTo(""); }} className="chip">Все даты</button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">С даты</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field" />
        </div>
        <div>
          <label className="field-label">По дату</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field" />
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-muted">
        <input type="checkbox" checked={paidOnly} onChange={(e) => setPaidOnly(e.target.checked)} className="h-4 w-4 accent-accent" />
        Только оплаченные заказы
      </label>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-paper p-4">
        <div className="flex-1">
          <p className="text-sm text-muted">К выгрузке: <span className="font-medium text-ink">{filtered.length}</span> заказов на <span className="font-medium text-ink">{formatPrice(totalSum)}</span></p>
        </div>
        <button onClick={exportNow} disabled={filtered.length === 0} className="btn-primary">
          <I.Download size={18} /> Скачать общий Excel
        </button>
      </div>
    </div>
  );
}

function ProductsAdmin() {
  const all = useCatalogProducts();
  const addProduct = useCatalog((s) => s.addProduct);
  const updateProduct = useCatalog((s) => s.updateProduct);
  const removeProduct = useCatalog((s) => s.removeProduct);

  // mode: "list" | "new" | id редактируемого товара
  const [mode, setMode] = useState<"list" | "new" | string>("list");
  const [query, setQuery] = useState("");
  const [actionError, setActionError] = useState("");

  const editing = useMemo(
    () => (mode !== "list" && mode !== "new" ? all.find((p) => p.id === mode) : undefined),
    [all, mode]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (p) => `${p.name} ${brandName(p.brandSlug)}`.toLowerCase().includes(q)
    );
  }, [all, query]);

  if (mode === "new") {
    return (
      <div className="card p-6 md:p-8">
        <h2 className="mb-6 text-lg font-medium">Новый товар</h2>
        <ProductEditor
          onSave={async (p) => {
            const res = await addProduct(p);
            if (res.ok) setMode("list");
            return res;
          }}
          onCancel={() => setMode("list")}
        />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="card p-6 md:p-8">
        <h2 className="mb-6 text-lg font-medium">Редактирование: {editing.name}</h2>
        <ProductEditor
          product={editing}
          onSave={async (p) => {
            const res = await updateProduct(p.id, p);
            if (res.ok) setMode("list");
            return res;
          }}
          onCancel={() => setMode("list")}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Каталог · {all.length} товаров</h2>
          <p className="text-sm text-muted">Можно изменить любой товар, включая фотографии, или добавить новый.</p>
        </div>
        <button onClick={() => setMode("new")} className="btn-primary">
          <I.Plus size={18} /> Добавить товар
        </button>
      </div>

      <div className="mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию или бренду…"
          className="field max-w-md"
        />
      </div>

      {actionError && (
        <p className="mb-5 rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{actionError}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="flex gap-3 rounded-xl2 border border-line bg-surface p-3">
            <ProductVisual
              tone={p.tone}
              glyph={p.glyph}
              image={p.images?.[0]}
              className="h-20 w-20 shrink-0 rounded-xl"
              glyphSize={30}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="truncate text-sm font-medium text-ink">{p.name}</p>
              <p className="text-xs text-muted">{brandName(p.brandSlug)}</p>
              <p className="mt-0.5 text-xs text-muted">{formatPrice(p.price)} · остаток {p.stock}</p>
              <div className="mt-auto flex gap-2 pt-2">
                <button onClick={() => setMode(p.id)} className="btn-outline px-3 py-1.5 text-xs">
                  <I.Edit size={14} /> Изменить
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`Удалить «${p.name}»?`)) return;
                    const res = await removeProduct(p.id);
                    if (!res.ok) setActionError(res.error ?? "Не удалось удалить товар.");
                  }}
                  className="flex items-center justify-center rounded-full border border-line px-2.5 text-faint hover:border-sale hover:text-sale"
                  aria-label="Удалить"
                >
                  <I.Trash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-faint">{label}:</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
