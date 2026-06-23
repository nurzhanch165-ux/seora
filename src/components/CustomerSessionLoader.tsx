"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/auth";

/** Sync httpOnly customer session with Zustand on mount */
export function CustomerSessionLoader() {
  const hydrate = useAuth((s) => s.hydrateSession);
  const ready = useAuth((s) => s.ready);

  useEffect(() => {
    if (!ready) hydrate();
  }, [hydrate, ready]);

  return null;
}
