import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { products as SEED } from "@/data/products";
import { productToRow } from "@/lib/supabase/products";

// Заполняет таблицу products стартовым каталогом (seed). Идемпотентно (upsert по id).
export async function POST() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён. Войдите как администратор." }, { status: 403 });
  }
  const admin = createAdminClient();
  const rows = SEED.map(productToRow);
  const { error } = await admin.from("products").upsert(rows, { onConflict: "id" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: rows.length });
}
