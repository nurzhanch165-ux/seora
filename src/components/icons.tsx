import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

function Base({ size = 24, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---------- UI ---------- */
export const Search = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Base>
);

export const Bag = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 8h12l-1 11.5a1.5 1.5 0 0 1-1.5 1.3h-9A1.5 1.5 0 0 1 4 19.5L3 8h3Z" transform="translate(1.5 0)" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Base>
);

export const Heart = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20.3 4.2 12.5a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l1.3 1.3 1.3-1.3a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5L12 20.3Z" />
  </Base>
);

export const HeartFilled = (p: IconProps) => (
  <Base {...p} fill="currentColor">
    <path d="M12 20.3 4.2 12.5a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l1.3 1.3 1.3-1.3a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5L12 20.3Z" />
  </Base>
);

export const User = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
  </Base>
);

export const Menu = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const Close = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const ChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

export const ChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);

export const ChevronLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="m15 6-6 6 6 6" />
  </Base>
);

export const ChevronUp = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 15 6-6 6 6" />
  </Base>
);

export const Home = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9V20.5H5.5A1.5 1.5 0 0 1 4 19v-8.5Z" />
  </Base>
);

export const Grid = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
  </Base>
);

export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h15m0 0-6-6m6 6-6 6" />
  </Base>
);

export const ArrowUpRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 17 17 7m0 0H8m9 0v9" />
  </Base>
);

export const Plus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const Minus = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" />
  </Base>
);

export const Edit = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h4l10-10a2 2 0 0 0-2.8-2.8L5 17v3Z" />
    <path d="m13.5 6.5 4 4" />
  </Base>
);

export const Trash = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m2 0-.7 12a1.5 1.5 0 0 1-1.5 1.4H8.2A1.5 1.5 0 0 1 6.7 19L6 7" />
  </Base>
);

export const Download = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" />
  </Base>
);

export const Upload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 16V5m0 0 4 4m-4-4-4 4M5 20h14" />
  </Base>
);

export const Check = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Base>
);

export const Star = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 4 2.3 4.8 5.2.7-3.8 3.6.9 5.1L12 16l-4.6 2.2.9-5.1L4.5 9.5l5.2-.7L12 4Z" />
  </Base>
);

export const StarFilled = (p: IconProps) => (
  <Base {...p} fill="currentColor">
    <path d="m12 4 2.3 4.8 5.2.7-3.8 3.6.9 5.1L12 16l-4.6 2.2.9-5.1L4.5 9.5l5.2-.7L12 4Z" />
  </Base>
);

export const Filter = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Base>
);

export const Globe = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M4 12h16M12 4c2.5 2.2 2.5 13.8 0 16M12 4c-2.5 2.2-2.5 13.8 0 16" />
  </Base>
);

export const Info = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 11v5M12 8h.01" />
  </Base>
);

export const Clock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l3 2" />
  </Base>
);

export const Tag = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 11.5V5a1 1 0 0 1 1-1h6.5a2 2 0 0 1 1.4.6l6 6a2 2 0 0 1 0 2.8l-5.5 5.5a2 2 0 0 1-2.8 0l-6-6A2 2 0 0 1 4 11.5Z" />
    <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
  </Base>
);

export const Box = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
    <path d="m4 7 8 4 8-4M12 11v10" />
  </Base>
);

export const Sparkle = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3c.6 4 2 5.4 6 6-4 .6-5.4 2-6 6-.6-4-2-5.4-6-6 4-.6 5.4-2 6-6Z" />
    <path d="M18.5 13.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5Z" />
  </Base>
);

export const Shield = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 7.4 7 8.5 4.1-1.1 7-4.2 7-8.5V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);

export const Truck = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17.5" cy="18" r="1.6" />
  </Base>
);

/* ---------- Category glyphs (hand-drawn line icons) ---------- */
export const Droplet = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5c3 3.6 5.5 6.6 5.5 9.8A5.5 5.5 0 0 1 12 19a5.5 5.5 0 0 1-5.5-5.7C6.5 10.1 9 7.1 12 3.5Z" />
    <path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.3" />
  </Base>
);

export const Jar = (p: IconProps) => (
  <Base {...p}>
    <rect x="6" y="8" width="12" height="11" rx="2.5" />
    <path d="M8.5 8V6.5A1.5 1.5 0 0 1 10 5h4a1.5 1.5 0 0 1 1.5 1.5V8M9 12h6" />
  </Base>
);

export const Mask = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 6h14v6a7 7 0 0 1-14 0V6Z" />
    <path d="M9.5 10.5h.01M14.5 10.5h.01M10 14c1.2.9 2.8.9 4 0" />
  </Base>
);

export const Cleanser = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 3h4v2.5l1.5 1.5V20a1 1 0 0 1-1 1H8.5a1 1 0 0 1-1-1V7L9 5.5V3Z" />
    <path d="M7.5 11h7" />
  </Base>
);

