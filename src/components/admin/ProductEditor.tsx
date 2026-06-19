"use client";

import { useMemo, useState } from "react";
import { Product, Tone } from "@/data/products";
import { IconKey, sections } from "@/data/categories";
import { brands } from "@/data/brands";
import { ProductVisual } from "@/components/ProductVisual";
import * as I from "@/components/icons";

const ICONS: IconKey[] = [
  "Droplet", "Jar", "Mask", "Cleanser", "Lipstick", "Device", "Man", "Woman",
  "Leaf", "Pill", "Eye", "Scale", "Tea", "Sparkle", "Shield", "HealthHeart", "Bone", "Stomach",
];
const TONES: Tone[] = ["rose", "sand", "sage", "clay", "sky", "plum", "amber", "mist"];
const ALL_TAGS: ("new" | "hit" | "sale")[] = ["new", "hit", "sale"];

function translit(s: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
    й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
    у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
    э: "e", ю: "yu", я: "ya", " ": "-",
  };
  return s
    .toLowerCase()
    .split("")
    .map((ch) => (ch in map ? map[ch] : ch))
    .join("")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadFiles(files: FileList): Promise<string[]> {
  const fd = new FormData();
  Array.from(files).forEach((file) => fd.append("files", file));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Не удалось загрузить фото.");
  return (json.urls as string[]) ?? [];
}

type EditorState = {
  name: string;
  brandSlug: string;
  sectionSlug: "cosmetics" | "health" | "home" | "clothes" | "shoes";
  categorySlug: string;
  subSlug: string;
  glyph: IconKey;
  tone: Tone;
  images: string[];
  price: string;
  oldPrice: string;
  shortDescription: string;
  fullDescription: string;
  usage: string;
  result: string;
  howToUse: string;
  volume: string;
  weight: string;
  shelfLife: string;
  monthsSupply: string;
  country: string;
  manufacturer: string;
  certificates: string;
  stock: string;
  rating: string;
  reviews: string;
  tags: ("new" | "hit" | "sale")[];
  sku: string;
  active: boolean;
};

function initial(product?: Product): EditorState {
  const firstSection = sections[0];
  return {
    name: product?.name ?? "",
    brandSlug: product?.brandSlug ?? brands[0].slug,
    sectionSlug: product?.sectionSlug ?? firstSection.slug,
    categorySlug: product?.categorySlug ?? firstSection.categories[0].slug,
    subSlug: product?.subSlug ?? "",
    glyph: product?.glyph ?? "Sparkle",
    tone: product?.tone ?? "sand",
    images: product?.images ?? [],
    price: product ? String(product.price) : "",
    oldPrice: product?.oldPrice ? String(product.oldPrice) : "",
    shortDescription: product?.shortDescription ?? "",
    fullDescription: product?.fullDescription ?? "",
    usage: product?.usage ?? "",
    result: product?.result ?? "",
    howToUse: product?.howToUse ?? "",
    volume: product?.volume ?? "",
    weight: product?.weight ?? "",
    shelfLife: product?.shelfLife ?? "",
    monthsSupply: product?.monthsSupply ?? "",
    country: product?.country ?? "Южная Корея",
    manufacturer: product?.manufacturer ?? "",
    certificates: (product?.certificates ?? []).join(", "),
    stock: product ? String(product.stock) : "0",
    rating: product ? String(product.rating) : "5",
    reviews: product ? String(product.reviews) : "0",
    tags: product?.tags ?? [],
    sku: product?.sku ?? product?.id ?? "",
    active: product?.active !== false,
  };
}

