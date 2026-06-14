import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { buildOrders } from "@/lib/supabase/orders";
import { ORDER_STATUSES } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const admin = createAdminClient();

  const patch: Record<string, unknown> = {};
  if (body.confirmPayment === true) {
    patch.payment_confirmed = true;
    patch.status = "payment_confirmed";
  }
  if (typeof body.status === "string") {
    if (!ORDER_STATUSES.some((s) => s.value === body.status)) {
      return NextResponse.json({ error: "Недопустимый статус." }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Нет изменений." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("orders")
    .update(patch)
    .eq("id", params.id)
    .select("*")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Заказ не найден." }, { status: 500 });
  }

  const [order] = await buildOrders(admin, [data]);
  return NextResponse.json({ order });
}
