import type { Order } from "./types";
import type { StreamPositionMap } from "./excelCore";

/** Lazy-load xlsx bundle only when user exports (keeps account/checkout pages light). */
export async function exportOrderExcel(order: Order) {
  const { exportOrderExcel: fn } = await import("./excel");
  return fn(order);
}

export async function exportDailyOrdersExcel(orders: Order[], dateLabel?: string, fileSuffix?: string) {
  const { exportDailyOrdersExcel: fn } = await import("./excel");
  return fn(orders, dateLabel, fileSuffix);
}

export async function exportWarehouseExcel(
  orders: Order[],
  dateLabel?: string,
  opts?: { streamPositions?: StreamPositionMap; fileSuffix?: string }
) {
  const { exportWarehouseExcel: fn } = await import("./excel");
  return fn(orders, dateLabel, opts);
}

export async function exportItemsTotalExcel(
  orders: Order[],
  opts?: { dateLabel?: string; stockByProductId?: Record<string, number>; fileSuffix?: string }
) {
  const { exportItemsTotalExcel: fn } = await import("./excel");
  return fn(orders, opts);
}
