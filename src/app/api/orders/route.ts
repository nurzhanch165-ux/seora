import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { getCustomerIdFromRequest } from "@/lib/customerSession.server";
import { buildOrders } from "@/lib/supabase/orders";
import type { CreateOrderInput } from "@/store/orders";

export async function GET() {
  const admin = createAdminClient();
  const sessionId = getCustomerIdFromRequest();
  const isAdmin = isAdminRequest();

  let query = admin.from("orders").select("*").order("created_at", { ascending: false });

  if (isAdmin) {
    // all orders
  } else if (sessionId) {
    query = query.eq("customer_id", sessionId);
  } else {
    return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = await buildOrders(admin, data ?? [], { signScreenshots: !isAdmin });
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const input = (await req.json().catch(() => null)) as CreateOrderInput | null;
  if (!input || !Array.isArray(input.items) || input.items.length === 0) {
    return NextResponse.json({ error: "checkout.createFailed" }, { status: 400 });
  }

  const sessionId = getCustomerIdFromRequest();
  const isAdmin = isAdminRequest();
  if (!sessionId && !isAdmin) {
    return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
  }

  const customerId = sessionId ?? input.customerId ?? null;
  if (sessionId && input.customerId && input.customerId !== sessionId) {
    return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: orderRow, error: orderErr } = await admin
    .from("orders")
    .insert({
      number: input.number,
      customer_id: customerId,
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
    return NextResponse.json({ error: orderErr?.message ?? "checkout.createFailed" }, { status: 500 });
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
