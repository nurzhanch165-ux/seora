"use client";

import { SectionHeading } from "@/components/SectionHeading";
import { useT } from "@/hooks/useTranslation";

export function HomeSectionHeading({
  titleKey,
  href,
  hrefLabelKey,
}: {
  titleKey: string;
  href?: string;
  hrefLabelKey?: string;
}) {
  const tr = useT();
  return (
    <SectionHeading
      title={tr(titleKey)}
      href={href}
      hrefLabel={hrefLabelKey ? tr(hrefLabelKey) : undefined}
    />
  );
}
