import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerIdFromRequest } from "@/lib/customerSession.server";

export async function GET() {
  const customerId = getCustomerIdFromRequest();
  if (!customerId) {
    return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data ?? [] });
}

export async function PATCH(req: Request) {
  const customerId = getCustomerIdFromRequest();
  if (!customerId) {
    return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) {
    return NextResponse.json({ error: "errors.generic" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", body.id)
    .eq("customer_id", customerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
