"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { isStreamOpen, streamDeadline } from "@/lib/types";
import { Product } from "@/data/products";
import { mapProductRow, type ProductRow } from "@/lib/supabase/products";
import * as I from "@/components/icons";

type StreamDetail = {
  id: string;
  title: string;
  stream_date: string;
  ended_at: string;
};

export default function StreamDetailPage({ params }: { params: { id: string } }) {
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetch(`/api/streams/${params.id}`)
      .then((r) => r.json())
      .then((j) => {
        setStream(j.stream ?? null);
        setProducts((j.products ?? []).map((p: Record<string, unknown>) => {
          const base = mapProductRow(p as ProductRow);
          return {
            ...base,
            price: Number(p.streamPrice ?? base.price),
            stock: Number(p.streamStock ?? base.stock),
          };
        }));
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const open = stream ? isStreamOpen(stream.ended_at) : false;
  const deadline = stream ? streamDeadline(stream.ended_at) : null;
  const remaining = deadline ? Math.max(0, deadline.getTime() - now) : 0;

  const timerLabel = useMemo(() => {
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [remaining]);

  if (loading) return <div className="container-site py-20 text-center text-muted">Загрузка…</div>;
  if (!stream) return <div className="container-site py-20 text-center text-muted">Стрим не найден</div>;

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Стримы", href: "/streams" }, { label: stream.title }]} />
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Стрим · {new Date(stream.stream_date).toLocaleDateString("ru-RU")}</p>
          <h1 className="h-display text-3xl md:text-4xl">{stream.title}</h1>
        </div>
        {open ? (
          <div className="rounded-xl2 border border-accent/30 bg-accent-soft px-5 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Осталось для заказа</p>
            <p className="mt-1 font-mono text-2xl font-bold text-ink">{timerLabel}</p>
          </div>
        ) : (
          <div className="rounded-xl2 border border-line bg-sand px-5 py-3 text-sm text-muted">
            <I.Info size={16} className="mr-1 inline text-muted" />
            Продажи по этому стриму закрыты
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="card mt-10 py-16 text-center text-muted">Товаров в этом стриме пока нет</div>
      ) : (
        <div className="mt-10">
          <ProductGrid products={products} streamClosed={!open} />
        </div>
      )}
    </div>
  );
}