export const Lipstick = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 11h6v8a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-8Z" />
    <path d="M10 11V6.2a1 1 0 0 1 .6-.9l2.2-1a1 1 0 0 1 1.4.9V11" />
  </Base>
);

export const Device = (p: IconProps) => (
  <Base {...p}>
    <rect x="8" y="3" width="8" height="13" rx="4" />
    <path d="M12 16v3M9 21h6" />
    <path d="M10.5 7.5h3" />
  </Base>
);

export const Leaf = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 4C9 4 4 9.5 4 16c0 1.4.3 2.8.9 4C12 21 20 15 20 4Z" />
    <path d="M5 19C8 13 12 9.5 17 8" />
  </Base>
);

export const Pill = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 12)" />
    <path d="M9.2 9.2 14.8 14.8" />
  </Base>
);

export const Eye = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.5" />
  </Base>
);

export const Scale = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 12 9 8.5" />
    <path d="M12 3.5v1.5M3.5 12H5M19 12h1.5" />
  </Base>
);

export const Tea = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 9h11v4a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V9Z" />
    <path d="M16 10h2a2 2 0 0 1 0 5h-2" />
    <path d="M8 3c-.6.8-.6 1.6 0 2.4M11 3c-.6.8-.6 1.6 0 2.4" />
  </Base>
);

export const HealthHeart = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20.3 4.2 12.5a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l1.3 1.3 1.3-1.3a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5L12 20.3Z" />
    <path d="M6 10.5h3L10.3 8l1.8 4 1.3-2.2h2.8" />
  </Base>
);

export const Bone = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 17a2.2 2.2 0 1 1-2-2 2.2 2.2 0 0 1 2-2l6-6a2.2 2.2 0 1 1 2-2 2.2 2.2 0 0 1 2 2 2.2 2.2 0 1 1 2 2 2.2 2.2 0 0 1-2 2l-6 6a2.2 2.2 0 1 1-2 2 2.2 2.2 0 0 1-2-2Z" />
  </Base>
);

export const Stomach = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 4v4a4 4 0 0 0 4 4 4 4 0 0 1 4 4 4 4 0 0 1-4 4H9a5 5 0 0 1-5-5" />
    <path d="M9 4H7M17 16h2" />
  </Base>
);

export const Man = (p: IconProps) => (
  <Base {...p}>
    <circle cx="10" cy="14" r="5" />
    <path d="m14 10 5-5m0 0h-3.5M19 5v3.5" />
  </Base>
);

export const Woman = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="9" r="5" />
    <path d="M12 14v6m-2.5-3h5" />
  </Base>
);

/* ---------- Social / contact ---------- */
export const Whatsapp = (p: IconProps) => (
  <Base {...p} strokeWidth={1.6}>
    <path d="M12 3a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.9-1.1A8.5 8.5 0 1 0 12 3Z" />
    <path d="M9.8 9.4c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.4-.2.3-.8.8-.8 1.9 0 1.1.8 2.2.9 2.3.1.2 1.6 2.5 3.9 3.4 1.9.8 2.3.6 2.7.6.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.4-.2-.7-.3-.3-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1-1.3-1.1-1.5-.1-.2 0-.3.1-.5l.3-.3c.1-.1.1-.2.2-.3 0-.1 0-.2-.1-.4-.1-.1-.4-1-.6-1.4-.2-.3-.3-.3-.5-.3h-.4c-.2 0-.4.1-.6.3-.2.2-.7.7-.7 1.6 0 .9.7 1.8.8 1.9.1.1 1.3 2 3.2 2.7.5.2 1 .3 1.3.4.6.2 1.1.2 1.5.1.5-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.1-.3-.2-.5-.3Z" />
  </Base>
);

export const Telegram = (p: IconProps) => (
  <Base {...p}>
    <path d="M20.5 4.8 3.6 11.3c-.8.3-.7 1.4.1 1.6l4.3 1.2 1.5 4.6c.2.6 1 .7 1.4.2l2.2-2.4 4.2 3.1c.5.4 1.2.1 1.4-.5l3-13.2c.1-.8-.6-1.4-1.6-1.1Z" />
    <path d="m8 13.4 8.5-5.2-6.6 6.6" />
  </Base>
);

export const Instagram = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M16.8 7.2h.01" />
  </Base>
);

export const TikTok = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 4c.3 2.3 1.7 3.8 4 4v2.6c-1.5 0-2.9-.5-4-1.3V15a5 5 0 1 1-5-5c.35 0 .7.04 1 .1v2.7A2.3 2.3 0 1 0 11.5 15V4H14Z" />
  </Base>
);

export const YouTube = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="6" width="18" height="12" rx="3.5" />
    <path d="m10.5 9.3 4.2 2.7-4.2 2.7V9.3Z" fill="currentColor" stroke="none" />
  </Base>
);

export const Mail = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="m4.5 7 7.5 5.5L19.5 7" />
  </Base>
);

export const Phone = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A15 15 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
  </Base>
);

export const Pin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Base>
);
