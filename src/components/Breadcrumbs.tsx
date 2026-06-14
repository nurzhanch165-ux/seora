import Link from "next/link";
import * as I from "./icons";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
      <Link href="/" className="hover:text-accent">Главная</Link>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <I.ChevronRight size={13} className="text-faint" />
          {c.href ? (
            <Link href={c.href} className="hover:text-accent">{c.label}</Link>
          ) : (
            <span className="text-ink">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
