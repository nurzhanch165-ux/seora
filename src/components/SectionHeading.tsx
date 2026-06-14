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
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="h-display text-2xl md:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group hidden shrink-0 items-center gap-1.5 text-sm text-ink/80 hover:text-accent sm:flex">
          {hrefLabel}
          <I.ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
