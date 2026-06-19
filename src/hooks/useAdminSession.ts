"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/adminAuth";

/** Waits for a fresh /api/admin/me check before redirecting (avoids stale Zustand state). */
export function useAdminSession(mode: "requireAuth" | "redirectIfAuthed") {
  const router = useRouter();
  const check = useAdminAuth((s) => s.check);
  const loggedIn = useAdminAuth((s) => s.loggedIn);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    check().finally(() => {
      if (!cancelled) setChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [check]);

  useEffect(() => {
    if (!checked) return;
    if (mode === "requireAuth" && !loggedIn) router.replace("/login?next=/admin");
    if (mode === "redirectIfAuthed" && loggedIn) router.replace("/admin");
  }, [checked, loggedIn, mode, router]);

  return { checked, loggedIn };
}
