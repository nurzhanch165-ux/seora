import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken, checkAdminCredentials } from "@/lib/adminAuth.server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const login = String(body.login ?? "");
  const password = String(body.password ?? "");

  if (!checkAdminCredentials(login, password)) {
    return NextResponse.json({ ok: false, error: "Неверный логин или пароль." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
