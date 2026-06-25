import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProductRow, type ProductRow } from "@/lib/supabase/products";

export const revalidate = 60;

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data as ProductRow[]).map(mapProductRow);

  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
