/**
 * Заполнить products.weight_kg для всех товаров из полей weight/volume.
 * npx tsx scripts/backfill-weight-kg.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { mapProductRow, productToRow, type ProductRow } from "../src/lib/supabase/products";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  });
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  const admin = createClient(url, key);
  const { data, error } = await admin.from("products").select("*");
  if (error) throw error;
  let updated = 0;
  for (const row of data as ProductRow[]) {
    const product = mapProductRow(row);
    const next = productToRow(product);
    if (Number(next.weight_kg) === Number(row.weight_kg ?? 0)) continue;
    const { error: upErr } = await admin.from("products").update({ weight_kg: next.weight_kg }).eq("id", row.id);
    if (upErr) console.error(row.id, upErr.message);
    else updated++;
  }
  console.log(`Updated weight_kg for ${updated} products.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
