import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const CUSTOMER_COOKIE = "sonyshopkorea_customer";

function sessionSecret(): string {
  const s = process.env.CUSTOMER_SESSION_SECRET?.trim() || process.env.CRON_SECRET?.trim();
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Set CUSTOMER_SESSION_SECRET or CRON_SECRET in production.");
    }
    return "dev-insecure-customer-session";
  }
  return s;
}

export function signCustomerId(customerId: string): string {
  const sig = createHmac("sha256", sessionSecret()).update(customerId).digest("hex");
  return `${sig}.${customerId}`;
}

export function verifyCustomerToken(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const sig = token.slice(0, dot);
  const id = token.slice(dot + 1);
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const expected = createHmac("sha256", sessionSecret()).update(id).digest("hex");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return id;
}

export function getCustomerIdFromRequest(): string | null {
  return verifyCustomerToken(cookies().get(CUSTOMER_COOKIE)?.value);
}

export function setCustomerCookie(res: NextResponse, customerId: string) {
  res.cookies.set(CUSTOMER_COOKIE, signCustomerId(customerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearCustomerCookie(res: NextResponse) {
  res.cookies.set(CUSTOMER_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/** Returns customer id or a 403 NextResponse */
export function requireCustomerSession(): string | NextResponse {
  const id = getCustomerIdFromRequest();
  if (!id) {
    return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
  }
  return id;
}
