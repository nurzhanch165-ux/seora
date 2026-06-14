import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { productToRow } from "@/lib/supabase/products";
import type { Product } from "@/data/products";

export async function POST(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const product = (await req.json().catch(() => null)) as Product | null;
  if (!product || !product.id || !product.name) {
    return NextResponse.json({ error: "Некорректные данные товара." }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin.from("products").upsert(productToRow(product), { onConflict: "id" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Не указан id товара." }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
