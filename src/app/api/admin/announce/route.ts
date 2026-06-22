import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { announceStream } from "@/lib/notifications.server";

export async function POST(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const body = await req.json().catch(() => null) as {
    title?: string;
    body?: string;
    streamId?: string;
    tiktokUrl?: string;
  } | null;

  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Укажите заголовок объявления." }, { status: 400 });
  }

  const result = await announceStream({
    title: body.title,
    body: body.body ?? "",
    streamId: body.streamId ?? null,
    tiktokUrl: body.tiktokUrl,
  });

  return NextResponse.json({ ok: true, ...result });
}
