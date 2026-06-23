"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Customer } from "@/lib/types";

export type Account = Customer & {
  id: string;
  login: string;
  agreeData: boolean;
  agreeMarketing: boolean;
  createdAt: string;
};

export type RegisterInput = Omit<Account, "id" | "createdAt"> & { password: string };

type Result = { ok: boolean; error?: string };

type AuthState = {
  current: Account | null;
  ready: boolean;
  hydrateSession: () => Promise<void>;
  register: (input: RegisterInput) => Promise<Result>;
  login: (login: string, password: string) => Promise<Result>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Account>) => Promise<Result>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<Result>;
  resetPassword: (login: string, phone: string, newPassword: string) => Promise<Result>;
};

async function parseJson(res: Response) {
  return res.json().catch(() => ({}));
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      current: null,
      ready: false,

      hydrateSession: async () => {
        try {
          const res = await fetch("/api/auth/me", { credentials: "same-origin" });
          const json = await parseJson(res);
          set({ current: json.customer ?? null, ready: true });
        } catch {
          set({ ready: true });
        }
      },

      register: async (input) => {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(input),
        });
        const json = await parseJson(res);
        if (!res.ok || !json.ok) return { ok: false, error: json.error ?? "auth.registerFailed" };
        set({ current: json.customer ?? null });
        return { ok: true };
      },

      login: async (login, password) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ login, password }),
        });
        const json = await parseJson(res);
        if (!res.ok || !json.ok) return { ok: false, error: json.error ?? "auth.invalidCredentials" };
        set({ current: json.customer ?? null });
        return { ok: true };
      },

      logout: async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
        set({ current: null });
      },

      updateProfile: async (formData) => {
        const me = get().current;
        if (!me) return { ok: false, error: "auth.notAuthorized" };
        const res = await fetch("/api/auth/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(formData),
        });
        const json = await parseJson(res);
        if (!res.ok || !json.ok) return { ok: false, error: json.error ?? "auth.profileUpdateFailed" };
        set({ current: json.customer ?? me });
        return { ok: true };
      },

      changePassword: async (currentPassword, newPassword) => {
        if (!get().current) return { ok: false, error: "auth.notAuthorized" };
        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const json = await parseJson(res);
        if (!res.ok || !json.ok) return { ok: false, error: json.error ?? "auth.passwordChangeFailed" };
        return { ok: true };
      },

      resetPassword: async (login, phone, newPassword) => {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ login, phone, newPassword }),
        });
        const json = await parseJson(res);
        if (!res.ok || !json.ok) return { ok: false, error: json.error ?? "auth.resetFailed" };
        return { ok: true };
      },
    }),
    {
      name: "sonyshopkorea-auth",
      partialize: (s) => ({ current: s.current }),
      onRehydrateStorage: () => (state) => {
        state?.hydrateSession();
      },
    }
  )
);
