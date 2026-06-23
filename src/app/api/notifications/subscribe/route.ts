import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomerIdFromRequest } from "@/lib/customerSession.server";

export async function POST(req: Request) {
  const customerId = getCustomerIdFromRequest();
  if (!customerId) {
    return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => null) as {
    subscription?: { endpoint: string; keys: { p256dh: string; auth: string } };
  } | null;

  if (!body?.subscription?.endpoint) {
    return NextResponse.json({ error: "errors.generic" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      customer_id: customerId,
      endpoint: body.subscription.endpoint,
      p256dh: body.subscription.keys.p256dh,
      auth: body.subscription.keys.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const customerId = getCustomerIdFromRequest();
  if (!customerId) {
    return NextResponse.json({ error: "auth.notAuthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint");
  if (!endpoint) {
    return NextResponse.json({ error: "errors.generic" }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("customer_id", customerId);

  return NextResponse.json({ ok: true });
}
