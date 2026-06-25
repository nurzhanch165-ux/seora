"use client";

import { useEffect } from "react";
import { useAdminAuth } from "@/store/adminAuth";

/** Single deferred admin session check for the whole app. */
export function AdminAuthLoader() {
  const check = useAdminAuth((s) => s.check);
  const ready = useAdminAuth((s) => s.ready);

  useEffect(() => {
    if (ready) return;

    const run = () => {
      void check();
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(run, 600);
    return () => window.clearTimeout(id);
  }, [check, ready]);

  return null;
}
