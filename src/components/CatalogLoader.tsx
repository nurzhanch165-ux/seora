"use client";

import { useEffect } from "react";
import { useCatalog } from "@/store/catalog";

/** Load catalog once per session via cached API (shared across all pages). */
export function CatalogLoader() {
  const load = useCatalog((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  return null;
}
