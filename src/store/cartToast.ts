"use client";

import { create } from "zustand";

type ToastState = {
  visible: boolean;
  productName: string;
  show: (productName: string) => void;
  hide: () => void;
};

export const useCartToast = create<ToastState>((set) => ({
  visible: false,
  productName: "",
  show: (productName) => set({ visible: true, productName }),
  hide: () => set({ visible: false, productName: "" }),
}));
