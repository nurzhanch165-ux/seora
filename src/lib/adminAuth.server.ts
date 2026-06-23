import "server-only";
import { createHash } from "crypto";
import { cookies } from "next/headers";

// Серверная авторизация администратора через httpOnly-cookie.
// Значение cookie — sha256(login:password), которое нельзя подделать без знания пароля.

export const ADMIN_COOKIE = "sonyshopkorea_admin";

function adminLogin(): string {
  return process.env.ADMIN_LOGIN ?? "admin";
}
function adminPassword(): string {
  const p = process.env.ADMIN_PASSWORD?.trim();
  if (!p) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_PASSWORD must be set in production.");
    }
    return "admin123";
  }
  if (process.env.NODE_ENV === "production" && p.length < 12) {
    console.warn("[security] ADMIN_PASSWORD should be at least 12 characters in production.");
  }
  return p;
}

export function adminToken(): string {
  return createHash("sha256").update(`${adminLogin()}:${adminPassword()}`).digest("hex");
}

export function checkAdminCredentials(login: string, password: string): boolean {
  return login.trim() === adminLogin() && password === adminPassword();
}

export function isAdminRequest(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return !!token && token === adminToken();
}
