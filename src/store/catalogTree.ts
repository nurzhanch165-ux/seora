"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { EMPTY_EXTRAS, type CatalogExtras } from "@/lib/catalogTree";

type CatalogTreeState = {
  extras: CatalogExtras;
  loaded: boolean;
  loading: boolean;
  load: (force?: boolean) => Promise<void>;
  saveExtras: (extras: CatalogExtras) => Promise<{ ok: boolean; error?: string }>;
};

export const useCatalogTree = create<CatalogTreeState>()((set, get) => ({
  extras: EMPTY_EXTRAS,
  loaded: false,
  loading: false,

  load: async (force = false) => {
    if (get().loading) return;
    if (get().loaded && !force) return;
    set({ loading: true });
    try {
      const res = await fetch("/api/catalog");
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.extras) {
        set({ extras: json.extras as CatalogExtras, loaded: true, loading: false });
      } else {
        set({ loaded: true, loading: false });
      }
    } catch {
      set({ loaded: true, loading: false });
    }
  },

  saveExtras: async (extras) => {
    const res = await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(extras),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json.error ?? "Не удалось сохранить." };
    set({ extras, loaded: true });
    return { ok: true };
  },
}));

export function useCatalogExtras(): CatalogExtras {
  const extras = useCatalogTree((s) => s.extras);
  const loaded = useCatalogTree((s) => s.loaded);
  const loading = useCatalogTree((s) => s.loading);
  useEffect(() => {
    if (!loaded && !loading) useCatalogTree.getState().load();
  }, [loaded, loading]);
  return extras;
}
