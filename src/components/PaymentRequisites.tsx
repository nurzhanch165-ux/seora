"use client";

import { useState } from "react";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/format";
import { useT } from "@/hooks/useTranslation";
import * as I from "@/components/icons";

type PaymentRequisitesProps = {
  amount?: number;
  className?: string;
};

export function PaymentRequisites({ amount, className = "" }: PaymentRequisitesProps) {
  const tr = useT();
  const [copied, setCopied] = useState("");
  const { kazakhstan: kz, korea: kr } = site.payment;

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <div className="rounded-xl border border-line bg-paper p-4 text-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">
          {tr("payment.kzTitle")}
        </h3>
        <dl className="space-y-3">
          <Row
            label={tr("payment.phone")}
            value={`${kz.phone} · ${kz.phoneHolder}`}
            onCopy={() => copy(kz.phone, "kz-phone")}
            copied={copied === "kz-phone"}
            copyLabel={tr("common.copy")}
          />
          <Row
            label={tr("payment.cardNumber")}
            value={kz.cardNumber}
            onCopy={() => copy(kz.cardNumber, "kz-card")}
            copied={copied === "kz-card"}
            copyLabel={tr("common.copy")}
          />
          <Row label={tr("payment.recipient")} value={kz.cardHolder} />
        </dl>
      </div>

      <div className="rounded-xl border border-line bg-paper p-4 text-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">
          {tr("payment.krTitle")}
        </h3>
        <dl className="space-y-3">
          <Row label={tr("payment.bank")} value={kr.bank} />
          <Row label={tr("payment.recipient")} value={kr.recipient} />
          <Row
            label={tr("payment.accountNumber")}
            value={kr.accountNumber}
            onCopy={() => copy(kr.accountNumber, "kr-account")}
            copied={copied === "kr-account"}
            copyLabel={tr("common.copy")}
          />
        </dl>
      </div>

      {amount !== undefined && (
        <dl className="rounded-xl border border-line bg-paper p-4 text-sm">
          <Row
            label={tr("payment.amount")}
            value={formatPrice(amount)}
            onCopy={() => copy(String(amount), "amount")}
            copied={copied === "amount"}
            copyLabel={tr("common.copy")}
          />
        </dl>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  copied,
  copyLabel,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  copyLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted sm:text-sm sm:normal-case sm:tracking-normal">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2 sm:text-right">
        <span className="break-all text-sm font-medium text-ink sm:text-base">{value}</span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 text-faint hover:text-accent"
            aria-label={copyLabel}
          >
            {copied ? <I.Check size={15} className="text-success" /> : <I.Tag size={15} />}
          </button>
        )}
      </dd>
    </div>
  );
}
