import Link from "next/link";
import { brands } from "@/data/brands";
import { products } from "@/data/products";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import * as I from "@/components/icons";

export const metadata = { title: "Бренды" };

export default function BrandsPage() {
  const count = (slug: string) => products.filter((p) => p.brandSlug === slug).length;

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: "Бренды" }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">Корейские бренды</h1>
      <p className="mt-2 max-w-xl text-muted">
        Работаем напрямую с производителями и официальными поставщиками из Южной Кореи.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((b) => (
          <Link
            key={b.slug}
            href={`/brands/${b.slug}`}
            className="group flex flex-col justify-between rounded-xl2 border border-line bg-surface p-6 transition-shadow hover:shadow-lift"
          >
            <span className="font-serif text-xl text-ink">{b.name}</span>
            <div className="mt-6 flex items-center justify-between text-sm text-muted">
              <span>{count(b.slug)} товаров</span>
              <I.ArrowRight size={17} className="text-accent transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
