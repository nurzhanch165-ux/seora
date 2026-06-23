import { NextResponse } from "next/server";
import { getCustomerIdFromRequest } from "@/lib/customerSession.server";
import { fetchCustomerById, rpcUpdateProfile } from "@/lib/supabase/customers.server";
import type { Account } from "@/store/auth";

export async function PATCH(req: Request) {
  const customerId = getCustomerIdFromRequest();
  if (!customerId) {
    return NextResponse.json({ ok: false, error: "auth.notAuthorized" }, { status: 403 });
  }

  const me = await fetchCustomerById(customerId);
  if (!me) {
    return NextResponse.json({ ok: false, error: "auth.notAuthorized" }, { status: 403 });
  }

  const form = (await req.json().catch(() => ({}))) as Partial<Account>;
  const res = await rpcUpdateProfile(customerId, {
    login: form.login ?? me.login,
    lastName: form.lastName ?? me.lastName,
    firstName: form.firstName ?? me.firstName,
    middleName: form.middleName ?? me.middleName,
    country: form.country ?? me.country,
    city: form.city ?? me.city,
    phone: form.phone ?? me.phone,
    whatsapp: form.whatsapp ?? me.whatsapp,
    telegram: form.telegram ?? me.telegram,
    email: form.email ?? me.email,
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error ?? "auth.profileUpdateFailed" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, customer: res.customer });
}
