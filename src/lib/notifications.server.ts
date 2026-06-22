import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import webpush from "web-push";
import {
  formatStreamTelegramMessage,
  sendTelegramMessage,
  telegramConfigured,
} from "@/lib/telegram.server";

const DEFAULT_TIKTOK = "https://www.tiktok.com/@shopkorea8";

export type AnnounceInput = {
  title: string;
  body: string;
  streamId?: string | null;
  tiktokUrl?: string;
};

function vapidConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY
    && process.env.VAPID_PRIVATE_KEY
    && process.env.VAPID_SUBJECT
  );
}

function configureWebPush() {
  if (!vapidConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  return true;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "SonyShopKorea <orders@sonyshopkorea.com>";
  if (!key || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function announceStream(input: AnnounceInput) {
  const admin = createAdminClient();
  const tiktokUrl = input.tiktokUrl?.trim() || process.env.NEXT_PUBLIC_TIKTOK_URL || DEFAULT_TIKTOK;
  const link = tiktokUrl;

  const { data: customers } = await admin
    .from("customers")
    .select("id, email, agree_marketing, first_name, telegram_chat_id")
    .eq("agree_marketing", true);

  const recipients = customers ?? [];
  let sentEmail = 0;
  let sentPush = 0;
  let sentTelegram = 0;
  let sentInApp = 0;

  const pushReady = configureWebPush();
  const { data: allSubs } = pushReady
    ? await admin.from("push_subscriptions").select("*")
    : { data: [] as { endpoint: string; p256dh: string; auth: string; customer_id: string }[] };

  for (const customer of recipients) {
    const title = input.title.trim() || "Стрим SonyShopKorea онлайн!";
    const body = input.body.trim() || "Мы начинаем стрим — заходите на TikTok и выбирайте товары.";

    await admin.from("notifications").insert({
      customer_id: customer.id,
      title,
      body,
      link,
    });
    sentInApp++;

    if (customer.email) {
      const html = `
        <h2>${title}</h2>
        <p>${body}</p>
        <p><a href="${link}">Смотреть стрим в TikTok</a></p>
        <p><a href="https://sonyshopkorea.vercel.app/streams">Открыть стримы на сайте</a></p>
      `;
      if (await sendEmail(customer.email, title, html)) sentEmail++;
    }

    if (pushReady) {
      const subs = (allSubs ?? []).filter((s) => s.customer_id === customer.id);
      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify({ title, body, url: link })
          );
          sentPush++;
        } catch {
          await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }

    if (telegramConfigured() && customer.telegram_chat_id) {
      const tgText = formatStreamTelegramMessage(title, body, link);
      if (await sendTelegramMessage(customer.telegram_chat_id, tgText)) sentTelegram++;
    }
  }

  await admin.from("stream_announcements").insert({
    stream_id: input.streamId ?? null,
    title: input.title,
    body: input.body,
    tiktok_url: tiktokUrl,
    sent_email: sentEmail,
    sent_push: sentPush,
    sent_telegram: sentTelegram,
  });

  return {
    recipients: recipients.length,
    sentEmail,
    sentPush,
    sentTelegram,
    sentInApp,
    tiktokUrl,
  };
}
