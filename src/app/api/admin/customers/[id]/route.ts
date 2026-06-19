import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, string> = {};

  if (typeof body.adminComment === "string") patch.admin_comment = body.adminComment;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Нет изменений." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("customers")
    .update(patch)
    .eq("id", params.id)
    .select(
      "id, login, last_name, first_name, middle_name, country, city, phone, whatsapp, telegram, email, zip, address, admin_comment, created_at"
    )
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Клиент не найден." }, { status: 500 });
  }

  return NextResponse.json({
    customer: {
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
      email: data.email,
      zip: data.zip,
      address: data.address,
      adminComment: data.admin_comment ?? "",
      createdAt: data.created_at,
    },
  });
}