export function ProductEditor({
  product,
  onSave,
  onCancel,
}: {
  product?: Product;
  onSave: (p: Product) => Promise<{ ok: boolean; error?: string }> | void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EditorState>(() => initial(product));
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const section = useMemo(
    () => sections.find((s) => s.slug === form.sectionSlug) ?? sections[0],
    [form.sectionSlug]
  );
  const category = useMemo(
    () => section.categories.find((c) => c.slug === form.categorySlug) ?? section.categories[0],
    [section, form.categorySlug]
  );

  function set<K extends keyof EditorState>(k: K, v: EditorState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function changeSection(slug: EditorState["sectionSlug"]) {
    const s = sections.find((x) => x.slug === slug) ?? sections[0];
    setForm((f) => ({ ...f, sectionSlug: slug, categorySlug: s.categories[0].slug, subSlug: "" }));
  }

  function changeCategory(slug: string) {
    setForm((f) => ({ ...f, categorySlug: slug, subSlug: "" }));
  }

  async function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const urls = await uploadFiles(files);
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить фото.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  function toggleTag(tag: "new" | "hit" | "sale") {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Укажите название товара.");
    if (!form.price || Number(form.price) <= 0) return setError("Укажите корректную цену.");

    const id = product?.id ?? "ap" + Date.now().toString(36);
    const slug = product?.slug ?? `${translit(form.name) || "tovar"}-${id}`;

    const result: Product = {
      id,
      slug,
      name: form.name.trim(),
      brandSlug: form.brandSlug,
      sectionSlug: form.sectionSlug,
      categorySlug: form.categorySlug,
      subSlug: form.subSlug,
      glyph: form.glyph,
      tone: form.tone,
      images: form.images.length ? form.images : undefined,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      usage: form.usage.trim(),
      result: form.result.trim(),
      howToUse: form.howToUse.trim(),
      volume: form.volume.trim(),
      weight: form.weight.trim(),
      shelfLife: form.shelfLife.trim(),
      monthsSupply: form.monthsSupply.trim(),
      country: form.country.trim(),
      manufacturer: form.manufacturer.trim(),
      certificates: form.certificates.split(",").map((c) => c.trim()).filter(Boolean),
      stock: Number(form.stock) || 0,
      rating: Number(form.rating) || 5,
      reviews: Number(form.reviews) || 0,
      tags: form.tags,
      sku: form.sku.trim() || id,
      active: form.active,
    };
    setSaving(true);
    const res = await onSave(result);
    setSaving(false);
    if (res && !res.ok) setError(res.error ?? "Не удалось сохранить товар.");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Фото */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink">Фотографии</h3>
        <div className="flex flex-wrap items-center gap-3">
          {form.images.map((src, i) => (
            <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl border border-line">
              <ProductVisual tone={form.tone} glyph={form.glyph} image={src} className="h-full w-full" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-paper hover:bg-sale"
                aria-label="Удалить фото"
              >
                <I.Close size={14} />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line text-xs text-muted hover:border-accent hover:text-accent">
            <I.Plus size={20} />
            {uploading ? "Загрузка…" : "Добавить"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-faint">
          Если фото не добавлены, на витрине показывается фирменная градиентная обложка с иконкой.
        </p>
      </div>

      {/* Основное */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Название *" value={form.name} onChange={(v) => set("name", v)} />
        <div>
          <label className="field-label">Бренд</label>
          <select value={form.brandSlug} onChange={(e) => set("brandSlug", e.target.value)} className="field">
            {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="field-label">Раздел</label>
          <select value={form.sectionSlug} onChange={(e) => changeSection(e.target.value as EditorState["sectionSlug"])} className="field">
            {sections.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Категория</label>
          <select value={form.categorySlug} onChange={(e) => changeCategory(e.target.value)} className="field">
            {section.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Подкатегория</label>
          <select value={form.subSlug} onChange={(e) => set("subSlug", e.target.value)} className="field">
            <option value="">— не выбрано —</option>
            {category.subs.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Цена (KRW) *" type="number" value={form.price} onChange={(v) => set("price", v)} />
        <Field label="Артикул / SKU" value={form.sku} onChange={(v) => set("sku", v)} />
        <Field label="Старая цена" type="number" value={form.oldPrice} onChange={(v) => set("oldPrice", v)} />
        <Field label="Остаток" type="number" value={form.stock} onChange={(v) => set("stock", v)} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Товар активен (показывать в каталоге)
        </label>
        {Number(form.stock) <= 0 && (
          <span className="text-xs text-muted">Остаток 0 — статус «закончился» на витрине</span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Иконка</label>
          <select value={form.glyph} onChange={(e) => set("glyph", e.target.value as IconKey)} className="field">
            {ICONS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Тон обложки</label>
          <select value={form.tone} onChange={(e) => set("tone", e.target.value as Tone)} className="field">
            {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Объём / кол-во" value={form.volume} onChange={(v) => set("volume", v)} />
        <Field label="Граммовка" value={form.weight} onChange={(v) => set("weight", v)} />
        <Field label="Срок годности" value={form.shelfLife} onChange={(v) => set("shelfLife", v)} />
        <Field label="Хватает на" value={form.monthsSupply} onChange={(v) => set("monthsSupply", v)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Страна" value={form.country} onChange={(v) => set("country", v)} />
        <Field label="Производитель" value={form.manufacturer} onChange={(v) => set("manufacturer", v)} />
      </div>

      <Field label="Сертификаты (через запятую)" value={form.certificates} onChange={(v) => set("certificates", v)} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Рейтинг (0–5)" type="number" value={form.rating} onChange={(v) => set("rating", v)} />
        <Field label="Кол-во отзывов" type="number" value={form.reviews} onChange={(v) => set("reviews", v)} />
      </div>

      <div>
        <label className="field-label">Подборки (бейджи)</label>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              className={`chip ${form.tags.includes(t) ? "border-accent bg-accent-soft text-accent" : ""}`}
            >
              {t === "new" ? "Новинка" : t === "hit" ? "Хит" : "Скидка"}
            </button>
          ))}
        </div>
      </div>

      <Area label="Краткое описание" value={form.shortDescription} onChange={(v) => set("shortDescription", v)} rows={2} />
      <Area label="Полное описание" value={form.fullDescription} onChange={(v) => set("fullDescription", v)} rows={3} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Area label="Для чего применяется" value={form.usage} onChange={(v) => set("usage", v)} rows={2} />
        <Area label="Ожидаемый результат" value={form.result} onChange={(v) => set("result", v)} rows={2} />
      </div>
      <Area label="Способ применения" value={form.howToUse} onChange={(v) => set("howToUse", v)} rows={2} />

      {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-primary disabled:opacity-60">
          <I.Check size={18} /> {saving ? "Сохранение…" : product ? "Сохранить изменения" : "Добавить товар"}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">Отмена</button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="field" />
    </div>
  );
}

function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="field resize-none" />
    </div>
  );
}
