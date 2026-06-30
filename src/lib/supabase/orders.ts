import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Customer, Delivery, Order, OrderItem, OrderSource, OrderStatus } from "@/lib/types";

export const SCREENSHOT_BUCKET = "payment-screenshots";

type OrderRow = {
  id: string;
  number: string;
  customer_id: string | null;
  customer: Customer;
  delivery: Delivery;
  total: number | string;
  comment: string;
  status: string;
  payment_screenshot: string | null;
  payment_confirmed: boolean;
  created_at: string;
  source?: string;
  stream_id?: string | null;
  stream_name?: string | null;
  currency_code?: string;
  exchange_rate?: number | string | null;
  total_krw?: number | string | null;
  total_converted?: number | string | null;
  fee_amount?: number | string | null;
  admin_comment?: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  slug: string;
  name: string;
  brand: string;
  price: number | string;
  qty: number;
  sku?: string;
  price_krw?: number | string | null;
  price_converted?: number | string | null;
};

async function signedScreenshot(
  admin: SupabaseClient,
  path: string | null
): Promise<string | null> {
  if (!path) return null;
  const { data } = await admin.storage
    .from(SCREENSHOT_BUCKET)
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export async function mapOrderRow(
  admin: SupabaseClient,
  row: OrderRow,
  itemRows: OrderItemRow[],
  options?: { signScreenshots?: boolean }
): Promise<Order> {
  const signScreenshots = options?.signScreenshots !== false;
  const items: OrderItem[] = itemRows.map((it) => ({
    productId: it.product_id,
    slug: it.slug,
    name: it.name,
    brand: it.brand,
    price: Number(it.price) || 0,
    qty: it.qty,
    sku: it.sku || it.product_id,
    priceKrw: it.price_krw != null ? Number(it.price_krw) : Number(it.price),
    priceConverted: it.price_converted != null ? Number(it.price_converted) : Number(it.price),
  }));
  return {
    id: row.id,
    number: row.number,
    createdAt: row.created_at,
    customer: row.customer,
    delivery: row.delivery,
    items,
    total: Number(row.total) || 0,
    totalKrw: row.total_krw != null ? Number(row.total_krw) : Number(row.total),
    totalConverted: row.total_converted != null ? Number(row.total_converted) : Number(row.total),
    currencyCode: row.currency_code ?? "KRW",
    exchangeRate: row.exchange_rate != null ? Number(row.exchange_rate) : 1,
    feeAmount: row.fee_amount != null ? Number(row.fee_amount) : 0,
    source: (row.source as OrderSource) ?? "catalog",
    streamId: row.stream_id ?? null,
    streamName: row.stream_name ?? null,
    comment: row.comment ?? "",
    adminComment: row.admin_comment ?? "",
    status: row.status as OrderStatus,
    paymentScreenshot: signScreenshots ? await signedScreenshot(admin, row.payment_screenshot) : null,
    hasPaymentScreenshot: !!row.payment_screenshot,
    paymentConfirmed: row.payment_confirmed,
  };
}

export async function buildOrders(
  admin: SupabaseClient,
  orderRows: OrderRow[],
  options?: { signScreenshots?: boolean }
): Promise<Order[]> {
  if (orderRows.length === 0) return [];
  const ids = orderRows.map((o) => o.id);
  const { data: itemData } = await admin.from("order_items").select("*").in("order_id", ids);
  const itemRows = (itemData ?? []) as OrderItemRow[];
  const byOrder = new Map<string, OrderItemRow[]>();
  for (const it of itemRows) {
    const arr = byOrder.get(it.order_id) ?? [];
    arr.push(it);
    byOrder.set(it.order_id, arr);
  }
  return Promise.all(orderRows.map((row) => mapOrderRow(admin, row, byOrder.get(row.id) ?? [], options)));
}
