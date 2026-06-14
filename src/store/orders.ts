"use client";

import { create } from "zustand";
import { Order, OrderStatus } from "@/lib/types";

export type CreateOrderInput = Omit<Order, "id" | "status" | "paymentScreenshot" | "paymentConfirmed"> & {
  customerId?: string | null;
};

type Result = { ok: boolean; error?: string };

type OrdersState = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  loadMine: (customerId: string) => Promise<void>;
  loadAll: () => Promise<void>;
  createOrder: (input: CreateOrderInput) => Promise<{ ok: boolean; error?: string; order?: Order }>;
  setStatus: (id: string, status: OrderStatus) => Promise<Result>;
  confirmPayment: (id: string) => Promise<Result>;
  attachScreenshot: (id: string, file: File) => Promise<Result>;
  upsertLocal: (order: Order) => void;
};

export const useOrders = create<OrdersState>()((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  loadMine: async (customerId) => {
    set({ loading: true, error: null });
    const res = await fetch(`/api/orders?customerId=${encodeURIComponent(customerId)}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      set({ loading: false, error: json.error ?? "Не удалось загрузить заказы." });
      return;
    }
    set({ orders: json.orders ?? [], loading: false });
  },

  loadAll: async () => {
    set({ loading: true, error: null });
    const res = await fetch(`/api/orders`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      set({ loading: false, error: json.error ?? "Не удалось загрузить заказы." });
      return;
    }
    set({ orders: json.orders ?? [], loading: false });
  },

  createOrder: async (input) => {
    const res = await fetch(`/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Не удалось создать заказ." };
    const order = json.order as Order;
    set((state) => ({ orders: [order, ...state.orders] }));
    return { ok: true, order };
  },

  setStatus: async (id, status) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Не удалось обновить статус." };
    get().upsertLocal(json.order as Order);
    return { ok: true };
  },

  confirmPayment: async (id) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmPayment: true }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Не удалось подтвердить оплату." };
    get().upsertLocal(json.order as Order);
    return { ok: true };
  },

  attachScreenshot: async (id, file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/orders/${id}/screenshot`, { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Не удалось загрузить скриншот." };
    get().upsertLocal(json.order as Order);
    return { ok: true };
  },

  upsertLocal: (order) =>
    set((state) => ({
      orders: state.orders.some((o) => o.id === order.id)
        ? state.orders.map((o) => (o.id === order.id ? order : o))
        : [order, ...state.orders],
    })),
}));
