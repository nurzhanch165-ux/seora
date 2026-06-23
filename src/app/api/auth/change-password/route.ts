import { NextResponse } from "next/server";
import { getCustomerIdFromRequest } from "@/lib/customerSession.server";
import { rpcChangePassword } from "@/lib/supabase/customers.server";

export async function POST(req: Request) {
  const customerId = getCustomerIdFromRequest();
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "auth.notAuthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ ok: false, error: "auth.passwordChangeFailed" }, { status: 400 });
  }

  const res = await rpcChangePassword(customerId, currentPassword, newPassword);
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error ?? "auth.passwordChangeFailed" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
