const DEFAULT_SITE_URL = "https://sonyshopkorea.com";

/** Canonical public site URL (no trailing slash). */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim()
    || process.env.VERCEL_URL?.trim()
    || DEFAULT_SITE_URL;
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

export function sitePath(path = ""): string {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
