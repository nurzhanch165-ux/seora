import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data: stream, error } = await admin
    .from("streams")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !stream) {
    return NextResponse.json({ error: "Стрим не найден." }, { status: 404 });
  }

  const { data: links } = await admin
    .from("stream_products")
    .select("*")
    .eq("stream_id", params.id)
    .order("position");

  const productIds = (links ?? []).map((l) => l.product_id);
  let products: unknown[] = [];
  if (productIds.length > 0) {
    const { data: prods } = await admin.from("products").select("*").in("id", productIds);
    products = (prods ?? []).map((p) => {
      const link = links!.find((l) => l.product_id === p.id);
      return {
        ...p,
        streamStock: link?.stock ?? 0,
        streamPrice: link?.price_override ?? p.price,
      };
    });
  }

  return NextResponse.json({ stream, products });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const admin = createAdminClient();

  if (body?.products) {
    await admin.from("stream_products").delete().eq("stream_id", params.id);
    const rows = body.products.map((p: { productId: string; stock?: number; priceOverride?: number; position?: number }, i: number) => ({
      stream_id: params.id,
      product_id: p.productId,
      stock: p.stock ?? 0,
      price_override: p.priceOverride ?? null,
      position: p.position ?? i,
    }));
    if (rows.length) await admin.from("stream_products").insert(rows);
  }

  const { data, error } = await admin.from("streams").select("*").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stream: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const admin = createAdminClient();
  const { error } = await admin.from("streams").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
