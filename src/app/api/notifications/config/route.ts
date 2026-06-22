import { NextResponse } from "next/server";
import { getBotInfo, telegramConfigured } from "@/lib/telegram.server";

export async function GET() {
  const bot = telegramConfigured() ? await getBotInfo() : null;
  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY ?? null,
    tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@shopkorea8",
    telegramConfigured: telegramConfigured(),
    telegramBotUsername: bot?.username ?? null,
  });
}
