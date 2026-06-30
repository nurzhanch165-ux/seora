"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Product } from "@/data/products";

const CATALOG_CACHE_KEY = "sonyshopkorea-catalog-v2";
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;

function readCatalogCache(): Product[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; products: Product[] };
    if (Date.now() - parsed.ts > CATALOG_CACHE_TTL_MS) return null;
    return parsed.products;
  } catch {
    return null;
  }
}

function writeCatalogCache(products: Product[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ ts: Date.now(), products }));
  } catch {
    /* quota exceeded — ignore */
  }
}

function mergeProduct(list: Product[], saved: Product): Product[] {
  const idx = list.findIndex((p) => p.id === saved.id);
  if (idx === -1) return [saved, ...list];
  const next = [...list];
  next[idx] = saved;
  return next;
}

type CatalogState = {
  products: Product[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
  fetchProduct: (idOrSlug: string, by?: "id" | "slug") => Promise<Product | null>;
  addProduct: (product: Product) => Promise<{ ok: boolean; error?: string }>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<{ ok: boolean; error?: string }>;
  removeProduct: (id: string) => Promise<{ ok: boolean; error?: string }>;
};

export const useCatalog = create<CatalogState>()((set, get) => ({
  products: [],
  loaded: false,
  loading: false,
  error: null,

  load: async (force = false) => {
    if (get().loading) return;
    if (get().loaded && !force) return;

    if (!force) {
      const cached = readCatalogCache();
      if (cached?.length) {
        set({ products: cached, loaded: true, loading: false, error: null });
        return;
      }
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/products", { credentials: "same-origin" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(json.products)) {
        set({ loading: false, error: json.error ?? "Не удалось загрузить каталог." });
        return;
      }
      writeCatalogCache(json.products as Product[]);
      set({ products: json.products as Product[], loaded: true, loading: false });
    } catch {
      set({ loading: false, error: "Не удалось загрузить каталог." });
    }
  },

  fetchProduct: async (idOrSlug, by = "id") => {
    try {
      const q = by === "id" ? `?by=id` : "";
      const res = await fetch(`/api/products/${encodeURIComponent(idOrSlug)}${q}`, {
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.product) return null;
      const product = json.product as Product;
      set((state) => {
        const products = mergeProduct(state.products, product);
        writeCatalogCache(products);
        return { products };
      });
      return product;
    } catch {
      return null;
    }
  },

  addProduct: async (product) => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Не удалось сохранить товар." };
    const saved = (json.product as Product) ?? product;
    set((state) => {
      const products = mergeProduct(state.products, saved);
      writeCatalogCache(products);
      return { products, loaded: true };
    });
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
    const saved = (json.product as Product) ?? merged;
    set((state) => {
      const products = mergeProduct(state.products, saved);
      writeCatalogCache(products);
      return { products };
    });
    return { ok: true };
  },

  removeProduct: async (id) => {
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Не удалось удалить товар." };
    set((state) => {
      const products = state.products.filter((p) => p.id !== id);
      writeCatalogCache(products);
      return { products };
    });
    return { ok: true };
  },
}));

export function useCatalogProducts(): Product[] {
  const products = useCatalog((s) => s.products);
  return products.filter((p) => p.active !== false);
}

export function useCatalogProductBySlug(slug: string): Product | undefined {
  const list = useCatalogProducts();
  return list.find((p) => p.slug === slug);
}
