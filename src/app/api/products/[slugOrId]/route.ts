import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProductRow, type ProductRow } from "@/lib/supabase/products";

export const revalidate = 60;

type Params = { params: { slugOrId: string } };

export async function GET(req: Request, { params }: Params) {
  const admin = createAdminClient();
  const byId = new URL(req.url).searchParams.get("by") === "id";
  const key = decodeURIComponent(params.slugOrId);

  const query = admin.from("products").select("*").limit(1);
  const { data, error } = byId
    ? await query.eq("id", key).maybeSingle()
    : await query.eq("slug", key).maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const product = mapProductRow(data as ProductRow);
  return NextResponse.json(
    { product },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
