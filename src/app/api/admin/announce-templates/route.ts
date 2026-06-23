import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";

export type AnnounceTemplate = {
  id: string;
  name: string;
  title: string;
  body: string;
  tiktokUrl: string;
  createdAt: string;
};

function normalizeTemplates(raw: unknown): AnnounceTemplate[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is Record<string, unknown> => t && typeof t === "object")
    .map((t) => ({
      id: String(t.id ?? ""),
      name: String(t.name ?? "").trim(),
      title: String(t.title ?? "").trim(),
      body: String(t.body ?? "").trim(),
      tiktokUrl: String(t.tiktokUrl ?? "").trim(),
      createdAt: String(t.createdAt ?? new Date().toISOString()),
    }))
    .filter((t) => t.id && t.name);
}

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin.from("site_catalog").select("announce_templates").eq("id", "main").maybeSingle();
  if (error?.message?.includes("announce_templates")) {
    return NextResponse.json({ templates: [] });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: normalizeTemplates(data?.announce_templates) });
}

export async function PUT(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as { templates?: unknown } | null;
  const templates = normalizeTemplates(body?.templates);
  const admin = createAdminClient();
  const { data: existing } = await admin.from("site_catalog").select("id").eq("id", "main").maybeSingle();
  if (!existing) {
    await admin.from("site_catalog").insert({ id: "main" });
  }
  const { error } = await admin.from("site_catalog").update({
    announce_templates: templates,
    updated_at: new Date().toISOString(),
  }).eq("id", "main");
  if (error?.message?.includes("announce_templates")) {
    return NextResponse.json({
      error: "Колонка announce_templates не найдена. Примените миграцию 20260623_announce_templates.sql в Supabase.",
    }, { status: 500 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, templates });
}
