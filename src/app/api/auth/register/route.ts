import { NextResponse } from "next/server";
import { setCustomerCookie } from "@/lib/customerSession.server";
import { rpcRegister } from "@/lib/supabase/customers.server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.login || !body?.password) {
    return NextResponse.json({ ok: false, error: "auth.registerFailed" }, { status: 400 });
  }

  const res = await rpcRegister({
    login: String(body.login),
    password: String(body.password),
    lastName: String(body.lastName ?? ""),
    firstName: String(body.firstName ?? ""),
    middleName: String(body.middleName ?? ""),
    country: String(body.country ?? ""),
    city: String(body.city ?? ""),
    phone: String(body.phone ?? ""),
    whatsapp: String(body.whatsapp ?? ""),
    telegram: String(body.telegram ?? ""),
    email: body.email ?? null,
    agreeData: Boolean(body.agreeData),
    agreeMarketing: Boolean(body.agreeMarketing),
  });

  if (!res.ok || !res.customer) {
    return NextResponse.json({ ok: false, error: res.error ?? "auth.registerFailed" }, { status: 400 });
  }

  const out = NextResponse.json({ ok: true, customer: res.customer });
  setCustomerCookie(out, res.customer.id);
  return out;
}
