"use client";

import * as XLSX from "xlsx";
import { Order } from "./types";
import {
  buildDailyOrdersWorkbook,
  buildItemsTotalWorkbook,
  buildOrderWorkbook,
  buildWarehouseWorkbook,
  type StreamPositionMap,
} from "./excelCore";

async function loadStreamPositionsForOrder(order: Order): Promise<StreamPositionMap> {
  if (!order.streamId) return {};
  try {
    const detail = await fetch(`/api/streams/${order.streamId}`).then((r) => r.json());
    const map: StreamPositionMap = {};
    (detail.products ?? []).forEach((p: { id: string; position?: number }, i: number) => {
      map[`${order.streamId}:${p.id}`] = (p.position ?? i) + 1;
    });
    return map;
  } catch {
    return {};
  }
}

export async function exportOrderExcel(order: Order) {
  const streamPositions = await loadStreamPositionsForOrder(order);
  const { wb, filename } = buildOrderWorkbook(order, { streamPositions });
  XLSX.writeFile(wb, filename);
}
export function exportDailyOrdersExcel(orders: Order[], dateLabel?: string, fileSuffix?: string) {
  const { wb, filename } = buildDailyOrdersWorkbook(orders, dateLabel, fileSuffix);
  XLSX.writeFile(wb, filename);
}

export function exportWarehouseExcel(
  orders: Order[],
  dateLabel?: string,
  opts?: { streamPositions?: StreamPositionMap; fileSuffix?: string }
) {
  const { wb, filename } = buildWarehouseWorkbook(orders, dateLabel, opts);
  XLSX.writeFile(wb, filename);
}

export function exportItemsTotalExcel(
  orders: Order[],
  opts?: { dateLabel?: string; stockByProductId?: Record<string, number>; fileSuffix?: string }
) {
  const { wb, filename } = buildItemsTotalWorkbook(orders, opts);
  XLSX.writeFile(wb, filename);
}
