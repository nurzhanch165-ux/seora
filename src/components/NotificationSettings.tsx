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
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!account?.id) return;
    fetch(`/api/notifications?customerId=${encodeURIComponent(account.id)}`)
      .then((r) => r.json())
      .then((j) => setItems(j.notifications ?? []));
    fetch("/api/notifications/config")
      .then((r) => r.json())
      .then((j) => { if (j.tiktokUrl) setTiktokUrl(j.tiktokUrl); });
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
      body: JSON.stringify({
        customerId: account.id,
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
      body: JSON.stringify({ id, customerId: account.id }),
    });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
  }

  if (!account) return null;

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="text-lg font-medium">{tr("notifications.title")}</h2>
        <p className="mt-1 text-sm text-muted">{tr("notifications.hint")}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={enablePush} className="btn-outline">
          <I.Sparkle size={18} /> {tr("notifications.enablePush")}
        </button>
        <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
          TikTok
        </a>
      </div>
      {pushState === "unsupported" && <p className="text-xs text-muted">{tr("notifications.pushUnsupported")}</p>}
      {msg && <p className="text-sm text-accent">{msg}</p>}

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border border-line p-4 ${n.read_at ? "opacity-70" : "bg-accent-soft/30"}`}
            >
              <p className="font-medium text-ink">{n.title}</p>
              <p className="mt-1 text-sm text-muted">{n.body}</p>
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
        <p className="text-sm text-muted">{tr("notifications.empty")}</p>
      )}

      <p className="text-xs text-faint">
        {tr("notifications.channels")}{" "}
        <Link href="/account/profile" className="text-accent hover:underline">{tr("account.profile")}</Link>
      </p>
    </div>
  );
}
