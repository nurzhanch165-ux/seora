import * as XLSX from "xlsx-js-style";
import { Order, OrderSource, paymentStatusLabel, statusLabel } from "./types";
import { site } from "@/data/site";

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

function clientDisplayName(c: Order["customer"]) {
  const name = `${c.firstName}${c.lastName ? ` ${c.lastName}` : ""}`.trim();
  return name || clientName(c);
}

export type StreamPositionMap = Record<string, number>;

export function buildStreamPositionMap(
  rows: { stream_id: string; product_id: string; position: number }[]
): StreamPositionMap {
  const map: StreamPositionMap = {};
  rows.forEach((row) => {
    map[`${row.stream_id}:${row.product_id}`] = row.position + 1;
  });
  return map;
}

function itemPosition(
  order: Order,
  item: Order["items"][number],
  idx: number,
  streamPositions?: StreamPositionMap
) {
  if (order.streamId && streamPositions) {
    const pos = streamPositions[`${order.streamId}:${item.productId}`];
    if (pos != null) return pos;
  }
  return idx + 1;
}

function displayDateLabel(dateLabel?: string, fallbackIso?: string) {
  const single = dateLabel?.match(/^(\d{4})_(\d{2})_(\d{2})$/);
  if (single) return `${single[3]}.${single[2]}`;

  const rangeStart = dateLabel?.match(/^(\d{4})_(\d{2})_(\d{2})_/);
  if (rangeStart) return `${rangeStart[3]}.${rangeStart[2]}`;

  return fmtDateShort(fallbackIso ?? new Date().toISOString());
}

export function fileDate(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  return `${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, "0")}_${String(d.getDate()).padStart(2, "0")}`;
}

function deliveryExcel(method: string) {
  const m = method.toLowerCase();
  if (m.includes("карго") || m.includes("cargo") || m.includes("ck")) return "карго";
  if (m.includes("авиа") || m.includes("avia") || m.includes(" k")) return "авиа";
  if (m.includes("ems")) return "EMS";
  if (m.includes("внутри") || m.includes("domestic") || m.includes("коре")) return "внутри страны";
  return method;
}

function fmtKrw(n: number) {
  const rounded = Math.round(n * 100) / 100;
  const [intPart, decPart = "00"] = rounded.toFixed(2).split(".");
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `₩ ${withSpaces},${decPart}`;
}

type PaymentTone = "paid" | "awaiting" | "cancelled";

function paymentTone(order: Order): PaymentTone {
  if (order.status === "cancelled" || order.status === "returned") return "cancelled";
  if (order.paymentConfirmed) return "paid";
  return "awaiting";
}

const PAYMENT_FILLS: Record<PaymentTone, string> = {
  paid: "C6EFCE",
  awaiting: "FFEB9C",
  cancelled: "FFC7CE",
};

function setCellFill(ws: XLSX.WorkSheet, row: number, col: number, rgb: string) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  if (!ws[addr]) ws[addr] = { t: "s", v: "" };
  ws[addr].s = {
    fill: { patternType: "solid", fgColor: { rgb } },
  };
}

function applyPaymentColumnStyles(
  ws: XLSX.WorkSheet,
  rows: { row: number; order: Order }[],
  paymentCol: number
) {
  rows.forEach(({ row, order }) => {
    setCellFill(ws, row, paymentCol, PAYMENT_FILLS[paymentTone(order)]);
  });
}

function buildWarehouseSheetAoa(
  orders: Order[],
  dateLabel?: string,
  streamPositions?: StreamPositionMap
): { aoa: (string | number)[][]; paymentRows: { row: number; order: Order }[] } {
  const dateStr = displayDateLabel(dateLabel, orders[0]?.createdAt);
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
  const paymentRows: { row: number; order: Order }[] = [];
  const headerOffset = header.length;

  orders.forEach((o) => {
    const c = o.customer;
    const d = o.delivery;
    const payLabel = o.paymentConfirmed ? "Оплачено" : paymentTone(o) === "cancelled" ? "Отменено" : "Ожидает";

    o.items.forEach((it, idx) => {
      const unit = it.priceKrw ?? it.price;
      paymentRows.push({ row: headerOffset + rows.length, order: o });
      rows.push([
        o.number,
        clientDisplayName(c),
        c.phone,
        itemPosition(o, it, idx, streamPositions),
        it.name,
        it.qty,
        fmtKrw(unit),
        fmtKrw(unit * it.qty),
        deliveryExcel(d?.method || ""),
        d?.address || "",
        payLabel,
      ]);
    });

    const fee = d?.feeKrw ?? 0;
    if (fee > 0) {
      paymentRows.push({ row: headerOffset + rows.length, order: o });
      rows.push([
        o.number,
        clientDisplayName(c),
        c.phone,
        "",
        "Доставка",
        1,
        fmtKrw(fee),
        fmtKrw(fee),
        deliveryExcel(d?.method || ""),
        d?.address || "",
        payLabel,
      ]);
    }
  });

  return { aoa: [...header, ...rows], paymentRows };
}

