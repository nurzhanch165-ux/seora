"use client";

import { useEffect, useState } from "react";
import { Product } from "@/data/products";

type StreamProduct = {
  productId: string;
  name: string;
  basePrice: number;
  stock: number;
  priceOverride: string;
  streamStock: string;
  position: number;
};

type StreamDetail = {
  id: string;
  title: string;
  stream_date: string;
  ended_at: string;
};

export function StreamEditor({
  streamId,
  catalog,
  onClose,
  onSaved,
}: {
  streamId: string;
  catalog: Product[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [title, setTitle] = useState("");
  const [streamDate, setStreamDate] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [products, setProducts] = useState<StreamProduct[]>([]);
  const [addId, setAddId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/streams/${streamId}`)
      .then((r) => r.json())
      .then((j) => {
        const s = j.stream as StreamDetail;
        setStream(s);
        setTitle(s.title);
        setStreamDate(s.stream_date?.slice(0, 10) ?? "");
        setEndedAt(s.ended_at?.slice(0, 16) ?? "");
        setProducts(
          (j.products ?? []).map((p: Record<string, unknown>, i: number) => ({
            productId: String(p.id),
            name: String(p.name),
            basePrice: Number(p.price),
            stock: Number(p.stock),
            priceOverride: String(p.streamPrice ?? p.price ?? ""),
            streamStock: String(p.streamStock ?? p.stock ?? 0),
            position: i,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [streamId]);

  function addProduct() {
    if (!addId) return;
    const p = catalog.find((x) => x.id === addId);
    if (!p || products.some((x) => x.productId === addId)) return;
    setProducts((list) => [
      ...list,
      {
        productId: p.id,
        name: p.name,
        basePrice: p.price,
        stock: p.stock,
        priceOverride: String(p.price),
        streamStock: String(p.stock),
        position: list.length,
      },
    ]);
    setAddId("");
  }

  async function save() {
    setMsg("");
    const res = await fetch(`/api/streams/${streamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        streamDate,
        endedAt: new Date(endedAt).toISOString(),
        products: products.map((p, i) => ({
          productId: p.productId,
          position: i,
          stock: Number(p.streamStock) || 0,
          priceOverride: Number(p.priceOverride) || null,
        })),
      }),
    });
    const j = await res.json();
    if (!res.ok) {
      setMsg(j.error ?? "Ошибка сохранения");
      return;
    }
    setMsg("Сохранено");
    onSaved();
  }

  if (loading) return <div className="card p-6 text-muted">Загрузка стрима…</div>;

  return (
    <div className="card p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Редактирование: {stream?.title}</h2>
        <button onClick={onClose} className="btn-outline px-3 py-1.5 text-sm">Назад к списку</button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><label className="field-label">Название</label><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><label className="field-label">Дата стрима</label><input type="date" className="field" value={streamDate} onChange={(e) => setStreamDate(e.target.value)} /></div>
        <div><label className="field-label">Окончание стрима</label><input type="datetime-local" className="field" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} /></div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">Товары стрима</h3>
        <div className="mt-3 space-y-2">
          {products.map((p) => (
            <div key={p.productId} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_100px_100px_auto] sm:items-end">
              <div>
                <p className="text-sm font-medium text-ink">{p.name}</p>
                <p className="text-xs text-muted">База: ₩{p.basePrice.toLocaleString()} · остаток {p.stock}</p>
              </div>
              <div>
                <label className="field-label text-[10px]">Цена стрима (KRW)</label>
                <input className="field text-sm" value={p.priceOverride} onChange={(e) => setProducts((list) => list.map((x) => x.productId === p.productId ? { ...x, priceOverride: e.target.value } : x))} />
              </div>
              <div>
                <label className="field-label text-[10px]">Остаток стрима</label>
                <input className="field text-sm" value={p.streamStock} onChange={(e) => setProducts((list) => list.map((x) => x.productId === p.productId ? { ...x, streamStock: e.target.value } : x))} />
              </div>
              <button type="button" onClick={() => setProducts((list) => list.filter((x) => x.productId !== p.productId))} className="btn-outline px-2 py-1.5 text-xs">Удалить</button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <select value={addId} onChange={(e) => setAddId(e.target.value)} className="field max-w-xs text-sm">
            <option value="">Добавить товар…</option>
            {catalog.filter((p) => !products.some((x) => x.productId === p.id)).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="button" onClick={addProduct} className="btn-outline px-3 py-2 text-sm">Добавить</button>
        </div>
      </div>

      {msg && <p className="mt-4 text-sm text-accent">{msg}</p>}
      <button onClick={save} className="btn-primary mt-6">Сохранить стрим</button>
    </div>
  );
}
