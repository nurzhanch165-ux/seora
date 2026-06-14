import { IconKey } from "@/data/categories";
import { Tone } from "@/data/products";
import { Glyph } from "./Glyph";

const tones: Record<Tone, { from: string; to: string; ink: string }> = {
  rose: { from: "#F6E2DD", to: "#EBC7BE", ink: "#9B5B4E" },
  sand: { from: "#F1E8D8", to: "#E2D2B6", ink: "#8A7445" },
  sage: { from: "#E2EADD", to: "#C7D7BE", ink: "#5C7351" },
  clay: { from: "#F0DECF", to: "#DCC0A6", ink: "#8A5A38" },
  sky: { from: "#DEE8EE", to: "#C2D5E0", ink: "#46697C" },
  plum: { from: "#EADFE6", to: "#D2BCCB", ink: "#76506A" },
  amber: { from: "#F6E8CF", to: "#ECCF9E", ink: "#9A6A2C" },
  mist: { from: "#E6E7E2", to: "#CFD2CB", ink: "#5E6258" },
};

export function ProductVisual({
  tone,
  glyph,
  brand,
  image,
  className = "",
  glyphSize = 56,
}: {
  tone: Tone;
  glyph: IconKey;
  brand?: string;
  image?: string;
  className?: string;
  glyphSize?: number;
}) {
  const t = tones[tone];

  if (image) {
    return (
      <div className={`relative overflow-hidden bg-paper ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={brand ?? "Товар"} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(140deg, ${t.from}, ${t.to})` }}
    >
      {/* subtle decorative arcs */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.35]"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <circle cx="160" cy="40" r="70" fill="none" stroke={t.ink} strokeWidth="0.6" opacity="0.5" />
        <circle cx="40" cy="170" r="90" fill="none" stroke={t.ink} strokeWidth="0.6" opacity="0.4" />
      </svg>
      <div className="relative flex flex-col items-center gap-3" style={{ color: t.ink }}>
        <Glyph name={glyph} size={glyphSize} strokeWidth={1.1} />
        {brand && (
          <span className="text-[10px] font-medium uppercase tracking-widest2" style={{ color: t.ink }}>
            {brand}
          </span>
        )}
      </div>
    </div>
  );
}
