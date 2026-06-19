import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildOrders } from "@/lib/supabase/orders";
import {
  buildDailyOrdersWorkbook,
  buildItemsTotalWorkbook,
  buildStreamPositionMap,
  buildWarehouseWorkbook,
  workbookToBuffer,
} from "@/lib/excelCore";
import type { Order } from "@/lib/types";

export const DAILY_EXPORTS_BUCKET = "daily-exports";

/** Дата YYYY-MM-DD в часовом поясе Asia/Seoul */
export function kstDateString(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

export function filterOrdersByKstDate(orders: Order[], ymd: string): Order[] {
  return orders.filter((o) => {
    const d = new Date(o.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    return d === ymd;
  });
}

export async function generateAndUploadDailyExcel(targetDate?: string) {
  const ymd = targetDate ?? kstDateString();
  const dateLabel = ymd.replace(/-/g, "_");
  const admin = createAdminClient();

  const dayStart = new Date(`${ymd}T00:00:00+09:00`);
  const dayEnd = new Date(`${ymd}T23:59:59.999+09:00`);

  const { data: orderRows, error } = await admin
    .from("orders")
    .select("*")
    .gte("created_at", dayStart.toISOString())
    .lte("created_at", dayEnd.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const orders = await buildOrders(admin, orderRows ?? []);

  const streamIds = Array.from(
    new Set(orders.map((o) => o.streamId).filter((id): id is string => Boolean(id)))
  );
  let streamPositions = {};
  if (streamIds.length > 0) {
    const { data: spRows } = await admin
      .from("stream_products")
      .select("stream_id, product_id, position")
      .in("stream_id", streamIds);
    streamPositions = buildStreamPositionMap(spRows ?? []);
  }

  const { data: products } = await admin.from("products").select("id, stock");
  const stockByProductId: Record<string, number> = {};
  (products ?? []).forEach((p) => {
    stockByProductId[p.id] = Number(p.stock) || 0;
  });

  const ordersWb = buildDailyOrdersWorkbook(orders, dateLabel);
  const itemsWb = buildItemsTotalWorkbook(orders, { dateLabel, stockByProductId });
  const warehouseWb = buildWarehouseWorkbook(orders, dateLabel, { streamPositions });

  const uploads = [
    { name: ordersWb.filename, buffer: workbookToBuffer(ordersWb.wb) },
    { name: itemsWb.filename, buffer: workbookToBuffer(itemsWb.wb) },
    { name: warehouseWb.filename, buffer: workbookToBuffer(warehouseWb.wb) },
  ];

  const paths: string[] = [];
  for (const file of uploads) {
    const path = file.name;
    const { error: upErr } = await admin.storage.from(DAILY_EXPORTS_BUCKET).upload(path, file.buffer, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });
    if (upErr) throw new Error(upErr.message);
    paths.push(path);
  }

  return { date: ymd, orderCount: orders.length, paths };
}
