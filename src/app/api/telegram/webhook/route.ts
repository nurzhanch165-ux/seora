import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramMessage } from "@/lib/telegram.server";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat?: { id: number };
    from?: { id: number; username?: string };
  };
};

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
  } else {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  const update = (await req.json().catch(() => null)) as TelegramUpdate | null;
  const message = update?.message;
  if (!message?.chat?.id || !message.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text === "/start" || text.startsWith("/start ")) {
    const parts = text.split(/\s+/);
    const customerId = parts[1];

    if (!customerId) {
      await sendTelegramMessage(
        chatId,
        "Здравствуйте! Откройте ссылку «Подключить Telegram» в личном кабинете SonyShopKorea — так мы узнаем ваш аккаунт."
      );
      return NextResponse.json({ ok: true });
    }

    const admin = createAdminClient();
    const { data: customer } = await admin
      .from("customers")
      .select("id, first_name")
      .eq("id", customerId)
      .maybeSingle();

    if (!customer) {
      await sendTelegramMessage(chatId, "Не удалось найти аккаунт. Войдите на сайт и нажмите «Подключить Telegram» снова.");
      return NextResponse.json({ ok: true });
    }

    await admin
      .from("customers")
      .update({ telegram_chat_id: String(chatId) })
      .eq("id", customerId);

    const name = customer.first_name?.trim() || "друг";
    await sendTelegramMessage(
      chatId,
      `✅ ${name}, вы подписаны на уведомления SonyShopKorea о стримах!\n\nКогда мы выходим в эфир, вы получите сообщение с ссылкой на TikTok.`
    );
  }

  return NextResponse.json({ ok: true });
}
