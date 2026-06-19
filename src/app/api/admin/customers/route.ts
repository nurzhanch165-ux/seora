import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: customers, error } = await admin
    .from("customers")
    .select(
      "id, login, last_name, first_name, middle_name, country, city, phone, whatsapp, telegram, email, zip, address, admin_comment, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: orderRows } = await admin
    .from("orders")
    .select("id, number, customer_id, created_at, status, payment_confirmed, total, total_converted")
    .order("created_at", { ascending: false });

  const ordersByCustomer = new Map<string, NonNullable<typeof orderRows>>();
  for (const o of orderRows ?? []) {
    if (!o.customer_id) continue;
    const list = ordersByCustomer.get(o.customer_id) ?? [];
    list.push(o);
    ordersByCustomer.set(o.customer_id, list);
  }

  const mapped = (customers ?? []).map((c) => {
    const orders = ordersByCustomer.get(c.id) ?? [];
    return {
      id: c.id,
      login: c.login,
      lastName: c.last_name,
      firstName: c.first_name,
      middleName: c.middle_name,
      country: c.country,
      city: c.city,
      phone: c.phone,
      whatsapp: c.whatsapp,
      telegram: c.telegram,
      email: c.email,
      zip: c.zip,
      address: c.address,
      adminComment: c.admin_comment ?? "",
      createdAt: c.created_at,
      orderCount: orders.length,
      orders: orders.slice(0, 20).map((o) => ({
        id: o.id,
        number: o.number,
        createdAt: o.created_at,
        status: o.status,
        paymentConfirmed: o.payment_confirmed,
        total: Number(o.total_converted ?? o.total) || 0,
      })),
    };
  });

  return NextResponse.json({ customers: mapped });
}