export function buildOrderWorkbook(order: Order, opts?: { streamPositions?: StreamPositionMap }) {
  const { aoa, paymentRows } = buildWarehouseSheetAoa([order], fileDate(order.createdAt), opts?.streamPositions);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = autoWidth(aoa);
  applyPaymentColumnStyles(ws, paymentRows, 10);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заказ");
  const safeName = clientDisplayName(order.customer).replace(/\s+/g, "_").slice(0, 30) || "client";
  return { wb, filename: `order_${order.number}_${safeName}.xlsx` };
}

export function buildDailyOrdersWorkbook(orders: Order[], dateLabel?: string, fileSuffix?: string) {
  const dateStr = dateLabel ?? fileDate(orders[0]?.createdAt);
  const header: (string | number)[][] = [
    [`${site.fullName} — заказы за ${dateStr.replace(/_/g, ".")}`],
    [],
    [
      "№", "Дата заказа", "Время заказа", "Номер заказа", "Источник", "Стрим",
      "Клиент", "Телефон", "WhatsApp", "Telegram", "Страна", "Город", "Адрес", "Индекс", "Email",
      "Способ доставки", "Доставка ₩", "Валюта", "Курс", "Товар", "Артикул", "Кол-во",
      "Цена KRW", "Цена в валюте", "Сумма по товару",
      "Сумма до комиссии", "Комиссия 3%", "Итого с комиссией",
      "Статус оплаты", "Статус заказа", "Комментарий клиента", "Комментарий админа",
    ],
  ];

  const rows: (string | number)[][] = [];
  const paymentRows: { row: number; order: Order }[] = [];
  const headerOffset = header.length;
  let rowNum = 0;

  orders.forEach((o) => {
    const c = o.customer;
    const d = o.delivery;
    const deliveryFee = d?.feeKrw ?? 0;
    const itemsTotalKrw = o.items.reduce((s, it) => s + (it.priceKrw ?? it.price) * it.qty, 0);
    const totalAfter = o.totalConverted ?? o.total;
    const fee = o.feeAmount ?? 0;
    const totalBefore = totalAfter - fee;

    o.items.forEach((it, idx) => {
      rowNum++;
      const isFirst = idx === 0;
      if (isFirst) paymentRows.push({ row: headerOffset + rows.length, order: o });
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
        isFirst ? (deliveryFee > 0 ? deliveryFee : "") : "",
        isFirst ? (o.currencyCode ?? "KRW") : "",
        isFirst ? (o.exchangeRate ?? 1) : "",
        it.name,
        it.sku || it.productId,
        it.qty,
        it.priceKrw ?? it.price,
        it.priceConverted ?? it.price,
        (it.priceConverted ?? it.price) * it.qty,
        isFirst ? totalBefore : "",
        isFirst ? fee : "",
        isFirst ? totalAfter : "",
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
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 31 } }];
  applyPaymentColumnStyles(ws, paymentRows, 28);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заказы");
  const suffix = fileSuffix ? `_${fileSuffix}` : "";
  return { wb, filename: `orders_${dateStr}${suffix}.xlsx` };
}

export function buildWarehouseWorkbook(
  orders: Order[],
  dateLabel?: string,
  opts?: { streamPositions?: StreamPositionMap; fileSuffix?: string }
) {
  const { aoa, paymentRows } = buildWarehouseSheetAoa(orders, dateLabel, opts?.streamPositions);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = autoWidth(aoa);
  applyPaymentColumnStyles(ws, paymentRows, 10);

  const suffix = opts?.fileSuffix ? `_${opts.fileSuffix}` : "";
  const fileDateStr = dateLabel?.match(/^(\d{4}_\d{2}_\d{2})/)?.[1] ?? fileDate(orders[0]?.createdAt);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Склад");
  return { wb, filename: `warehouse_${fileDateStr}${suffix}.xlsx` };
}

export function buildItemsTotalWorkbook(
  orders: Order[],
  opts?: { dateLabel?: string; stockByProductId?: Record<string, number>; fileSuffix?: string }
) {
  const dateStr = opts?.dateLabel ?? fmtDate(orders[0]?.createdAt ?? new Date().toISOString());
  const stockMap = opts?.stockByProductId ?? {};
  const map = new Map<string, { name: string; sku: string; productId: string; qty: number; source: OrderSource; streamName: string }>();

  orders.forEach((o) => {
    o.items.forEach((it) => {
      const key = `${o.source}:${o.streamName ?? ""}:${it.productId}`;
      const prev = map.get(key);
      if (prev) prev.qty += it.qty;
      else map.set(key, {
        name: it.name,
        sku: it.sku || it.productId,
        productId: it.productId,
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
      stockMap[v.productId] ?? "",
      "",
    ]);
  });

  const aoa = [...header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = autoWidth(aoa);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Товары");
  const suffix = opts?.fileSuffix ? `_${opts.fileSuffix}` : "";
  return { wb, filename: `items_total_${fileDate(orders[0]?.createdAt)}${suffix}.xlsx` };
}

export function workbookToBuffer(wb: XLSX.WorkBook): Buffer {
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
