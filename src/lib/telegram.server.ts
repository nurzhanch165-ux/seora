import "server-only";

type BotInfo = { username: string; id: number };

let cachedBot: BotInfo | null = null;

function token(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}

export function telegramConfigured(): boolean {
  return Boolean(token());
}

export async function getBotInfo(): Promise<BotInfo | null> {
  if (cachedBot) return cachedBot;
  const t = token();
  if (!t) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${t}/getMe`, { next: { revalidate: 3600 } });
    const json = await res.json();
    if (!json.ok) return null;
    cachedBot = { username: json.result.username as string, id: json.result.id as number };
    return cachedBot;
  } catch {
    return null;
  }
}

export function botDeepLink(customerId: string, botUsername: string): string {
  return `https://t.me/${botUsername}?start=${customerId}`;
}

export async function customerTelegramLink(customerId: string): Promise<string | null> {
  const info = await getBotInfo();
  if (!info) return null;
  return botDeepLink(customerId, info.username);
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  opts?: { disablePreview?: boolean }
): Promise<boolean> {
  const t = token();
  if (!t) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${t}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: opts?.disablePreview ?? false,
      }),
    });
    const json = await res.json();
    return Boolean(json.ok);
  } catch {
    return false;
  }
}

export async function setTelegramWebhook(webhookUrl: string): Promise<{ ok: boolean; description?: string }> {
  const t = token();
  if (!t) return { ok: false, description: "TELEGRAM_BOT_TOKEN not set" };
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const body: Record<string, string> = { url: webhookUrl };
  if (secret) body.secret_token = secret;
  try {
    const res = await fetch(`https://api.telegram.org/bot${t}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return { ok: Boolean(json.ok), description: json.description as string | undefined };
  } catch (e) {
    return { ok: false, description: e instanceof Error ? e.message : "setWebhook failed" };
  }
}

export function formatStreamTelegramMessage(title: string, body: string, tiktokUrl: string): string {
  const site = "https://sonyshopkorea.vercel.app/streams";
  return `<b>${escapeHtml(title)}</b>\n\n${escapeHtml(body)}\n\n🎬 <a href="${tiktokUrl}">TikTok стрим</a>\n🛍 <a href="${site}">Стримы на сайте</a>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
