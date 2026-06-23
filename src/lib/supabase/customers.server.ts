import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Account } from "@/store/auth";

type RpcResult = { ok: boolean; error?: string; customer?: Account };

export async function rpcAuthenticate(login: string, password: string): Promise<RpcResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("authenticate_customer", {
    p_login: login,
    p_password: password,
  });
  if (error) return { ok: false, error: error.message };
  return data as RpcResult;
}

export async function rpcRegister(input: {
  login: string;
  password: string;
  lastName: string;
  firstName: string;
  middleName: string;
  country: string;
  city: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  email?: string | null;
  agreeData: boolean;
  agreeMarketing: boolean;
}): Promise<RpcResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("register_customer", {
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
  if (error) return { ok: false, error: error.message };
  return data as RpcResult;
}

export async function fetchCustomerById(id: string): Promise<Account | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("customers")
    .select("id, login, last_name, first_name, middle_name, country, city, phone, whatsapp, telegram, email, agree_data, agree_marketing, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    login: data.login,
    lastName: data.last_name,
    firstName: data.first_name,
    middleName: data.middle_name,
    country: data.country,
    city: data.city,
    phone: data.phone,
    whatsapp: data.whatsapp,
    telegram: data.telegram,
    email: data.email ?? undefined,
    agreeData: data.agree_data,
    agreeMarketing: data.agree_marketing,
    createdAt: data.created_at,
  };
}

export async function rpcUpdateProfile(customerId: string, form: Partial<Account> & { login?: string }): Promise<RpcResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("update_customer_profile", {
    p_id: customerId,
    p_login: form.login,
    p_last_name: form.lastName,
    p_first_name: form.firstName,
    p_middle_name: form.middleName,
    p_country: form.country,
    p_city: form.city,
    p_phone: form.phone,
    p_whatsapp: form.whatsapp,
    p_telegram: form.telegram,
    p_email: form.email ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data as RpcResult;
}

export async function rpcChangePassword(customerId: string, current: string, newPassword: string): Promise<RpcResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("change_password", {
    p_id: customerId,
    p_current: current,
    p_new: newPassword,
  });
  if (error) return { ok: false, error: error.message };
  return data as RpcResult;
}

export async function rpcResetPassword(login: string, phone: string, newPassword: string): Promise<RpcResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("reset_password", {
    p_login: login,
    p_phone: phone,
    p_new: newPassword,
  });
  if (error) return { ok: false, error: error.message };
  return data as RpcResult;
}
