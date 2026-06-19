"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  slug: string;
  qty: number;
};

export type StreamContext = {
  streamId: string;
  streamName: string;
};

type CartState = {
  lines: CartLine[];
  streamContext: StreamContext | null;
  add: (productId: string, slug: string, qty?: number, stream?: StreamContext | null) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      streamContext: null,
      add: (productId, slug, qty = 1, stream) =>
        set((state) => {
          const streamContext = stream === undefined ? state.streamContext : stream;
          const existing = state.lines.find((l) => l.productId === productId);
          if (existing) {
            return {
              streamContext,
              lines: state.lines.map((l) =>
                l.productId === productId ? { ...l, qty: l.qty + qty } : l
              ),
            };
          }
          return { lines: [...state.lines, { productId, slug, qty }], streamContext };
        }),
      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      setQty: (productId, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.productId === productId ? { ...l, qty: Math.max(1, qty) } : l))
            .filter((l) => l.qty > 0),
        })),
      clear: () => set({ lines: [], streamContext: null }),
      count: () => get().lines.reduce((sum, l) => sum + l.qty, 0),
    }),
    { name: "sonyshopkorea-cart" }
  )
);
