import "server-only";
import { createClient } from "@supabase/supabase-js";

// Серверный клиент Supabase с service_role. ОБХОДИТ RLS.
// Использовать ТОЛЬКО в серверных роутах/действиях, НИКОГДА не импортировать в клиентский код.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function createAdminClient() {
  if (!url || !serviceKey) {
    throw new Error("Supabase admin client: отсутствуют NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
