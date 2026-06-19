"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { useOrders } from "@/store/orders";
import { formatPrice, formatDate } from "@/lib/format";
import { getStatusLabel, statusTone } from "@/lib/types";
import { exportOrderExcel } from "@/lib/excel";
import { AccountShell } from "@/components/AccountShell";
import { PaymentUpload } from "@/components/PaymentUpload";
import { useT, useLocale } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

export default function AccountOrdersPage() {
  const account = useAuth((s) => s.current);
  const orders = useOrders((s) => s.orders);
  const loadMine = useOrders((s) => s.loadMine);
  const [openId, setOpenId] = useState<string | null>(null);
  const tr = useT();
  const locale = useLocale();

  useEffect(() => {
    if (account?.id) loadMine(account.id);
  }, [account?.id, loadMine]);

  const myOrders = orders;

  return (
    <AccountShell title={tr("account.myOrders")}>
      {myOrders.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <I.Box size={26} />
          </span>
          <p className="text-lg font-medium">{tr("account.noOrders")}</p>
          <p className="max-w-sm text-sm text-muted">{tr("account.noOrdersHint")}</p>
          <Link href="/c/cosmetics" className="btn-primary">{tr("common.goCatalog")}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => {
            const open = openId === order.id;
            return (
              <div key={order.id} className="card overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : order.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{order.number}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusTone(order.status)}`}>
                        {getStatusLabel(order.status, locale)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(order.createdAt)} · {tr("common.items", { count: order.items.length })} · {formatPrice(order.total)}
                    </p>
                  </div>
                  <I.ChevronDown size={20} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="border-t border-line p-5">
                    <div className="space-y-2.5">
                      {order.items.map((it) => (
                        <div key={it.productId} className="flex items-center justify-between gap-3 text-sm">
                          <Link href={`/product/${it.slug}`} className="text-ink hover:text-accent">
                            {it.name}
                          </Link>
                          <span className="shrink-0 text-muted">{it.qty} × {formatPrice(it.price)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm font-semibold text-ink">
                      <span>{tr("account.orderTotal")}</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>

                    {order.comment && (
                      <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-xs text-muted">
                        {tr("account.comment")}: {order.comment}
                      </p>
                    )}

                    <div className="mt-5">
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">{tr("account.payment")}</h4>
                      <PaymentUpload orderId={order.id} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => void exportOrderExcel(order)} className="btn-outline text-sm">
                        <I.Download size={16} /> {tr("account.excelOrder")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
