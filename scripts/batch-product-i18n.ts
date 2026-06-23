/**
 * Batch-generate products.i18n (EN/KO) for all products via MyMemory API.
 * npx tsx scripts/batch-product-i18n.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { mapProductRow, type ProductRow } from "../src/lib/supabase/products";
import { productFieldsFromProduct } from "../src/lib/productI18n";
import { buildProductI18n } from "../src/lib/translate.server";

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
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const admin = createClient(url, key);
  const { data, error } = await admin.from("products").select("*");
  if (error) throw error;

  let updated = 0;
  let skipped = 0;

  for (const row of data as ProductRow[]) {
    const product = mapProductRow(row);
    const hasI18n = product.i18n?.en?.name && product.i18n?.ko?.name;
    if (hasI18n) {
      skipped++;
      continue;
    }

    try {
      const i18n = await buildProductI18n(productFieldsFromProduct(product));
      const { error: upErr } = await admin.from("products").update({ i18n }).eq("id", row.id);
      if (upErr) {
        console.error(row.id, upErr.message);
      } else {
        updated++;
        console.log(`✓ ${row.id}: ${product.name}`);
      }
      await new Promise((r) => setTimeout(r, 800));
    } catch (e) {
      console.error(row.id, e);
    }
  }

  console.log(`Done. Updated: ${updated}, skipped (already had i18n): ${skipped}.`);
}

main();
