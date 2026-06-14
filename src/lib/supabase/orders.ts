import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Customer, Delivery, Order, OrderItem, OrderStatus } from "@/lib/types";

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
};

async function signedScreenshot(
  admin: SupabaseClient,
  path: string | null
): Promise<string | null> {
  if (!path) return null;
  const { data } = await admin.storage
    .from(SCREENSHOT_BUCKET)
    .createSignedUrl(path, 60 * 60); // 1 час
  return data?.signedUrl ?? null;
}

export async function mapOrderRow(
  admin: SupabaseClient,
  row: OrderRow,
  itemRows: OrderItemRow[]
): Promise<Order> {
  const items: OrderItem[] = itemRows.map((it) => ({
    productId: it.product_id,
    slug: it.slug,
    name: it.name,
    brand: it.brand,
    price: Number(it.price) || 0,
    qty: it.qty,
  }));
  return {
    id: row.id,
    number: row.number,
    createdAt: row.created_at,
    customer: row.customer,
    delivery: row.delivery,
    items,
    total: Number(row.total) || 0,
    comment: row.comment ?? "",
    status: row.status as OrderStatus,
    paymentScreenshot: await signedScreenshot(admin, row.payment_screenshot),
    paymentConfirmed: row.payment_confirmed,
  };
}

// Загружает заказы (с позициями) по списку строк orders
export async function buildOrders(
  admin: SupabaseClient,
  orderRows: OrderRow[]
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
  return Promise.all(orderRows.map((row) => mapOrderRow(admin, row, byOrder.get(row.id) ?? [])));
}
