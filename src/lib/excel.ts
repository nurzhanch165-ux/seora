"use client";

import * as XLSX from "xlsx";
import { Order, OrderSource, paymentStatusLabel, statusLabel } from "./types";
import { site } from "@/data/site";
import { currencySymbol, type CurrencyCode } from "./currency";

function autoWidth(rows: (string | number)[][]): { wch: number }[] {
  const widths: number[] = [];
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      const len = String(cell ?? "").length;
      widths[i] = Math.max(widths[i] ?? 10, Math.min(len + 2, 60));
    });
  });
  return widths.map((wch) => ({ wch }));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function fmtDateShort(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function clientName(c: Order["customer"]) {
  return `${c.lastName} ${c.firstName} ${c.middleName}`.trim();
}

function fileDate(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  return `${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, "0")}_${String(d.getDate()).padStart(2, "0")}`;
}

function deliveryExcel(method: string) {
  const m = method.toLowerCase();
  if (m.includes("карго") || m.includes("cargo") || m.includes("ck")) return "карго";
  if (m.includes("авиа") || m.includes("avia") || m.includes(" k")) return "авиа";
  if (m.includes("ems")) return "EMS";
  if (m.includes("внутри") || m.includes("domestic")) return "внутри страны";
  return method;
}

function fmtKrw(n: number) {
  return `₩ ${new Intl.NumberFormat("ko-KR").format(n)}`;
}

/** Отдельный файл заказа клиента (ТЗ 2.6) */
export function exportOrderExcel(order: Order) {
  const c = order.customer;
  const d = order.delivery;
  const cur = (order.currencyCode ?? "KRW") as CurrencyCode;
  const sym = currencySymbol(cur);

  const head: (string | number)[][] = [
    [site.fullName],
    ["Номер заказа", order.number],
    ["Дата заказа", fmtDate(order.createdAt)],
    [],
    ["Имя клиента", clientName(c)],
    ["Телефон", c.phone],
    ["WhatsApp", c.whatsapp || "—"],
    ["Telegram", c.telegram || "—"],
    ["Страна", d?.country || c.country],
    ["Город", d?.city || c.city],
    ["Адрес", d?.address || "—"],
    ["Почтовый индекс", d?.zip || "—"],
    ["Email", c.email || "—"],
    ["Способ доставки", d?.method || "—"],
    [],
    ["Валюта", cur],
    ["Курс на момент заказа", order.exchangeRate ?? 1],
    ["Комиссия 3%", order.feeAmount ?? 0],
    ["Статус оплаты", paymentStatusLabel(order)],
    ["Комментарий клиента", order.comment || d?.comment || "—"],
    [],
    ["№", "Товар", "Артикул", "Кол-во", `Цена за 1 шт. (${sym})`, "Сумма"],
  ];

  const itemRows: (string | number)[][] = order.items.map((it, i) => [
    i + 1,
    it.name,
    it.sku || it.productId,
    it.qty,
    it.priceConverted ?? it.price,
    (it.priceConverted ?? it.price) * it.qty,
  ]);

  const footer: (string | number)[][] = [
    [],
    ["", "", "", "", "ИТОГО:", order.totalConverted ?? order.total],
  ];

  const aoa = [...head, ...itemRows, ...footer];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = autoWidth(aoa);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заказ");
  const safeName = clientName(c).replace(/\s+/g, "_").slice(0, 30) || "client";
  XLSX.writeFile(wb, `order_${order.number}_${safeName}.xlsx`);
}

/** Общий Excel заказов за день — полный формат ТЗ 2.3 */
export function exportDailyOrdersExcel(orders: Order[], dateLabel?: string) {
  const dateStr = dateLabel ?? fileDate(orders[0]?.createdAt);
  const header: (string | number)[][] = [
    [`${site.fullName} — заказы за ${dateStr.replace(/_/g, ".")}`],
    [],
    [
      "№", "Дата заказа", "Время заказа", "Номер заказа", "Источник", "Стрим",
      "Клиент", "Телефон", "WhatsApp", "Telegram", "Страна", "Город", "Адрес", "Индекс", "Email",
      "Способ доставки", "Валюта", "Курс", "Товар", "Артикул", "Кол-во",
      "Цена KRW", "Цена в валюте", "Сумма по товару", "Итого заказа",
      "Статус оплаты", "Статус заказа", "Комментарий клиента", "Комментарий админа",
    ],
  ];

  const rows: (string | number)[][] = [];
  let rowNum = 0;

  orders.forEach((o) => {
    const c = o.customer;
    const d = o.delivery;
    o.items.forEach((it, idx) => {
      rowNum++;
      const isFirst = idx === 0;
      rows.push([
        rowNum,
        isFirst ? fmtDate(o.createdAt) : "",
        isFirst ? fmtTime(o.createdAt) : "",
        isFirst ? o.number : "",
        isFirst ? (o.source === "stream" ? "стрим" : "каталог") : "",
        isFirst ? (o.streamName || "—") : "",
        isFirst ? clientName(c) : "",
        isFirst ? c.phone : "",
        isFirst ? c.whatsapp : "",
        isFirst ? c.telegram : "",
        isFirst ? (d?.country || c.country) : "",
        isFirst ? (d?.city || c.city) : "",
        isFirst ? (d?.address || "") : "",
        isFirst ? (d?.zip || "") : "",
        isFirst ? (c.email || "") : "",
        isFirst ? deliveryExcel(d?.method || "") : "",
        isFirst ? (o.currencyCode ?? "KRW") : "",
        isFirst ? (o.exchangeRate ?? 1) : "",
        it.name,
        it.sku || it.productId,
        it.qty,
        it.priceKrw ?? it.price,
        it.priceConverted ?? it.price,
        (it.priceConverted ?? it.price) * it.qty,
        isFirst ? (o.totalConverted ?? o.total) : "",
        isFirst ? paymentStatusLabel(o) : "",
        isFirst ? statusLabel(o.status) : "",
        isFirst ? (o.comment || d?.comment || "") : "",
        isFirst ? (o.adminComment || "") : "",
      ]);
    });
  });

  const aoa = [...header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = autoWidth(aoa);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 29 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заказы");
  XLSX.writeFile(wb, `orders_${dateStr}.xlsx`);
}

/** Формат склада по примеру заказчика (упрощённый) */
export function exportWarehouseExcel(orders: Order[], dateLabel?: string) {
  const dateStr = dateLabel ?? fmtDateShort(orders[0]?.createdAt ?? new Date().toISOString());
  const header: (string | number)[][] = [
    [`ДАТА: ${dateStr}`],
    [],
    [
      "Номер заказа",
      "Имя клиента\n고객명",
      "Номер телефона\n전화번호",
      "№ позиции",
      "Наименование товара\n상품명",
      "Кол-во товара\n상품 수량",
      "Цена товара\n상품 가격",
      "Общее",
      "Способ доставки",
      "Адрес доставки\n배송지 주소",
      "Оплата",
    ],
  ];

  const rows: (string | number)[][] = [];
  let posCounter = 0;

  orders.forEach((o) => {
    const c = o.customer;
    const d = o.delivery;
    o.items.forEach((it) => {
      posCounter++;
      rows.push([
        o.number,
        clientName(c),
        c.phone,
        posCounter,
        it.name,
        it.qty,
        fmtKrw(it.priceKrw ?? it.price),
        fmtKrw((it.priceKrw ?? it.price) * it.qty),
        deliveryExcel(d?.method || ""),
        d?.address || "",
        o.paymentConfirmed ? "Оплачено" : "",
      ]);
    });
  });

  const aoa = [...header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = autoWidth(aoa);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Склад");
  const fd = fileDate(orders[0]?.createdAt);
  XLSX.writeFile(wb, `warehouse_${fd}.xlsx`);
}

/** Файл общего количества товаров (ТЗ 2.5) */
export function exportItemsTotalExcel(orders: Order[], dateLabel?: string) {
  const dateStr = dateLabel ?? fmtDate(orders[0]?.createdAt ?? new Date().toISOString());
  const map = new Map<string, { name: string; sku: string; qty: number; source: OrderSource; streamName: string }>();

  orders.forEach((o) => {
    o.items.forEach((it) => {
      const key = `${o.source}:${o.streamName ?? ""}:${it.productId}`;
      const prev = map.get(key);
      if (prev) prev.qty += it.qty;
      else map.set(key, {
        name: it.name,
        sku: it.sku || it.productId,
        qty: it.qty,
        source: o.source,
        streamName: o.streamName ?? "",
      });
    });
  });

  const header: (string | number)[][] = [
    [`${site.fullName} — общее количество товаров`],
    ["Дата:", dateStr],
    [],
    ["№", "Дата", "Источник", "Стрим", "Товар", "Артикул", "Общее кол-во", "Остаток", "Комментарий"],
  ];

  const rows: (string | number)[][] = [];
  let i = 0;
  map.forEach((v) => {
    i++;
    rows.push([
      i,
      dateStr,
      v.source === "stream" ? "Стрим" : "Каталог",
      v.streamName || "—",
      v.name,
      v.sku,
      v.qty,
      "",
      "",
    ]);
  });

  const aoa = [...header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = autoWidth(aoa);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Товары");
  XLSX.writeFile(wb, `items_total_${fileDate(orders[0]?.createdAt)}.xlsx`);
}
