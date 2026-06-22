"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/adminAuth";
import { useOrders } from "@/store/orders";
import { useCatalog } from "@/store/catalog";
import { Product } from "@/data/products";
import { brandName } from "@/data/brands";
import { formatPrice, formatDateShort } from "@/lib/format";
import { ORDER_STATUSES, OrderStatus, getStatusLabel } from "@/lib/types";
import { exportOrderExcel, exportWarehouseExcel, exportDailyOrdersExcel, exportItemsTotalExcel } from "@/lib/excel";
import { buildStreamPositionMap, type StreamPositionMap } from "@/lib/excelCore";
import { ProductVisual } from "@/components/ProductVisual";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { CategoryEditor } from "@/components/admin/CategoryEditor";
import { StreamEditor } from "@/components/admin/StreamEditor";
import { useCatalogTree } from "@/store/catalogTree";
import { useAdminSession } from "@/hooks/useAdminSession";
import { useT, useLocale } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

type Tab = "orders" | "warehouse" | "products" | "streams" | "customers";

export default function AdminPage() {
  const router = useRouter();
  const tr = useT();
  const { checked, loggedIn } = useAdminSession("requireAuth");
  const logout = useAdminAuth((s) => s.logout);
  const loadAll = useOrders((s) => s.loadAll);
  const [tab, setTab] = useState<Tab>("orders");

  const loadCatalog = useCatalog((s) => s.load);
  const loadCatalogTree = useCatalogTree((s) => s.load);

  useEffect(() => {
    if (checked && loggedIn) {
      loadAll();
      loadCatalog();
      loadCatalogTree();
    }
  }, [checked, loggedIn, loadAll, loadCatalog, loadCatalogTree]);

  if (!checked) return <div className="container-site py-20 text-center text-muted">{tr("common.loading")}</div>;
  if (!loggedIn) return <div className="container-site py-20 text-center text-muted">{tr("admin.redirecting")}</div>;

  const tabs: [Tab, string][] = [
    ["orders", tr("admin.tab.orders")],
    ["warehouse", tr("admin.tab.warehouse")],
    ["products", tr("admin.tab.products")],
    ["streams", tr("admin.tab.streams")],
    ["customers", tr("admin.tab.customers")],
  ];

  return (
    <div className="container-site py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="h-display text-3xl md:text-4xl">{tr("admin.title")}</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-full border border-line bg-surface p-1">
            {tabs.map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${tab === t ? "bg-ink text-pearl" : "text-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { logout(); router.replace("/login"); }}
            className="btn-outline px-4 py-2 text-sm"
          >
            {tr("admin.logout")}
          </button>
        </div>
      </div>

      <div className="mt-8">
        {tab === "orders" && <OrdersAdmin />}
        {tab === "warehouse" && <WarehouseAdmin />}
        {tab === "products" && <ProductsAdmin />}
        {tab === "streams" && <StreamsAdmin />}
        {tab === "customers" && <CustomersAdmin />}
      </div>
    </div>
  );
}

function OrdersAdmin() {
  const tr = useT();
  const locale = useLocale();
  const orders = useOrders((s) => s.orders);
  const setStatus = useOrders((s) => s.setStatus);
  const confirmPayment = useOrders((s) => s.confirmPayment);
  const updateAdminComment = useOrders((s) => s.updateAdminComment);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterDelivery, setFilterDelivery] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = useMemo(() => orders.filter((o) => {
    if (filterCountry && !(o.customer.country.includes(filterCountry) || o.delivery.country.includes(filterCountry))) return false;
    if (filterDelivery && !o.delivery.method.toLowerCase().includes(filterDelivery.toLowerCase())) return false;
    if (filterPayment === "paid" && !o.paymentConfirmed) return false;
    if (filterPayment === "awaiting" && o.paymentConfirmed) return false;
    if (filterStatus && o.status !== filterStatus) return false;
    return true;
  }), [orders, filterCountry, filterDelivery, filterPayment, filterStatus]);

  const stats = useMemo(() => ({
    total: filtered.length,
    paid: filtered.filter((o) => o.paymentConfirmed).length,
    awaiting: filtered.filter((o) => !o.paymentConfirmed).length,
    revenue: filtered.filter((o) => o.paymentConfirmed).reduce((s, o) => s + (o.totalConverted ?? o.total), 0),
  }), [filtered]);

  if (orders.length === 0) {
    return <div className="card py-20 text-center text-muted">{tr("admin.orders.empty")}</div>;
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input placeholder={tr("admin.orders.filter.country")} value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="field text-sm" />
        <input placeholder={tr("admin.orders.filter.delivery")} value={filterDelivery} onChange={(e) => setFilterDelivery(e.target.value)} className="field text-sm" />
        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="field text-sm">
          <option value="">{tr("admin.orders.filter.allPayments")}</option>
          <option value="paid">{tr("admin.orders.filter.paid")}</option>
          <option value="awaiting">{tr("admin.orders.filter.awaiting")}</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="field text-sm">
          <option value="">{tr("admin.orders.filter.allStatuses")}</option>
          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{getStatusLabel(s.value, locale)}</option>)}
        </select>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={tr("admin.orders.stat.total")} value={String(stats.total)} />
        <Stat label={tr("admin.orders.stat.paid")} value={String(stats.paid)} />
        <Stat label={tr("admin.orders.stat.awaiting")} value={String(stats.awaiting)} />
        <Stat label={tr("admin.orders.stat.revenue")} value={formatPrice(stats.revenue)} />
      </div>

      <div className="space-y-3">
        {filtered.map((order) => {
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
                      {order.source === "stream" && (
                        <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-accent">{tr("admin.orders.streamBadge")}</span>
                      )}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  {order.paymentConfirmed ? (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                      <I.Check size={14} /> {tr("admin.orders.paidBadge")}
                    </span>
                  ) : (
                    <button onClick={() => confirmPayment(order.id)} className="btn-accent px-3 py-1.5 text-xs">
                      {tr("admin.orders.confirmPayment")}
                    </button>
                  )}
                  <select
                    value={order.status}
                    onChange={(e) => setStatus(order.id, e.target.value as OrderStatus)}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs outline-none focus:border-accent"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{getStatusLabel(s.value, locale)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {open && (
                <div className="grid gap-6 border-t border-line p-5 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">{tr("admin.orders.client")}</h4>
                    <dl className="space-y-1 text-sm text-muted">
                      <Row label={tr("admin.orders.fullName")} value={`${order.customer.lastName} ${order.customer.firstName} ${order.customer.middleName}`} />
                      <Row label={tr("admin.orders.countryCity")} value={`${order.customer.country}, ${order.customer.city}`} />
                      <Row label={tr("admin.orders.phone")} value={order.customer.phone} />
                      <Row label="WhatsApp" value={order.customer.whatsapp} />
                      <Row label="Telegram" value={order.customer.telegram} />
                      <Row label="Email" value={order.customer.email || "—"} />
                    </dl>
                    <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-ink">{tr("admin.orders.delivery")}</h4>
                    <dl className="space-y-1 text-sm text-muted">
                      <Row label={tr("admin.orders.recipient")} value={order.delivery.recipient} />
                      <Row label={tr("admin.orders.address")} value={`${order.delivery.country}, ${order.delivery.city}, ${order.delivery.address} ${order.delivery.zip}`} />
                      <Row label={tr("admin.orders.method")} value={order.delivery.method} />
                    </dl>
                    {order.comment && (
                      <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-xs text-muted">{tr("admin.orders.clientComment")}: {order.comment}</p>
                    )}
                    <div className="mt-4">
                      <label className="field-label">{tr("admin.orders.adminComment")}</label>
                      <textarea
                        defaultValue={order.adminComment ?? ""}
                        rows={2}
                        className="field mt-1 text-sm"
                        onBlur={async (e) => {
                          const value = e.target.value;
                          if (value === (order.adminComment ?? "")) return;
                          await updateAdminComment(order.id, value);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">{tr("admin.orders.items")}</h4>
                    <div className="space-y-1.5 text-sm">
                      {order.items.map((it) => (
                        <div key={it.productId} className="flex justify-between gap-3">
                          <span className="text-ink">{it.name}</span>
                          <span className="shrink-0 text-muted">{it.qty} × {formatPrice(it.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between border-t border-line pt-2 text-sm font-semibold">
                      <span>{tr("admin.orders.total")}</span><span>{formatPrice(order.total)}</span>
                    </div>

                    <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-ink">{tr("admin.orders.paymentScreenshot")}</h4>
                    {order.paymentScreenshot ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={order.paymentScreenshot} alt="" className="max-h-56 rounded-lg border border-line" />
                    ) : (
                      <p className="text-sm text-muted">{tr("admin.orders.noScreenshot")}</p>
                    )}

                    <button onClick={() => void exportOrderExcel(order)} className="btn-outline mt-4 text-sm">
                      <I.Download size={16} /> {tr("admin.orders.exportExcel")}
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
  const tr = useT();
  const orders = useOrders((s) => s.orders);
  const products = useCatalog((s) => s.products);
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [paidOnly, setPaidOnly] = useState(false);
  const [streamId, setStreamId] = useState("");
  const [streams, setStreams] = useState<{ id: string; title: string }[]>([]);
  const [streamPositions, setStreamPositions] = useState<StreamPositionMap>({});
  const [autoExports, setAutoExports] = useState<{ name: string; path: string; url: string | null; createdAt?: string }[]>([]);
  const [exportMsg, setExportMsg] = useState("");

  useEffect(() => {
    fetch("/api/streams")
      .then((r) => r.json())
      .then(async (j) => {
        const list: { id: string; title: string }[] = j.streams ?? [];
        setStreams(list);
        const map: StreamPositionMap = {};
        await Promise.all(
          list.map(async (stream) => {
            const detail = await fetch(`/api/streams/${stream.id}`).then((r) => r.json());
            (detail.products ?? []).forEach((p: { id: string; position?: number }, i: number) => {
              map[`${stream.id}:${p.id}`] = (p.position ?? i) + 1;
            });
          })
        );
        setStreamPositions(map);
      });
    fetch("/api/admin/exports").then((r) => r.json()).then((j) => setAutoExports(j.files ?? []));
  }, []);

  async function runAutoExport() {
    setExportMsg("");
    const res = await fetch("/api/admin/exports", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const j = await res.json();
    if (!res.ok) { setExportMsg(j.error ?? tr("errors.generic")); return; }
    setExportMsg(tr("admin.warehouse.generated", { count: j.orderCount, date: j.date }));
    const list = await fetch("/api/admin/exports").then((r) => r.json());
    setAutoExports(list.files ?? []);
  }

  const stockByProductId = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => { map[p.id] = p.stock; });
    return map;
  }, [products]);

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
      if (streamId && o.streamId !== streamId) return false;
      const d = o.createdAt.slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [orders, from, to, paidOnly, streamId]);

  const dateLabel = from === to ? from.replace(/-/g, "_") : `${from}_${to}`;
  const streamSuffix = streamId
    ? streams.find((s) => s.id === streamId)?.title.replace(/\s+/g, "_").slice(0, 40) ?? "stream"
    : undefined;

  return (
    <div className="space-y-6">
      <div className="card p-6 md:p-8">
        <h2 className="text-lg font-medium">{tr("admin.warehouse.title")}</h2>
        <p className="mt-1 text-sm text-muted">{tr("admin.warehouse.subtitle")}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => preset(1)} className="chip">{tr("admin.warehouse.today")}</button>
          <button onClick={() => preset(7)} className="chip">{tr("admin.warehouse.week")}</button>
          <button onClick={() => { const t = new Date().toISOString().slice(0, 10); setFrom(t); setTo(t); }} className="chip">{tr("admin.warehouse.dateOnly")}</button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">{tr("admin.warehouse.from")}</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field" />
          </div>
          <div>
            <label className="field-label">{tr("admin.warehouse.to")}</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field" />
          </div>
        </div>

        <div className="mt-4">
          <label className="field-label">{tr("admin.warehouse.stream")}</label>
          <select value={streamId} onChange={(e) => setStreamId(e.target.value)} className="field max-w-md">
            <option value="">{tr("admin.warehouse.allOrders")}</option>
            {streams.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-muted">
          <input type="checkbox" checked={paidOnly} onChange={(e) => setPaidOnly(e.target.checked)} className="h-4 w-4 accent-accent" />
          {tr("admin.warehouse.paidOnly")}
        </label>

        <p className="mt-4 text-sm text-muted">{tr("admin.warehouse.exportCount", { count: filtered.length })}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => exportWarehouseExcel(filtered, dateLabel, { streamPositions, fileSuffix: streamSuffix })}
            disabled={filtered.length === 0}
            className="btn-primary text-sm"
          >
            <I.Download size={16} /> warehouse_{dateLabel}{streamSuffix ? `_${streamSuffix}` : ""}.xlsx
          </button>
          <button
            onClick={() => exportDailyOrdersExcel(filtered, dateLabel, streamSuffix)}
            disabled={filtered.length === 0}
            className="btn-outline text-sm"
          >
            <I.Download size={16} /> orders_{dateLabel}{streamSuffix ? `_${streamSuffix}` : ""}.xlsx
          </button>
          <button
            onClick={() => exportItemsTotalExcel(filtered, { dateLabel, stockByProductId, fileSuffix: streamSuffix })}
            disabled={filtered.length === 0}
            className="btn-outline text-sm"
          >
            <I.Download size={16} /> items_total
          </button>
        </div>
      </div>

      <div className="card p-6 md:p-8">
        <h2 className="text-lg font-medium">{tr("admin.warehouse.cronTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{tr("admin.warehouse.cronSubtitle")}</p>
        <button onClick={runAutoExport} className="btn-outline mt-4 text-sm">{tr("admin.warehouse.runToday")}</button>
        {exportMsg && <p className="mt-3 text-sm text-accent">{exportMsg}</p>}
        {autoExports.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {autoExports.map((f) => (
              <li key={f.path} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-pearl px-3 py-2">
                <span className="text-ink">{f.name}</span>
                {f.url ? (
                  <a href={f.url} className="text-accent hover:underline" download>{tr("admin.warehouse.download")}</a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StreamsAdmin() {
  const tr = useT();
  const all = useCatalog((s) => s.products);
  const [streams, setStreams] = useState<{ id: string; title: string; stream_date: string; ended_at: string }[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [streamDate, setStreamDate] = useState(new Date().toISOString().slice(0, 10));
  const [endedAt, setEndedAt] = useState(new Date().toISOString().slice(0, 16));
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceBody, setAnnounceBody] = useState("");
  const [announceTiktok, setAnnounceTiktok] = useState("https://www.tiktok.com/@shopkorea8");
  const [announceBusy, setAnnounceBusy] = useState(false);
  const [announceResult, setAnnounceResult] = useState("");

  useEffect(() => {
    fetch("/api/streams").then((r) => r.json()).then((j) => setStreams(j.streams ?? []));
  }, []);

  async function createStream() {
    setMsg("");
    const res = await fetch("/api/streams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || tr("admin.streams.defaultTitle", { date: streamDate }),
        streamDate,
        endedAt: new Date(endedAt).toISOString(),
        products: selectedProducts.map((id, i) => ({ productId: id, position: i })),
      }),
    });
    const j = await res.json();
    if (!res.ok) { setMsg(j.error ?? tr("errors.generic")); return; }
    setStreams((s) => [j.stream, ...s]);
    setTitle("");
    setSelectedProducts([]);
    setMsg(tr("admin.streams.created"));
  }

  async function sendAnnouncement() {
    setAnnounceBusy(true);
    setAnnounceResult("");
    const res = await fetch("/api/admin/announce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: announceTitle || tr("admin.streams.announceDefaultTitle"),
        body: announceBody,
        tiktokUrl: announceTiktok,
      }),
    });
    const j = await res.json();
    setAnnounceBusy(false);
    if (!res.ok) {
      setAnnounceResult(j.error ?? tr("errors.generic"));
      return;
    }
    setAnnounceResult(tr("admin.streams.announceSent", {
      count: String(j.recipients ?? 0),
      email: String(j.sentEmail ?? 0),
      push: String(j.sentPush ?? 0),
    }));
  }

  if (editId) {
    return (
      <StreamEditor
        streamId={editId}
        catalog={all}
        onClose={() => setEditId(null)}
        onSaved={() => {
          fetch("/api/streams").then((r) => r.json()).then((j) => setStreams(j.streams ?? []));
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-medium">{tr("admin.streams.newTitle")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="field-label">{tr("admin.streams.name")}</label><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr("admin.streams.namePlaceholder")} /></div>
          <div><label className="field-label">{tr("admin.streams.date")}</label><input type="date" className="field" value={streamDate} onChange={(e) => setStreamDate(e.target.value)} /></div>
          <div><label className="field-label">{tr("admin.streams.end")}</label><input type="datetime-local" className="field" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} /></div>
        </div>
        <div className="mt-4">
          <label className="field-label">{tr("admin.streams.productsFromCatalog")}</label>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-line p-3">
            {all.slice(0, 30).map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={(e) => {
                  setSelectedProducts((prev) => e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id));
                }} />
                {p.name}
              </label>
            ))}
          </div>
        </div>
        {msg && <p className="mt-3 text-sm text-accent">{msg}</p>}
        <button onClick={createStream} className="btn-primary mt-4">{tr("admin.streams.create")}</button>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium">{tr("admin.streams.announceTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{tr("admin.streams.announceHint")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label">{tr("admin.streams.announceHeading")}</label>
            <input className="field" value={announceTitle} onChange={(e) => setAnnounceTitle(e.target.value)} placeholder={tr("admin.streams.announceDefaultTitle")} />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">{tr("admin.streams.announceMessage")}</label>
            <textarea className="field resize-none" rows={3} value={announceBody} onChange={(e) => setAnnounceBody(e.target.value)} placeholder={tr("admin.streams.announceDefaultBody")} />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">TikTok</label>
            <input className="field" value={announceTiktok} onChange={(e) => setAnnounceTiktok(e.target.value)} />
          </div>
        </div>
        {announceResult && <p className="mt-3 text-sm text-accent">{announceResult}</p>}
        <button onClick={sendAnnouncement} disabled={announceBusy} className="btn-accent mt-4">
          {announceBusy ? tr("admin.streams.announceSending") : tr("admin.streams.announceSend")}
        </button>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium">{tr("admin.streams.allTitle", { count: streams.length })}</h2>
        <div className="mt-4 space-y-2">
          {streams.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-muted">{s.stream_date}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditId(s.id)} className="btn-outline px-3 py-1.5 text-xs">{tr("admin.streams.edit")}</button>
                <Link href={`/streams/${s.id}`} className="btn-outline px-3 py-1.5 text-xs">{tr("admin.streams.open")}</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsPanelNav({
  panel,
  setPanel,
  tr,
}: {
  panel: "products" | "catalog";
  setPanel: (p: "products" | "catalog") => void;
  tr: (key: string) => string;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setPanel("products")}
        className={`chip ${panel === "products" ? "border-accent bg-accent-soft text-accent" : ""}`}
      >
        {tr("admin.products.tabProducts")}
      </button>
      <button
        type="button"
        onClick={() => setPanel("catalog")}
        className={`chip ${panel === "catalog" ? "border-accent bg-accent-soft text-accent" : ""}`}
      >
        {tr("admin.products.tabCatalog")}
      </button>
    </div>
  );
}

function ProductsAdmin() {
  const tr = useT();
  const all = useCatalog((s) => s.products);
  const addProduct = useCatalog((s) => s.addProduct);
  const updateProduct = useCatalog((s) => s.updateProduct);
  const removeProduct = useCatalog((s) => s.removeProduct);

  const [panel, setPanel] = useState<"products" | "catalog">("products");
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
      <div>
        <ProductsPanelNav panel={panel} setPanel={setPanel} tr={tr} />
        <div className="card p-6 md:p-8">
          <h2 className="mb-6 text-lg font-medium">{tr("admin.products.newTitle")}</h2>
          <ProductEditor
            onSave={async (p) => {
              const res = await addProduct(p);
              if (res.ok) setMode("list");
              return res;
            }}
            onCancel={() => setMode("list")}
          />
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div>
        <ProductsPanelNav panel={panel} setPanel={setPanel} tr={tr} />
        <div className="card p-6 md:p-8">
          <h2 className="mb-6 text-lg font-medium">{tr("admin.products.editTitle", { name: editing.name })}</h2>
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
      </div>
    );
  }

  if (panel === "catalog") {
    return (
      <div>
        <ProductsPanelNav panel={panel} setPanel={setPanel} tr={tr} />
        <CategoryEditor />
      </div>
    );
  }

  return (
    <div>
      <ProductsPanelNav panel={panel} setPanel={setPanel} tr={tr} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">{tr("admin.products.catalogTitle", { count: all.length })}</h2>
          <p className="text-sm text-muted">{tr("admin.products.catalogHint")}</p>
        </div>
        <button onClick={() => setMode("new")} className="btn-primary">
          <I.Plus size={18} /> {tr("admin.products.add")}
        </button>
      </div>

      <div className="mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr("admin.products.search")}
          className="field max-w-md"
        />
      </div>

      {actionError && (
        <p className="mb-5 rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{actionError}</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="flex min-w-0 gap-3 rounded-xl2 border border-line bg-surface p-3">
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
              <p className="mt-0.5 text-xs text-muted">{formatPrice(p.price)} · {tr("admin.products.stock")} {p.stock}{p.active === false ? ` · ${tr("admin.products.hidden")}` : ""}</p>
              <div className="mt-auto flex gap-2 pt-2">
                <button onClick={() => setMode(p.id)} className="btn-outline px-3 py-1.5 text-xs">
                  <I.Edit size={14} /> {tr("admin.products.edit")}
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(tr("admin.products.deleteConfirm", { name: p.name }))) return;
                    const res = await removeProduct(p.id);
                    if (!res.ok) setActionError(res.error ?? tr("admin.products.deleteFailed"));
                  }}
                  className="flex items-center justify-center rounded-full border border-line px-2.5 text-faint hover:border-sale hover:text-sale"
                  aria-label={tr("admin.products.delete")}
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

function CustomersAdmin() {
  const tr = useT();
  type AdminCustomer = {
    id: string;
    login: string;
    lastName: string;
    firstName: string;
    middleName: string;
    country: string;
    city: string;
    phone: string;
    whatsapp: string;
    telegram: string;
    email?: string | null;
    zip: string;
    address: string;
    adminComment: string;
    createdAt: string;
    orderCount: number;
    orders: { id: string; number: string; createdAt: string; status: string; paymentConfirmed: boolean; total: number }[];
  };

  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((j) => setCustomers(j.customers ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      `${c.lastName} ${c.firstName} ${c.login} ${c.phone} ${c.city}`.toLowerCase().includes(q)
    );
  }, [customers, query]);

  async function saveComment(id: string, adminComment: string) {
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminComment }),
    });
    const j = await res.json();
    if (!res.ok) {
      setMsg(j.error ?? tr("admin.customers.commentFailed"));
      return;
    }
    setCustomers((list) => list.map((c) => (c.id === id ? { ...c, adminComment } : c)));
    setMsg("");
  }

  if (loading) return <div className="card py-20 text-center text-muted">{tr("admin.customers.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">{tr("admin.customers.title", { count: customers.length })}</h2>
          <p className="text-sm text-muted">{tr("admin.customers.subtitle")}</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr("admin.customers.search")}
          className="field max-w-sm"
        />
      </div>

      {msg && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{msg}</p>}

      {filtered.length === 0 ? (
        <div className="card py-16 text-center text-muted">{tr("admin.customers.empty")}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const open = openId === c.id;
            return (
              <div key={c.id} className="card overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : c.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <I.ChevronDown size={18} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
                    <div>
                      <p className="font-medium text-ink">
                        {c.lastName} {c.firstName} {c.middleName}
                      </p>
                      <p className="text-xs text-muted">
                        @{c.login} · {c.phone} · {c.city}, {c.country}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-sand px-3 py-1 text-xs text-ink">{tr("admin.customers.ordersCount", { count: c.orderCount })}</span>
                </button>

                {open && (
                  <div className="grid gap-6 border-t border-line p-5 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">{tr("admin.customers.contacts")}</h4>
                      <dl className="space-y-1 text-sm text-muted">
                        <Row label="WhatsApp" value={c.whatsapp || "—"} />
                        <Row label="Telegram" value={c.telegram || "—"} />
                        <Row label="Email" value={c.email || "—"} />
                        <Row label={tr("admin.orders.address")} value={[c.country, c.city, c.address, c.zip].filter(Boolean).join(", ") || "—"} />
                        <Row label={tr("admin.customers.registration")} value={formatDateShort(c.createdAt)} />
                      </dl>
                      <div className="mt-4">
                        <label className="field-label">{tr("admin.orders.adminComment")}</label>
                        <textarea
                          defaultValue={c.adminComment}
                          rows={2}
                          className="field mt-1 text-sm"
                          onBlur={(e) => saveComment(c.id, e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">{tr("admin.customers.orderHistory")}</h4>
                      {c.orders.length === 0 ? (
                        <p className="text-sm text-muted">{tr("admin.customers.noOrders")}</p>
                      ) : (
                        <div className="space-y-2 text-sm">
                          {c.orders.map((o) => (
                            <div key={o.id} className="flex justify-between gap-3 rounded-lg bg-paper px-3 py-2">
                              <span className="text-ink">{o.number}</span>
                              <span className="text-muted">
                                {formatDateShort(o.createdAt)} · {formatPrice(o.total)}
                                {o.paymentConfirmed ? tr("admin.customers.paidSuffix") : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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
