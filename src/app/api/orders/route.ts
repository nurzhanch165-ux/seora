import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { buildOrders } from "@/lib/supabase/orders";
import type { CreateOrderInput } from "@/store/orders";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  const admin = createAdminClient();

  let query = admin.from("orders").select("*").order("created_at", { ascending: false });

  if (customerId) {
    query = query.eq("customer_id", customerId);
  } else if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = await buildOrders(admin, data ?? []);
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const input = (await req.json().catch(() => null)) as CreateOrderInput | null;
  if (!input || !Array.isArray(input.items) || input.items.length === 0) {
    return NextResponse.json({ error: "Некорректные данные заказа." }, { status: 400 });
  }
  const admin = createAdminClient();

  const { data: orderRow, error: orderErr } = await admin
    .from("orders")
    .insert({
      number: input.number,
      customer_id: input.customerId ?? null,
      customer: input.customer,
      delivery: input.delivery,
      total: input.totalConverted ?? input.total,
      comment: input.comment ?? "",
      status: "awaiting_payment",
      payment_confirmed: false,
      source: input.source ?? "catalog",
      stream_id: input.streamId ?? null,
      stream_name: input.streamName ?? null,
      currency_code: input.currencyCode ?? "KRW",
      exchange_rate: input.exchangeRate ?? 1,
      total_krw: input.totalKrw ?? input.total,
      total_converted: input.totalConverted ?? input.total,
      fee_amount: input.feeAmount ?? 0,
      admin_comment: input.adminComment ?? "",
    })
    .select("*")
    .single();

  if (orderErr || !orderRow) {
    return NextResponse.json({ error: orderErr?.message ?? "Не удалось создать заказ." }, { status: 500 });
  }

  const items = input.items.map((it) => ({
    order_id: orderRow.id,
    product_id: it.productId,
    slug: it.slug,
    name: it.name,
    brand: it.brand,
    price: it.priceKrw ?? it.price,
    qty: it.qty,
    sku: it.sku ?? it.productId,
    price_krw: it.priceKrw ?? it.price,
    price_converted: it.priceConverted ?? it.price,
  }));
  const { error: itemsErr } = await admin.from("order_items").insert(items);
  if (itemsErr) {
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  const [order] = await buildOrders(admin, [orderRow]);
  return NextResponse.json({ order });
}
