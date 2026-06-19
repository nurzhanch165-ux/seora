import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { DAILY_EXPORTS_BUCKET } from "@/lib/excel.server";

export async function GET(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const admin = createAdminClient();

  const { data, error } = await admin.storage.from(DAILY_EXPORTS_BUCKET).list("", {
    limit: 50,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    return NextResponse.json({ error: error.message, files: [] });
  }

  const files = await Promise.all(
    (data ?? [])
      .filter((f) => f.name.endsWith(".xlsx"))
      .filter((f) => !date || f.name.includes(date.replace(/-/g, "_")))
      .map(async (f) => {
        const path = f.name;
      const { data: signed } = await admin.storage.from(DAILY_EXPORTS_BUCKET).createSignedUrl(path, 3600);
      return {
        name: f.name,
        path,
        createdAt: f.created_at,
        url: signed?.signedUrl ?? null,
      };
    })
  );

  return NextResponse.json({ files });
}

export async function POST(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { generateAndUploadDailyExcel } = await import("@/lib/excel.server");

  try {
    const result = await generateAndUploadDailyExcel(body.date);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Export failed" }, { status: 500 });
  }
}
