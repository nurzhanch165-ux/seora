export type OrderStatus =
  | "new"
  | "awaiting_payment"
  | "payment_sent"
  | "payment_confirmed"
  | "processing"
  | "to_warehouse"
  | "packing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export const ORDER_STATUSES: { value: OrderStatus; label: string; tone: string }[] = [
  { value: "new", label: "Новый заказ", tone: "bg-sand text-ink" },
  { value: "awaiting_payment", label: "Ожидает оплаты", tone: "bg-amber-100 text-amber-800" },
  { value: "payment_sent", label: "Оплата отправлена", tone: "bg-sky-100 text-sky-800" },
  { value: "payment_confirmed", label: "Оплата подтверждена", tone: "bg-emerald-100 text-emerald-800" },
  { value: "processing", label: "В обработке", tone: "bg-indigo-100 text-indigo-800" },
  { value: "to_warehouse", label: "Передан на склад", tone: "bg-violet-100 text-violet-800" },
  { value: "packing", label: "Собирается", tone: "bg-purple-100 text-purple-800" },
  { value: "shipped", label: "Отправлен", tone: "bg-blue-100 text-blue-800" },
  { value: "delivered", label: "Доставлен", tone: "bg-emerald-100 text-emerald-900" },
  { value: "cancelled", label: "Отменён", tone: "bg-stone-200 text-stone-600" },
  { value: "returned", label: "Возврат / проблема", tone: "bg-red-100 text-red-800" },
];

export function statusLabel(status: OrderStatus): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function statusTone(status: OrderStatus): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.tone ?? "bg-sand text-ink";
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
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  number: string;
  createdAt: string;
  customer: Customer;
  delivery: Delivery;
  items: OrderItem[];
  total: number;
  comment: string;
  status: OrderStatus;
  paymentScreenshot?: string | null;
  paymentConfirmed: boolean;
};
