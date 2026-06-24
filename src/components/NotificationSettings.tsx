"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function NotificationSettings() {
  const tr = useT();
  const account = useAuth((s) => s.current);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [pushState, setPushState] = useState<"idle" | "on" | "off" | "unsupported">("idle");
  const [tiktokUrl, setTiktokUrl] = useState("https://www.tiktok.com/@shopkorea8");
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!account?.id) return;
    fetch("/api/notifications", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((j) => setItems(j.notifications ?? []));
    fetch("/api/notifications/config")
      .then((r) => r.json())
      .then((j) => { if (j.tiktokUrl) setTiktokUrl(j.tiktokUrl); });
    fetch("/api/telegram/link", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((j) => {
        if (j.url) setTelegramUrl(j.url);
        setTelegramConnected(Boolean(j.connected));
      });
  }, [account?.id]);

  async function enablePush() {
    if (!account?.id) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushState("unsupported");
      return;
    }
    const cfg = await fetch("/api/notifications/config").then((r) => r.json());
    if (!cfg.publicKey) {
      setMsg(tr("notifications.pushNotConfigured"));
      return;
    }
    const reg = await navigator.serviceWorker.register("/sw.js");
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(cfg.publicKey),
    });
    const json = sub.toJSON();
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        subscription: { endpoint: json.endpoint!, keys: json.keys as { p256dh: string; auth: string } },
      }),
    });
    setPushState("on");
    setMsg(tr("notifications.pushEnabled"));
  }

  async function markRead(id: string) {
    if (!account?.id) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id }),
    });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
  }

  if (!account) return null;

  return (
    <div className="card min-w-0 overflow-hidden p-4 sm:p-6">
      <div className="min-w-0">
        <h2 className="text-base font-medium sm:text-lg">{tr("notifications.title")}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{tr("notifications.hint")}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:gap-3">
        <button type="button" onClick={enablePush} className="btn-outline w-full justify-center lg:w-auto">
          <I.Sparkle size={18} /> {tr("notifications.enablePush")}
        </button>
        {telegramUrl && (
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn-outline w-full justify-center lg:w-auto ${telegramConnected ? "border-emerald-400 text-emerald-700" : ""}`}
          >
            <I.Telegram size={18} /> {telegramConnected ? tr("notifications.telegramConnected") : tr("notifications.connectTelegram")}
          </a>
        )}
        <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="btn-outline w-full justify-center lg:w-auto">
          TikTok
        </a>
      </div>
      {pushState === "unsupported" && <p className="mt-2 text-xs leading-relaxed text-muted">{tr("notifications.pushUnsupported")}</p>}
      {msg && <p className="mt-2 break-words text-sm text-accent">{msg}</p>}

      {items.length > 0 && (
        <ul className="mt-4 space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`min-w-0 rounded-xl border border-line p-3 sm:p-4 ${n.read_at ? "opacity-70" : "bg-accent-soft/30"}`}
            >
              <p className="break-words font-medium text-ink">{n.title}</p>
              <p className="mt-1 break-words text-sm leading-relaxed text-muted">{n.body}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                {n.link && (
                  <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {tr("notifications.openLink")}
                  </a>
                )}
                {!n.read_at && (
                  <button type="button" onClick={() => markRead(n.id)} className="text-muted hover:text-ink">
                    {tr("notifications.markRead")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length === 0 && (
        <p className="mt-4 text-sm text-muted">{tr("notifications.empty")}</p>
      )}

      <p className="mt-4 break-words text-xs leading-relaxed text-faint">
        {tr("notifications.channels")}{" "}
        <Link href="/account/profile" className="text-accent hover:underline">{tr("account.profile")}</Link>
      </p>
    </div>
  );
}
