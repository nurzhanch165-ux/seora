/**
 * Заполняет таблицу products стартовым каталогом из data/products.ts
 * Запуск: npx tsx scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import { products } from "../src/data/products";
import { productToRow } from "../src/lib/supabase/products";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const key = t.slice(0, i).trim();
      const val = t.slice(i + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* .env.local optional if vars already set */
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env.local");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });
const rows = products.map(productToRow);

async function main() {
  const { error } = await admin.from("products").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("Ошибка:", error.message);
    process.exit(1);
  }
  console.log(`OK: загружено ${rows.length} товаров.`);
}

main();
