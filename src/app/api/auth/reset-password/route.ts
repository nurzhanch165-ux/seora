import { NextResponse } from "next/server";
import { rpcResetPassword } from "@/lib/supabase/customers.server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const login = String(body.login ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const newPassword = String(body.newPassword ?? "");

  if (!login || !phone || !newPassword) {
    return NextResponse.json({ ok: false, error: "auth.resetFailed" }, { status: 400 });
  }

  const res = await rpcResetPassword(login, phone, newPassword);
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error ?? "auth.resetFailed" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
