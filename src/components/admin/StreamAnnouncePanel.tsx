"use client";

import { useCallback, useEffect, useState } from "react";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

type AnnounceTemplate = {
  id: string;
  name: string;
  title: string;
  body: string;
  tiktokUrl: string;
  createdAt: string;
};

type Props = {
  title: string;
  body: string;
  tiktokUrl: string;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onTiktokChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  result: string;
};

export function StreamAnnouncePanel({
  title,
  body,
  tiktokUrl,
  onTitleChange,
  onBodyChange,
  onTiktokChange,
  onSend,
  sending,
  result,
}: Props) {
  const tr = useT();
  const [templates, setTemplates] = useState<AnnounceTemplate[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/announce-templates");
    const j = await res.json();
    if (res.ok) setTemplates(j.templates ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function persist(next: AnnounceTemplate[]) {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/announce-templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templates: next }),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(j.error ?? tr("errors.generic"));
      return false;
    }
    setTemplates(j.templates ?? next);
    return true;
  }

  function applyTemplate(t: AnnounceTemplate) {
    onTitleChange(t.title);
    onBodyChange(t.body);
    onTiktokChange(t.tiktokUrl || tiktokUrl);
    setSelectedId(t.id);
  }

  function onSelectTemplate(id: string) {
    setSelectedId(id);
    const t = templates.find((x) => x.id === id);
    if (t) applyTemplate(t);
  }

  async function saveTemplate() {
    const name = templateName.trim() || title.trim() || tr("admin.streams.templateUntitled");
    const entry: AnnounceTemplate = {
      id: selectedId && templates.some((t) => t.id === selectedId)
        ? selectedId
        : `tpl_${Date.now().toString(36)}`,
      name,
      title: title.trim(),
      body: body.trim(),
      tiktokUrl: tiktokUrl.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = templates.some((t) => t.id === entry.id)
      ? templates.map((t) => (t.id === entry.id ? entry : t))
      : [...templates, entry];
    const ok = await persist(next);
    if (ok) {
      setSelectedId(entry.id);
      setTemplateName("");
      setMsg(tr("admin.streams.templateSaved"));
    }
  }

  async function deleteTemplate(id: string) {
    const next = templates.filter((t) => t.id !== id);
    const ok = await persist(next);
    if (ok) {
      if (selectedId === id) setSelectedId("");
      setMsg(tr("admin.streams.templateDeleted"));
    }
  }

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="text-lg font-medium">{tr("admin.streams.announceTitle")}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{tr("admin.streams.announceHint")}</p>

      {templates.length > 0 && (
        <div className="mt-4 space-y-3 rounded-xl border border-line bg-pearl/50 p-3 sm:p-4">
          <label className="field-label">{tr("admin.streams.templatePick")}</label>
          <select
            className="field"
            value={selectedId}
            onChange={(e) => onSelectTemplate(e.target.value)}
          >
            <option value="">{tr("admin.streams.templatePickEmpty")}</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <ul className="space-y-2">
            {templates.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                <button type="button" onClick={() => applyTemplate(t)} className="min-w-0 flex-1 text-left font-medium text-ink hover:text-accent">
                  {t.name}
                </button>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => applyTemplate(t)} className="text-xs text-accent hover:underline">
                    {tr("admin.streams.templateUse")}
                  </button>
                  <button type="button" onClick={() => void deleteTemplate(t.id)} disabled={busy} className="text-xs text-sale hover:underline">
                    {tr("admin.streams.templateDelete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid gap-4">
        <div>
          <label className="field-label">{tr("admin.streams.announceHeading")}</label>
          <input
            className="field"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={tr("admin.streams.announceDefaultTitle")}
          />
        </div>
        <div>
          <label className="field-label">{tr("admin.streams.announceMessage")}</label>
          <textarea
            className="field min-h-[88px] resize-y"
            rows={3}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder={tr("admin.streams.announceDefaultBody")}
          />
        </div>
        <div>
          <label className="field-label">TikTok</label>
          <input className="field" value={tiktokUrl} onChange={(e) => onTiktokChange(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="field-label">{tr("admin.streams.templateName")}</label>
          <input
            className="field"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder={tr("admin.streams.templateNamePlaceholder")}
          />
        </div>
        <button type="button" onClick={() => void saveTemplate()} disabled={busy} className="btn-outline w-full justify-center sm:w-auto">
          <I.Check size={16} /> {tr("admin.streams.templateSave")}
        </button>
      </div>

      {msg && <p className="mt-3 text-sm text-accent">{msg}</p>}
      {result && <p className="mt-3 break-words text-sm text-accent">{result}</p>}

      <button type="button" onClick={onSend} disabled={sending || busy} className="btn-accent mt-4 w-full justify-center sm:w-auto">
        {sending ? tr("admin.streams.announceSending") : tr("admin.streams.announceSend")}
      </button>
    </div>
  );
}
