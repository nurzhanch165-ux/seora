"use client";

import { create } from "zustand";

// Авторизация администратора через серверную httpOnly-cookie.
// Источник правды — сервер (/api/admin/*). Клиент только отражает состояние.

type Result = { ok: boolean; error?: string };

type AdminAuthState = {
  loggedIn: boolean;
  ready: boolean;
  check: () => Promise<void>;
  login: (login: string, password: string) => Promise<Result>;
  logout: () => Promise<void>;
};

export const useAdminAuth = create<AdminAuthState>()((set) => ({
  loggedIn: false,
  ready: false,

  check: async () => {
    set({ ready: false });
    try {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      set({ loggedIn: !!json.loggedIn, ready: true });
    } catch {
      set({ loggedIn: false, ready: true });
    }
  },

  login: async (login, password) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      set({ loggedIn: false, ready: true });
      return { ok: false, error: json.error ?? "auth.invalidCredentials" };
    }
    set({ loggedIn: true, ready: true });
    return { ok: true };
  },

  logout: async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    set({ loggedIn: false });
  },
}));
