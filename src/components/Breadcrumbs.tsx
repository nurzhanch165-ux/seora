"use client";

import Link from "next/link";
import { useT } from "@/hooks/useTranslation";
import * as I from "./icons";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, light }: { items: Crumb[]; light?: boolean }) {
  const tr = useT();
  const muted = light ? "text-pearl/60" : "text-muted";
  const active = light ? "text-pearl" : "text-ink";
  const hover = light ? "hover:text-white" : "hover:text-accent";
  const faint = light ? "text-pearl/40" : "text-faint";

  return (
    <nav className={`flex flex-wrap items-center gap-1.5 text-xs ${muted}`}>
      <Link href="/" className={hover}>
        {tr("common.home")}
      </Link>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <I.ChevronRight size={13} className={faint} />
          {c.href ? (
            <Link href={c.href} className={hover}>
              {c.label}
            </Link>
          ) : (
            <span className={active}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
