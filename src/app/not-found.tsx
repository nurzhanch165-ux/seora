"use client";

import Link from "next/link";
import { useT } from "@/hooks/useTranslation";

export default function NotFound() {
  const tr = useT();

  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="font-serif text-7xl font-light text-accent">404</span>
      <h1 className="mt-4 h-display text-2xl">{tr("errors.notFound")}</h1>
      <p className="mt-2 max-w-sm text-muted">{tr("errors.notFoundHint")}</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">{tr("common.goHome")}</Link>
        <Link href="/c/cosmetics" className="btn-outline">{tr("common.toCatalog")}</Link>
      </div>
    </div>
  );
}
