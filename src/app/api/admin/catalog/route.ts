import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import type { CatalogExtras } from "@/lib/catalogTree";

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const admin = createAdminClient();
  const { data, error } = await admin.from("site_catalog").select("*").eq("id", "main").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    extras: {
      extraBrands: data?.extra_brands ?? [],
      extraCategories: data?.extra_categories ?? [],
      extraSubcategories: data?.extra_subcategories ?? [],
    },
  });
}

export async function PATCH(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as CatalogExtras | null;
  if (!body) {
    return NextResponse.json({ error: "Некорректные данные." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("site_catalog").upsert({
    id: "main",
    extra_brands: body.extraBrands ?? [],
    extra_categories: body.extraCategories ?? [],
    extra_subcategories: body.extraSubcategories ?? [],
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
