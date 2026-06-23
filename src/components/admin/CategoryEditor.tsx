"use client";

import { useMemo, useState } from "react";
import { IconKey, type Section } from "@/data/categories";
import { useCatalogTree } from "@/store/catalogTree";
import { mergeSections, type CatalogExtras } from "@/lib/catalogTree";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

const ICONS: IconKey[] = [
  "Droplet", "Jar", "Mask", "Cleanser", "Lipstick", "Device", "Man", "Woman",
  "Leaf", "Pill", "Eye", "Scale", "Tea", "Sparkle", "Shield", "HealthHeart", "Bone", "Stomach",
];

function slugify(s: string): string {
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

function categoryExistsInTree(sections: Section[], sectionSlug: string, slug: string): boolean {
  const section = sections.find((s) => s.slug === sectionSlug);
  return section?.categories.some((c) => c.slug === slug) ?? false;
}

export function CategoryEditor() {
  const tr = useT();
  const extras = useCatalogTree((s) => s.extras);
  const saveExtras = useCatalogTree((s) => s.saveExtras);
  const load = useCatalogTree((s) => s.load);

  const sections = useMemo(() => mergeSections(extras), [extras]);

  const [brandName, setBrandName] = useState("");
  const [brandCountry, setBrandCountry] = useState("Южная Корея");
  const [catSection, setCatSection] = useState<Section["slug"]>("cosmetics");
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState<IconKey>("Sparkle");
  const [subSection, setSubSection] = useState<Section["slug"]>("cosmetics");
  const [subCategory, setSubCategory] = useState("");
  const [subName, setSubName] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const subCategories = useMemo(() => {
    const sec = sections.find((s) => s.slug === subSection);
    return sec?.categories ?? [];
  }, [sections, subSection]);

  const extraCategoryKeys = useMemo(
    () => new Set(extras.extraCategories.map((c) => `${c.sectionSlug}:${c.slug}`)),
    [extras.extraCategories]
  );

  const extraSubKeys = useMemo(
    () => new Set(extras.extraSubcategories.map((s) => `${s.sectionSlug}:${s.categorySlug}:${s.slug}`)),
    [extras.extraSubcategories]
  );

  async function persist(next: CatalogExtras) {
    setSaving(true);
    setError("");
    const res = await saveExtras(next);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? tr("admin.catalog.saveFailed"));
      return false;
    }
    await load(true);
    return true;
  }

  async function addBrand(e: React.FormEvent) {
    e.preventDefault();
    if (!brandName.trim()) return;
    const slug = slugify(brandName) || "brand";
    if (extras.extraBrands.some((b) => b.slug === slug)) {
      setError(tr("admin.catalog.brandExists"));
      return;
    }
    const ok = await persist({
      ...extras,
      extraBrands: [...extras.extraBrands, { slug, name: brandName.trim(), country: brandCountry.trim() }],
    });
    if (ok) {
      setBrandName("");
      setMsg(tr("admin.catalog.brandAdded"));
    }
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim()) return;
    const slug = slugify(catName) || "category";
    if (categoryExistsInTree(sections, catSection, slug)) {
      setError(tr("admin.catalog.categoryExists"));
      return;
    }
    const ok = await persist({
      ...extras,
      extraCategories: [
        ...extras.extraCategories,
        { sectionSlug: catSection, slug, name: catName.trim(), icon: catIcon, subs: [] },
      ],
    });
    if (ok) {
      setCatName("");
      setMsg(tr("admin.catalog.categoryAdded"));
    }
  }

  async function addSubcategory(e: React.FormEvent) {
    e.preventDefault();
    if (!subName.trim() || !subCategory) return;
    const slug = slugify(subName) || "sub";
    const section = sections.find((s) => s.slug === subSection);
    const category = section?.categories.find((c) => c.slug === subCategory);
    if (category?.subs.some((s) => s.slug === slug)) {
      setError(tr("admin.catalog.subExists"));
      return;
    }
    const ok = await persist({
      ...extras,
      extraSubcategories: [
        ...extras.extraSubcategories,
        { sectionSlug: subSection, categorySlug: subCategory, slug, name: subName.trim() },
      ],
    });
    if (ok) {
      setSubName("");
      setMsg(tr("admin.catalog.subAdded"));
    }
  }

  async function removeBrand(slug: string) {
    await persist({ ...extras, extraBrands: extras.extraBrands.filter((b) => b.slug !== slug) });
  }

  async function removeCategory(sectionSlug: string, slug: string) {
    await persist({
      ...extras,
      extraCategories: extras.extraCategories.filter((c) => !(c.sectionSlug === sectionSlug && c.slug === slug)),
    });
  }

  async function removeSub(sectionSlug: string, categorySlug: string, slug: string) {
    await persist({
      ...extras,
      extraSubcategories: extras.extraSubcategories.filter(
        (s) => !(s.sectionSlug === sectionSlug && s.categorySlug === categorySlug && s.slug === slug)
      ),
    });
  }

  return (
    <div className="space-y-8">
      {msg && <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{msg}</p>}
      {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}

      <div className="card p-4 sm:p-6">
        <h3 className="text-lg font-medium">{tr("admin.catalog.treeTitle")}</h3>
        <p className="mt-1 text-sm text-muted">{tr("admin.catalog.treeHint")}</p>
        <div className="mt-4 space-y-4">
          {sections.map((section) => (
            <div key={section.slug} className="rounded-xl border border-line">
              <div className="border-b border-line bg-mist px-4 py-2.5">
                <p className="font-medium text-ink">{section.name}</p>
                <p className="text-xs text-muted">{section.slug}</p>
              </div>
              <ul className="divide-y divide-line">
                {section.categories.map((cat) => {
                  const isExtraCat = extraCategoryKeys.has(`${section.slug}:${cat.slug}`);
                  return (
                    <li key={cat.slug} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">
                            {cat.name}
                            {isExtraCat && (
                              <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                                {tr("admin.catalog.customBadge")}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted">{cat.slug} · {cat.subs.length} {tr("admin.catalog.subCount")}</p>
                        </div>
                        {isExtraCat && (
                          <button
                            type="button"
                            onClick={() => removeCategory(section.slug, cat.slug)}
                            className="text-faint hover:text-sale"
                            aria-label={tr("common.remove")}
                          >
                            <I.Trash size={16} />
                          </button>
                        )}
                      </div>
                      {cat.subs.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {cat.subs.map((sub) => {
                            const isExtraSub = extraSubKeys.has(`${section.slug}:${cat.slug}:${sub.slug}`);
                            return (
                              <li
                                key={sub.slug}
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
                                  isExtraSub ? "border-accent/30 bg-accent-soft text-accent" : "border-line text-muted"
                                }`}
                              >
                                {sub.name}
                                {isExtraSub && (
                                  <button
                                    type="button"
                                    onClick={() => removeSub(section.slug, cat.slug, sub.slug)}
                                    className="text-accent/70 hover:text-sale"
                                    aria-label={tr("common.remove")}
                                  >
                                    <I.Close size={12} />
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <h3 className="text-lg font-medium">{tr("admin.catalog.brandsTitle")}</h3>
        <p className="mt-1 text-sm text-muted">{tr("admin.catalog.brandsHint")}</p>
        <form onSubmit={addBrand} className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label">{tr("admin.product.brand")}</label>
            <input className="field" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          </div>
          <div>
            <label className="field-label">{tr("admin.product.country")}</label>
            <input className="field" value={brandCountry} onChange={(e) => setBrandCountry(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">{tr("admin.catalog.addBrand")}</button>
          </div>
        </form>
        {extras.extraBrands.length > 0 && (
          <ul className="mt-4 space-y-2">
            {extras.extraBrands.map((b) => (
              <li key={b.slug} className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm">
                <span className="min-w-0 truncate">{b.name} <span className="text-muted">({b.slug})</span></span>
                <button type="button" onClick={() => removeBrand(b.slug)} className="shrink-0 text-faint hover:text-sale"><I.Trash size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-4 sm:p-6">
        <h3 className="text-lg font-medium">{tr("admin.catalog.categoriesTitle")}</h3>
        <p className="mt-1 text-sm text-muted">{tr("admin.catalog.categoriesHint")}</p>
        <form onSubmit={addCategory} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="field-label">{tr("admin.product.section")}</label>
            <select className="field" value={catSection} onChange={(e) => setCatSection(e.target.value as Section["slug"])}>
              {sections.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">{tr("admin.product.category")}</label>
            <input className="field" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder={tr("admin.catalog.categoryPlaceholder")} />
          </div>
          <div>
            <label className="field-label">{tr("admin.product.icon")}</label>
            <select className="field" value={catIcon} onChange={(e) => setCatIcon(e.target.value as IconKey)}>
              {ICONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">{tr("admin.catalog.addCategory")}</button>
          </div>
        </form>
      </div>

      <div className="card p-4 sm:p-6">
        <h3 className="text-lg font-medium">{tr("admin.catalog.subsTitle")}</h3>
        <p className="mt-1 text-sm text-muted">{tr("admin.catalog.subsHint")}</p>
        <form onSubmit={addSubcategory} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="field-label">{tr("admin.product.section")}</label>
            <select className="field" value={subSection} onChange={(e) => { setSubSection(e.target.value as Section["slug"]); setSubCategory(""); }}>
              {sections.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">{tr("admin.product.category")}</label>
            <select className="field" value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
              <option value="">{tr("admin.product.subcategoryEmpty")}</option>
              {subCategories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">{tr("admin.product.subcategory")}</label>
            <input className="field" value={subName} onChange={(e) => setSubName(e.target.value)} placeholder={tr("admin.catalog.subPlaceholder")} />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={saving || !subCategory} className="btn-primary w-full sm:w-auto disabled:opacity-50">{tr("admin.catalog.addSub")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
