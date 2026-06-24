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
import { PaymentRequisites } from "@/components/PaymentRequisites";
import { NotificationSettings } from "@/components/NotificationSettings";
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
    if (account?.id) loadMine();
  }, [account?.id, loadMine]);

  const myOrders = orders;

  return (
    <AccountShell title={tr("account.myOrders")}>
      {myOrders.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-16 text-center sm:py-20">
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
                  type="button"
                  onClick={() => setOpenId(open ? null : order.id)}
                  className="flex w-full min-w-0 items-start justify-between gap-3 p-4 text-left sm:items-center sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                      <span className="break-all font-medium text-ink">{order.number}</span>
                      <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusTone(order.status)}`}>
                        {getStatusLabel(order.status, locale)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      {formatDate(order.createdAt)} · {tr("common.items", { count: order.items.length })} · {formatPrice(order.total)}
                    </p>
                  </div>
                  <I.ChevronDown size={20} className={`mt-0.5 shrink-0 text-muted transition-transform sm:mt-0 ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="border-t border-line p-4 sm:p-5">
                    <div className="space-y-2.5">
                      {order.items.map((it) => (
                        <div key={it.productId} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <Link href={`/product/${it.slug}`} className="min-w-0 break-words text-ink hover:text-accent">
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
                      <p className="mt-3 break-words rounded-lg bg-paper px-3 py-2 text-xs text-muted">
                        {tr("account.comment")}: {order.comment}
                      </p>
                    )}

                    <div className="mt-5">
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">{tr("payment.requisitesTitle")}</h4>
                      <PaymentRequisites amount={order.total} />
                    </div>

                    <div className="mt-5">
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink">{tr("account.payment")}</h4>
                      <PaymentUpload orderId={order.id} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => void exportOrderExcel(order)} className="btn-outline w-full text-sm sm:w-auto">
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

      <div className="mt-8">
        <NotificationSettings />
      </div>
    </AccountShell>
  );
}
