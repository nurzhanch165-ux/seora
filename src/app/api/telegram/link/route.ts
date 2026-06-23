import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerIdFromRequest } from "@/lib/customerSession.server";
import { customerTelegramLink, getBotInfo, telegramConfigured } from "@/lib/telegram.server";

export async function GET() {
  const customerId = getCustomerIdFromRequest();
  if (!customerId) {
    return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
  }

  if (!telegramConfigured()) {
    return NextResponse.json({ configured: false, url: null, connected: false });
  }

  const admin = createAdminClient();
  const { data: customer } = await admin
    .from("customers")
    .select("telegram_chat_id")
    .eq("id", customerId)
    .maybeSingle();

  const bot = await getBotInfo();
  const url = await customerTelegramLink(customerId);

  return NextResponse.json({
    configured: true,
    url,
    botUsername: bot?.username ?? null,
    connected: Boolean(customer?.telegram_chat_id),
  });
}
