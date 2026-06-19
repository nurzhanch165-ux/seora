import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";

export async function GET() {
  const admin = createAdminClient();
  const { data: streams, error } = await admin
    .from("streams")
    .select("*")
    .order("stream_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ streams: streams ?? [] });
}

export async function POST(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.streamDate || !body?.endedAt) {
    return NextResponse.json({ error: "Заполните название и даты стрима." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("streams")
    .insert({
      title: body.title,
      stream_date: body.streamDate,
      ended_at: body.endedAt,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (Array.isArray(body.products) && body.products.length > 0) {
    const rows = body.products.map((p: { productId: string; stock?: number; priceOverride?: number; position?: number }, i: number) => ({
      stream_id: data.id,
      product_id: p.productId,
      stock: p.stock ?? 0,
      price_override: p.priceOverride ?? null,
      position: p.position ?? i,
    }));
    await admin.from("stream_products").insert(rows);
  }

  return NextResponse.json({ stream: data });
}
