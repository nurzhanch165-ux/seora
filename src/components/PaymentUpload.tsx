"use client";

import { useRef, useState } from "react";
import { useOrders } from "@/store/orders";
import * as I from "./icons";

export function PaymentUpload({ orderId }: { orderId: string }) {
  const order = useOrders((s) => s.orders.find((o) => o.id === orderId));
  const attach = useOrders((s) => s.attachScreenshot);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Загрузите изображение (скриншот оплаты).");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("Файл слишком большой. Максимум 6 МБ.");
      return;
    }
    setError("");
    setUploading(true);
    const res = await attach(orderId, file);
    setUploading(false);
    if (!res.ok) setError(res.error ?? "Не удалось загрузить скриншот.");
  }

  const screenshot = order?.paymentScreenshot;

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {screenshot ? (
        <div className="flex items-center gap-4 rounded-xl border border-success/40 bg-success/5 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={screenshot} alt="Скриншот оплаты" className="h-20 w-20 rounded-lg object-cover" />
          <div className="flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-success">
              <I.Check size={16} /> Скриншот оплаты загружен
            </p>
            <p className="text-xs text-muted">
              {order?.paymentConfirmed ? "Оплата подтверждена менеджером." : "Ожидает подтверждения менеджером."}
            </p>
          </div>
          <button onClick={() => inputRef.current?.click()} className="btn-ghost text-xs">Заменить</button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper py-8 text-center transition-colors hover:border-accent disabled:opacity-60"
        >
          <I.Upload size={24} className="text-accent" />
          <span className="text-sm font-medium text-ink">{uploading ? "Загрузка…" : "Загрузить скриншот оплаты"}</span>
          <span className="text-xs text-muted">PNG или JPG, до 6 МБ</span>
        </button>
      )}
      {error && <p className="mt-2 text-xs text-sale">{error}</p>}
    </div>
  );
}
