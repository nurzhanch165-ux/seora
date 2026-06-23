import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { getCustomerIdFromRequest } from "@/lib/customerSession.server";
import { buildOrders, SCREENSHOT_BUCKET } from "@/lib/supabase/orders";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessionId = getCustomerIdFromRequest();
  const isAdmin = isAdminRequest();

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "payment.uploadFailed" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "payment.imageRequired" }, { status: 400 });
  }
  if (file.size > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "payment.fileTooLarge" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing, error: findErr } = await admin
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single();
  if (findErr || !existing) {
    return NextResponse.json({ error: "checkout.createFailed" }, { status: 404 });
  }

  if (!isAdmin) {
    if (!sessionId) {
      return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
    }
    if (existing.customer_id !== sessionId) {
      return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
    }
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${params.id}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from(SCREENSHOT_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const nextStatus =
    existing.status === "awaiting_payment" || existing.status === "new"
      ? "payment_sent"
      : existing.status;

  const { data, error } = await admin
    .from("orders")
    .update({ payment_screenshot: path, status: nextStatus })
    .eq("id", params.id)
    .select("*")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "payment.uploadFailed" }, { status: 500 });
  }

  const [order] = await buildOrders(admin, [data]);
  return NextResponse.json({ order });
}
