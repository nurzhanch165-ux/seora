"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Customer } from "@/lib/types";
import { getSupabase } from "@/lib/supabase/client";

// Аккаунт без пароля (пароль хранится только как хеш в БД и не покидает сервер).
export type Account = Customer & {
  id: string;
  login: string;
  agreeData: boolean;
  agreeMarketing: boolean;
  createdAt: string;
};

export type RegisterInput = Omit<Account, "id" | "createdAt"> & { password: string };

type Result = { ok: boolean; error?: string };

type RpcResult = { ok: boolean; error?: string; customer?: Account };

type AuthState = {
  current: Account | null;
  register: (input: RegisterInput) => Promise<Result>;
  login: (login: string, password: string) => Promise<Result>;
  logout: () => void;
  updateProfile: (data: Partial<Account>) => Promise<Result>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<Result>;
  resetPassword: (login: string, phone: string, newPassword: string) => Promise<Result>;
};

function rpcError(error: unknown): Result {
  const message = error instanceof Error ? error.message : "Ошибка соединения. Попробуйте ещё раз.";
  return { ok: false, error: message };
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      current: null,

      register: async (input) => {
        const supabase = getSupabase();
        if (!supabase) return { ok: false, error: "Сервис временно недоступен." };
        const { data, error } = await supabase.rpc("register_customer", {
          p_login: input.login,
          p_password: input.password,
          p_last_name: input.lastName,
          p_first_name: input.firstName,
          p_middle_name: input.middleName,
          p_country: input.country,
          p_city: input.city,
          p_phone: input.phone,
          p_whatsapp: input.whatsapp,
          p_telegram: input.telegram,
          p_email: input.email ?? null,
          p_agree_data: input.agreeData,
          p_agree_marketing: input.agreeMarketing,
        });
        if (error) return rpcError(error);
        const res = data as RpcResult;
        if (!res.ok) return { ok: false, error: res.error };
        set({ current: res.customer ?? null });
        return { ok: true };
      },

      login: async (login, password) => {
        const supabase = getSupabase();
        if (!supabase) return { ok: false, error: "Сервис временно недоступен." };
        const { data, error } = await supabase.rpc("authenticate_customer", {
          p_login: login,
          p_password: password,
        });
        if (error) return rpcError(error);
        const res = data as RpcResult;
        if (!res.ok) return { ok: false, error: res.error };
        set({ current: res.customer ?? null });
        return { ok: true };
      },

      logout: () => set({ current: null }),

      updateProfile: async (formData) => {
        const me = get().current;
        if (!me) return { ok: false, error: "Вы не авторизованы." };
        const supabase = getSupabase();
        if (!supabase) return { ok: false, error: "Сервис временно недоступен." };
        const { data, error } = await supabase.rpc("update_customer_profile", {
          p_id: me.id,
          p_login: formData.login ?? me.login,
          p_last_name: formData.lastName ?? me.lastName,
          p_first_name: formData.firstName ?? me.firstName,
          p_middle_name: formData.middleName ?? me.middleName,
          p_country: formData.country ?? me.country,
          p_city: formData.city ?? me.city,
          p_phone: formData.phone ?? me.phone,
          p_whatsapp: formData.whatsapp ?? me.whatsapp,
          p_telegram: formData.telegram ?? me.telegram,
          p_email: formData.email ?? me.email ?? null,
        });
        if (error) return rpcError(error);
        const res = data as RpcResult;
        if (!res.ok) return { ok: false, error: res.error };
        set({ current: res.customer ?? me });
        return { ok: true };
      },

      changePassword: async (currentPassword, newPassword) => {
        const me = get().current;
        if (!me) return { ok: false, error: "Вы не авторизованы." };
        const supabase = getSupabase();
        if (!supabase) return { ok: false, error: "Сервис временно недоступен." };
        const { data, error } = await supabase.rpc("change_password", {
          p_id: me.id,
          p_current: currentPassword,
          p_new: newPassword,
        });
        if (error) return rpcError(error);
        const res = data as RpcResult;
        return res.ok ? { ok: true } : { ok: false, error: res.error };
      },

      resetPassword: async (login, phone, newPassword) => {
        const supabase = getSupabase();
        if (!supabase) return { ok: false, error: "Сервис временно недоступен." };
        const { data, error } = await supabase.rpc("reset_password", {
          p_login: login,
          p_phone: phone,
          p_new: newPassword,
        });
        if (error) return rpcError(error);
        const res = data as RpcResult;
        return res.ok ? { ok: true } : { ok: false, error: res.error };
      },
    }),
    { name: "seora-auth" }
  )
);
