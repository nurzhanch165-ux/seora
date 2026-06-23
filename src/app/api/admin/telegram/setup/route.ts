import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { setTelegramWebhook, telegramConfigured, getBotInfo } from "@/lib/telegram.server";
import { getSiteUrl } from "@/lib/siteUrl";

export async function POST(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  if (!telegramConfigured()) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN не задан на сервере." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({})) as { baseUrl?: string };
  const origin = body.baseUrl?.trim() || getSiteUrl();
  const webhookUrl = `${origin.replace(/\/$/, "")}/api/telegram/webhook`;

  const result = await setTelegramWebhook(webhookUrl);
  const bot = await getBotInfo();

  if (!result.ok) {
    return NextResponse.json({ error: result.description ?? "Не удалось установить webhook." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, webhookUrl, botUsername: bot?.username ?? null });
}
