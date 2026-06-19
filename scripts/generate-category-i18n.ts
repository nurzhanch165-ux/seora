import { writeFileSync } from "fs";
import { sections } from "../src/data/categories";

async function tr(text: string, to: "en" | "ko"): Promise<string> {
  if (!text.trim()) return text;
  const params = new URLSearchParams({ q: text.slice(0, 400), langpair: `ru|${to}` });
  const res = await fetch(`https://api.mymemory.translated.net/get?${params}`);
  const json = await res.json();
  const out = json?.responseData?.translatedText as string | undefined;
  if (!out || /^MYMEMORY WARNING/i.test(out)) return text;
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const en: Record<string, string> = {};
  const ko: Record<string, string> = {};

  for (const s of sections) {
    en[`cat.section.${s.slug}`] = await tr(s.name, "en");
    ko[`cat.section.${s.slug}`] = await tr(s.name, "ko");
    await sleep(200);
    en[`cat.sectionTagline.${s.slug}`] = await tr(s.tagline, "en");
    ko[`cat.sectionTagline.${s.slug}`] = await tr(s.tagline, "ko");
    await sleep(200);

    for (const c of s.categories) {
      en[`cat.category.${c.slug}`] = await tr(c.name, "en");
      ko[`cat.category.${c.slug}`] = await tr(c.name, "ko");
      await sleep(200);
      for (const sub of c.subs) {
        const key = `cat.sub.${sub.slug}`;
        if (!en[key]) {
          en[key] = await tr(sub.name, "en");
          ko[key] = await tr(sub.name, "ko");
          await sleep(200);
        }
      }
    }
  }

  writeFileSync(
    "src/lib/i18n/categoryLocales.json",
    JSON.stringify({ en, ko }, null, 2),
    "utf8"
  );
  console.log("Generated", Object.keys(en).length, "EN keys");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
