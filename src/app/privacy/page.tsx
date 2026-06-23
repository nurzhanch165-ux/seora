"use client";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useT } from "@/hooks/useTranslation";

export default function PrivacyPage() {
  const tr = useT();
  const sections = ["privacy.s1", "privacy.s2", "privacy.s3", "privacy.s4"] as const;

  return (
    <div className="container-site py-8">
      <Breadcrumbs items={[{ label: tr("privacy.title") }]} />
      <h1 className="mt-6 h-display text-3xl md:text-4xl">{tr("privacy.title")}</h1>
      <p className="mt-4 max-w-3xl text-muted">{tr("privacy.intro")}</p>
      <div className="prose prose-sm mt-10 max-w-3xl space-y-6 text-sm leading-relaxed text-muted">
        {sections.map((key) => (
          <p key={key}>{tr(key)}</p>
        ))}
      </div>
    </div>
  );
}
