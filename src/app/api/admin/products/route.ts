import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";
import { mapProductRow, productToRow, type ProductRow } from "@/lib/supabase/products";
import { productFieldsFromProduct } from "@/lib/productI18n";
import { buildProductI18n } from "@/lib/translate.server";
import { brands as STATIC_BRANDS } from "@/data/brands";
import type { Product } from "@/data/products";

async function ensureBrandSaved(admin: ReturnType<typeof createAdminClient>, brandSlug: string, brandName: string) {
  const known = STATIC_BRANDS.some((b) => b.slug === brandSlug);
  if (known) return;

  const { data } = await admin.from("site_catalog").select("extra_brands").eq("id", "main").maybeSingle();
  const extra = (data?.extra_brands as { slug: string; name: string; country: string }[]) ?? [];
  if (extra.some((b) => b.slug === brandSlug)) return;

  await admin.from("site_catalog").upsert({
    id: "main",
    extra_brands: [...extra, { slug: brandSlug, name: brandName, country: "Южная Корея" }],
    updated_at: new Date().toISOString(),
  });
}

function translateInBackground(
  admin: ReturnType<typeof createAdminClient>,
  product: Product
) {
  void (async () => {
    try {
      const i18n = await buildProductI18n(productFieldsFromProduct(product));
      await admin
        .from("products")
        .update({ i18n, updated_at: new Date().toISOString() })
        .eq("id", product.id);
    } catch {
      /* translation is best-effort; run npm run i18n:products to backfill */
    }
  })();
}

export async function POST(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const product = (await req.json().catch(() => null)) as (Product & { brandDisplayName?: string }) | null;
  if (!product || !product.id || !product.name) {
    return NextResponse.json({ error: "Некорректные данные товара." }, { status: 400 });
  }

  const admin = createAdminClient();
  const brandLabel = product.brandDisplayName?.trim() || product.brandSlug;
  await ensureBrandSaved(admin, product.brandSlug, brandLabel);

  const { brandDisplayName: _bn, ...productOnly } = product;
  void _bn;
  const saved = { ...productOnly, i18n: product.i18n ?? {} } as Product;
  const row = productToRow(saved);
  let { error } = await admin.from("products").upsert(row, { onConflict: "id" });

  if (error?.message?.includes("'i18n' column") || error?.message?.includes("'weight_kg' column")) {
    const { i18n: _i18n, weight_kg: _wkg, ...rowReduced } = row;
    void _i18n;
    void _wkg;
    ({ error } = await admin.from("products").upsert(rowReduced, { onConflict: "id" }));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  translateInBackground(admin, saved);

  return NextResponse.json({ ok: true, product: mapProductRow(row as unknown as ProductRow) });
}

export async function DELETE(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Не указан id товара." }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
