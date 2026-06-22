import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EMPTY_EXTRAS, type CatalogExtras } from "@/lib/catalogTree";

function mapRow(row: {
  extra_brands?: unknown;
  extra_categories?: unknown;
  extra_subcategories?: unknown;
}): CatalogExtras {
  return {
    extraBrands: (row.extra_brands as CatalogExtras["extraBrands"]) ?? [],
    extraCategories: (row.extra_categories as CatalogExtras["extraCategories"]) ?? [],
    extraSubcategories: (row.extra_subcategories as CatalogExtras["extraSubcategories"]) ?? [],
  };
}

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("site_catalog").select("*").eq("id", "main").maybeSingle();
  if (error) return NextResponse.json({ extras: EMPTY_EXTRAS });
  if (!data) return NextResponse.json({ extras: EMPTY_EXTRAS });
  return NextResponse.json({ extras: mapRow(data) });
}
