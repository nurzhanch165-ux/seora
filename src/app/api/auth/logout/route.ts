import { NextResponse } from "next/server";
import { clearCustomerCookie } from "@/lib/customerSession.server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearCustomerCookie(res);
  return res;
}
