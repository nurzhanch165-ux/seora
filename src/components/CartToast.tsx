"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartToast } from "@/store/cartToast";
import { usePreferences } from "@/store/preferences";
import { t } from "@/lib/i18n";
import * as I from "./icons";

export function CartToast() {
  const visible = useCartToast((s) => s.visible);
  const productName = useCartToast((s) => s.productName);
  const hide = useCartToast((s) => s.hide);
  const locale = usePreferences((s) => s.locale);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(hide, 5000);
    return () => clearTimeout(t);
  }, [visible, hide]);

  if (!visible) return null;

  return (
    <div className="animate-fadeUp fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-card border border-line bg-surface p-4 shadow-lift">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <I.Check size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{t("cart.added", locale)}</p>
          {productName && <p className="truncate text-xs text-muted">{productName}</p>}
        </div>
        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
          <Link href="/cart" onClick={hide} className="btn-primary px-4 py-2 text-xs">
            {t("cart.go", locale)}
          </Link>
          <button onClick={hide} className="btn-ghost px-3 py-2 text-xs">
            {t("cart.continue", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}
