/**
 * Batch-generate products.i18n (EN/KO) for all products via MyMemory API.
 * npx tsx scripts/batch-product-i18n.ts
 * npx tsx scripts/batch-product-i18n.ts --force   # retranslate all
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { mapProductRow, type ProductRow } from "../src/lib/supabase/products";
import { productFieldsFromProduct } from "../src/lib/productI18n";
import { buildProductI18n } from "../src/lib/translateProduct";

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

const force = process.argv.includes("--force");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function isComplete(i18n: ReturnType<typeof mapProductRow>["i18n"]): boolean {
  if (!i18n?.en?.name?.trim() || !i18n?.ko?.name?.trim()) return false;
  return true;
}

async function main() {
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const admin = createClient(url, key);
  const { data, error } = await admin.from("products").select("*").order("id");
  if (error) throw error;

  const rows = data as ProductRow[];
  console.log(`Products: ${rows.length}, force: ${force}`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const product = mapProductRow(row);

    if (!force && isComplete(product.i18n)) {
      skipped++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${rows.length}] ${product.name.slice(0, 50)}… `);

    try {
      const i18n = await buildProductI18n(productFieldsFromProduct(product));
      const { error: upErr } = await admin.from("products").update({ i18n }).eq("id", row.id);
      if (upErr) {
        failed++;
        console.log(`FAIL: ${upErr.message}`);
      } else {
        updated++;
        console.log("OK");
      }
      await new Promise((r) => setTimeout(r, 1200));
    } catch (e) {
      failed++;
      console.log(`ERR: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(`\nDone. Updated: ${updated}, skipped: ${skipped}, failed: ${failed}.`);
}

main();
