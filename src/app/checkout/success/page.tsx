"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useOrders } from "@/store/orders";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";
import { exportOrderExcel } from "@/lib/excel";
import { PaymentUpload } from "@/components/PaymentUpload";
import { useT, useSiteText } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

function SuccessInner() {
  const params = useSearchParams();
  const number = params.get("n") ?? "";
  const hydrated = useHydrated();
  const order = useOrders((s) => s.orders.find((o) => o.number === number));
  const [copied, setCopied] = useState("");
  const tr = useT();
  const trSite = useSiteText();

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  if (!hydrated) return <div className="container-site py-20 text-center text-muted">{tr("common.loading")}</div>;

  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <I.Check size={32} />
          </span>
          <h1 className="mt-5 h-display text-3xl md:text-4xl">{tr("checkout.success.title")}</h1>
          <p className="mt-3 text-muted">
            {number ? tr("checkout.success.orderNumber", { number }) : tr("checkout.success.created")}{" "}
            {tr("checkout.success.excelDownloaded")}
          </p>
        </div>

        {order && (
          <>
            <div className="card mt-8 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{tr("checkout.success.paymentTitle")}</h2>
                <span className="text-lg font-semibold text-accent">{formatPrice(order.total)}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{tr("checkout.success.paymentHint")}</p>

              <dl className="mt-5 space-y-2 rounded-xl border border-line bg-paper p-4 text-sm">
                <Req label={tr("payment.bank")} value={site.payment.bank} />
                <Req label={tr("payment.cardNumber")} value={site.payment.cardNumber} onCopy={() => copy(site.payment.cardNumber, "card")} copied={copied === "card"} copyLabel={tr("common.copy")} />
                <Req label={tr("payment.recipient")} value={site.payment.cardHolder} />
                <Req label={tr("payment.amount")} value={formatPrice(order.total)} onCopy={() => copy(String(order.total), "sum")} copied={copied === "sum"} copyLabel={tr("common.copy")} />
              </dl>

              <div className="mt-5">
                <PaymentUpload orderId={order.id} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => void exportOrderExcel(order)} className="btn-outline">
                <I.Download size={18} /> {tr("checkout.success.downloadExcel")}
              </button>
              <Link href="/account" className="btn-primary">
                {tr("checkout.success.goAccount")}
                <I.ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-muted">{trSite("shippingNote")}</p>
      </div>
    </div>
  );
}

function Req({ label, value, onCopy, copied, copyLabel }: { label: string; value: string; onCopy?: () => void; copied?: boolean; copyLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="flex items-center gap-2 font-medium text-ink">
        {value}
        {onCopy && (
          <button onClick={onCopy} className="text-faint hover:text-accent" aria-label={copyLabel}>
            {copied ? <I.Check size={15} className="text-success" /> : <I.Tag size={15} />}
          </button>
        )}
      </dd>
    </div>
  );
}

export default function SuccessPage() {
  const tr = useT();
  return (
    <Suspense fallback={<div className="container-site py-20 text-center text-muted">{tr("common.loading")}</div>}>
      <SuccessInner />
    </Suspense>
  );
}
