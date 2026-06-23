import { NextResponse } from "next/server";
import { setCustomerCookie } from "@/lib/customerSession.server";
import { rpcAuthenticate } from "@/lib/supabase/customers.server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const login = String(body.login ?? "").trim();
  const password = String(body.password ?? "");

  if (!login || !password) {
    return NextResponse.json({ ok: false, error: "auth.invalidCredentials" }, { status: 400 });
  }

  const res = await rpcAuthenticate(login, password);
  if (!res.ok || !res.customer) {
    return NextResponse.json({ ok: false, error: res.error ?? "auth.invalidCredentials" }, { status: 401 });
  }

  const out = NextResponse.json({ ok: true, customer: res.customer });
  setCustomerCookie(out, res.customer.id);
  return out;
}
