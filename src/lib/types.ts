import { t, type Locale } from "@/lib/i18n";

export type OrderStatus =
  | "new"
  | "awaiting_payment"
  | "paid"
  | "collecting"
  | "collected"
  | "shipped"
  | "completed"
  | "cancelled"
  // legacy — маппятся на новые
  | "payment_sent"
  | "payment_confirmed"
  | "processing"
  | "to_warehouse"
  | "packing"
  | "delivered"
  | "returned";

export const ORDER_STATUSES: { value: OrderStatus; label: string; tone: string }[] = [
  { value: "new", label: "Новый заказ", tone: "bg-sand text-ink" },
  { value: "awaiting_payment", label: "Ожидает оплату", tone: "bg-amber-100 text-amber-800" },
  { value: "paid", label: "Оплачен", tone: "bg-emerald-100 text-emerald-800" },
  { value: "collecting", label: "Собирается", tone: "bg-purple-100 text-purple-800" },
  { value: "collected", label: "Собран", tone: "bg-indigo-100 text-indigo-800" },
  { value: "shipped", label: "Отправлен", tone: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Завершён", tone: "bg-emerald-100 text-emerald-900" },
  { value: "cancelled", label: "Отменён", tone: "bg-stone-200 text-stone-600" },
];

export const PAYMENT_STATUSES = [
  { value: "awaiting", label: "Ожидает оплату" },
  { value: "paid", label: "Оплачено" },
  { value: "cancelled", label: "Отменено" },
] as const;

export type OrderSource = "catalog" | "stream";

const LEGACY_STATUS_MAP: Record<string, OrderStatus> = {
  payment_sent: "awaiting_payment",
  payment_confirmed: "paid",
  processing: "collecting",
  to_warehouse: "collected",
  packing: "collecting",
  delivered: "completed",
  returned: "cancelled",
};

function normalizeStatus(status: OrderStatus): OrderStatus {
  return LEGACY_STATUS_MAP[status] ?? status;
}

export function getStatusLabel(status: OrderStatus, locale: Locale): string {
  const normalized = normalizeStatus(status);
  const key = `order.status.${normalized}`;
  const label = t(key, locale);
  return label === key ? status : label;
}

/** @deprecated use getStatusLabel(status, locale) */
export function statusLabel(status: OrderStatus): string {
  return getStatusLabel(status, "ru");
}

export function statusTone(status: OrderStatus): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.tone ?? "bg-sand text-ink";
}

export function getPaymentStatusLabel(
  order: { paymentConfirmed: boolean; status: OrderStatus },
  locale: Locale
): string {
  if (order.status === "cancelled" || order.status === "returned") return t("order.payment.cancelled", locale);
  if (order.paymentConfirmed) return t("order.payment.paid", locale);
  return t("order.payment.awaiting", locale);
}

/** @deprecated use getPaymentStatusLabel(order, locale) */
export function paymentStatusLabel(order: { paymentConfirmed: boolean; status: OrderStatus }): string {
  return getPaymentStatusLabel(order, "ru");
}

export type Customer = {
  lastName: string;
  firstName: string;
  middleName: string;
  country: string;
  city: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  email?: string;
};

export type Delivery = {
  country: string;
  city: string;
  address: string;
  zip: string;
  recipient: string;
  recipientPhone: string;
  method: string;
  comment: string;
  feeKrw?: number;
  feeConverted?: number;
  totalWeightKg?: number;
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
  sku?: string;
  priceKrw?: number;
  priceConverted?: number;
};

export type Order = {
  id: string;
  number: string;
  createdAt: string;
  customer: Customer;
  delivery: Delivery;
  items: OrderItem[];
  total: number;
  totalKrw?: number;
  totalConverted?: number;
  currencyCode?: string;
  exchangeRate?: number;
  feeAmount?: number;
  source: OrderSource;
  streamId?: string | null;
  streamName?: string | null;
  comment: string;
  adminComment?: string;
  status: OrderStatus;
  paymentScreenshot?: string | null;
  paymentConfirmed: boolean;
};

export type Stream = {
  id: string;
  title: string;
  streamDate: string;
  endedAt: string;
  createdAt: string;
};

export type StreamProduct = {
  id: string;
  streamId: string;
  productId: string;
  priceOverride?: number | null;
  stock: number;
  position: number;
};

export function isStreamOpen(endedAt: string): boolean {
  const deadline = new Date(endedAt).getTime() + 24 * 60 * 60 * 1000;
  return Date.now() < deadline;
}

export function streamDeadline(endedAt: string): Date {
  return new Date(new Date(endedAt).getTime() + 24 * 60 * 60 * 1000);
}
