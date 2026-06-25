"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/auth";

/** Sync httpOnly customer session with Zustand after first paint. */
export function CustomerSessionLoader() {
  const hydrate = useAuth((s) => s.hydrateSession);
  const ready = useAuth((s) => s.ready);

  useEffect(() => {
    if (ready) return;

    const run = () => {
      void hydrate();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(run, 300);
    return () => window.clearTimeout(id);
  }, [hydrate, ready]);

  return null;
}
