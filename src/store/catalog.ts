"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { products as SEED, Product } from "@/data/products";
import { getSupabase } from "@/lib/supabase/client";
import { mapProductRow, ProductRow } from "@/lib/supabase/products";

type CatalogState = {
  products: Product[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
  addProduct: (product: Product) => Promise<{ ok: boolean; error?: string }>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<{ ok: boolean; error?: string }>;
  removeProduct: (id: string) => Promise<{ ok: boolean; error?: string }>;
};

export const useCatalog = create<CatalogState>()((set, get) => ({
  // До загрузки показываем seed, чтобы не было пустого экрана/рассинхрона
  products: SEED,
  loaded: false,
  loading: false,
  error: null,

  load: async (force = false) => {
    if (get().loading) return;
    if (get().loaded && !force) return;
    set({ loading: true, error: null });
    const supabase = getSupabase();
    if (!supabase) {
      set({ loading: false, error: "Supabase не настроен." });
      return;
    }
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    const products = (data as ProductRow[]).map(mapProductRow);
    set({ products, loaded: true, loading: false });
  },

  addProduct: async (product) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Не удалось сохранить товар." };
    await get().load(true);
    return { ok: true };
  },

  updateProduct: async (id, patch) => {
    const current = get().products.find((p) => p.id === id);
    const merged = { ...current, ...patch, id } as Product;
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Не удалось сохранить товар." };
    await get().load(true);
    return { ok: true };
  },

  removeProduct: async (id) => {
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Не удалось удалить товар." };
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    return { ok: true };
  },
}));

/** Товары витрины (только активные). Админка использует useCatalog().products напрямую. */
export function useCatalogProducts(): Product[] {
  const products = useCatalog((s) => s.products);
  const loaded = useCatalog((s) => s.loaded);
  const loading = useCatalog((s) => s.loading);
  useEffect(() => {
    if (!loaded && !loading) useCatalog.getState().load();
  }, [loaded, loading]);
  return products.filter((p) => p.active !== false);
}

export function useCatalogProductBySlug(slug: string): Product | undefined {
  const list = useCatalogProducts();
  return list.find((p) => p.slug === slug);
}
