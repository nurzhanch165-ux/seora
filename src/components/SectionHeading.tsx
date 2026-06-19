import Link from "next/link";
import * as I from "./icons";

export function SectionHeading({
  eyebrow,
  title,
  href,
  hrefLabel = "Смотреть все",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="h-display text-2xl sm:text-3xl lg:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-accent"
        >
          {hrefLabel}
          <I.ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
