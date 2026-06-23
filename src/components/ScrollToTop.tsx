"use client";

import { useEffect, useState } from "react";
import { useT } from "@/hooks/useTranslation";
import * as I from "./icons";

export function ScrollToTop() {
  const tr = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={tr("common.scrollToTop")}
      className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-lift transition-transform hover:border-accent hover:text-accent active:scale-95 md:bottom-6 md:right-6 md:h-12 md:w-12"
    >
      <I.ChevronUp size={22} />
    </button>
  );
}
