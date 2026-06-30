"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCatalog } from "@/store/catalog";

/** Static pages that don't need the product catalog. */
const SKIP_PATHS = new Set(["/about", "/contacts", "/privacy", "/login", "/register", "/delivery", "/admin"]);

/** Load catalog once per session — deferred until browser idle. */
export function CatalogLoader() {
  const pathname = usePathname();
  const load = useCatalog((s) => s.load);

  useEffect(() => {
    if (SKIP_PATHS.has(pathname)) return;

    const run = () => void load();
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(run, 80);
    return () => clearTimeout(timer);
  }, [load, pathname]);

  return null;
}
