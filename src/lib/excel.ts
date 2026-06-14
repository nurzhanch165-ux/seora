"use client";

import * as XLSX from "xlsx";
import { Order, statusLabel } from "./types";
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

/** Excel по одному заказу (ТЗ п.7) */
export function exportOrderExcel(order: Order) {
  const c = order.customer;
  const head: (string | number)[][] = [
    [site.fullName],
    ["Заказ №", order.number, "", "Дата", new Date(order.createdAt).toLocaleString(site.locale)],
    [],
    ["ФИО", `${c.lastName} ${c.firstName} ${c.middleName}`.trim()],
    ["Страна", c.country, "", "Город", c.city],
    ["Телефон", c.phone, "", "WhatsApp", c.whatsapp],
    ["Telegram", c.telegram, "", "Email", c.email || "—"],
    ["Статус оплаты", order.paymentConfirmed ? "Оплата подтверждена" : "Ожидает подтверждения"],
    ["Статус заказа", statusLabel(order.status)],
    ["Комментарий", order.comment || "—"],
    [],
    ["№", "Товар", "Бренд", "Кол-во", "Цена за ед.", "Сумма"],
  ];

  const itemRows: (string | number)[][] = order.items.map((it, i) => [
    i + 1,
    it.name,
    it.brand,
    it.qty,
    it.price,
    it.price * it.qty,
  ]);

  const footer: (string | number)[][] = [
    [],
    ["", "", "", "", "ИТОГО:", order.total],
  ];

  const aoa = [...head, ...itemRows, ...footer];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = autoWidth(aoa);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заказ");
  XLSX.writeFile(wb, `Заказ_${order.number}.xlsx`);
}

/** Общий Excel для склада по нескольким заказам (ТЗ п.11) */
export function exportWarehouseExcel(orders: Order[], rangeLabel: string) {
  const header: (string | number)[][] = [
    [`${site.fullName} — отгрузка для склада`],
    ["Период:", rangeLabel, "", "Сформирован:", new Date().toLocaleString(site.locale)],
    ["Заказов:", orders.length],
    [],
    [
      "№ заказа",
      "Дата",
      "ФИО клиента",
      "Страна",
      "Город",
      "Телефон",
      "WhatsApp",
      "Telegram",
      "Товар",
      "Кол-во",
      "Цена",
      "Сумма позиции",
      "Сумма заказа",
      "Статус оплаты",
      "Комментарий",
    ],
  ];

  const rows: (string | number)[][] = [];
  let grandTotal = 0;
  orders.forEach((o) => {
    const c = o.customer;
    grandTotal += o.total;
    o.items.forEach((it, idx) => {
      rows.push([
        idx === 0 ? o.number : "",
        idx === 0 ? new Date(o.createdAt).toLocaleDateString(site.locale) : "",
        idx === 0 ? `${c.lastName} ${c.firstName} ${c.middleName}`.trim() : "",
        idx === 0 ? c.country : "",
        idx === 0 ? c.city : "",
        idx === 0 ? c.phone : "",
        idx === 0 ? c.whatsapp : "",
        idx === 0 ? c.telegram : "",
        it.name,
        it.qty,
        it.price,
        it.price * it.qty,
        idx === 0 ? o.total : "",
        idx === 0 ? (o.paymentConfirmed ? "Оплачен" : "Ожидает") : "",
        idx === 0 ? o.comment || "" : "",
      ]);
    });
  });

  const footer: (string | number)[][] = [[], ["", "", "", "", "", "", "", "", "", "", "", "", "ИТОГО:", grandTotal]];

  const aoa = [...header, ...rows, ...footer];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = autoWidth(aoa);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Склад");
  XLSX.writeFile(wb, `Отгрузка_склад_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
