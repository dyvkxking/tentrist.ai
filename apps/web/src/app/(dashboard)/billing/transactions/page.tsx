"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

type TxnType = "debit" | "credit" | "topup" | "withdraw";

interface Transaction {
  id: string;
  type: TxnType;
  description: string;
  amount: number;
  balance: number;
  date: string;
  txHash?: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: "txn_010", type: "topup", description: "Wallet Top-up", amount: 0.5000, balance: 1.2345, date: "Jun 10, 2024" },
  { id: "txn_009", type: "debit", description: "Job #job_8a3f — LLM Fine-tuning", amount: -0.0234, balance: 0.7345, date: "Jun 15, 2024" },
  { id: "txn_008", type: "credit", description: "SLA Credit — Job #job_7b2e", amount: 0.0018, balance: 0.7579, date: "Jun 14, 2024" },
  { id: "txn_007", type: "debit", description: "Job #job_6c1d — Batch Rendering", amount: -0.0089, balance: 0.7561, date: "Jun 12, 2024" },
  { id: "txn_006", type: "debit", description: "Job #job_5d0b — Batch Compute", amount: -0.0120, balance: 0.7650, date: "Jun 8, 2024" },
  { id: "txn_005", type: "topup", description: "Wallet Top-up", amount: 1.0000, balance: 0.7770, date: "Jun 5, 2024" },
  { id: "txn_004", type: "debit", description: "Job #job_4e9c — LLM Fine-tuning", amount: -0.0440, balance: -0.2230, date: "Jun 1, 2024" },
  { id: "txn_003", type: "topup", description: "Wallet Top-up", amount: 0.5000, balance: -0.1790, date: "May 28, 2024" },
  { id: "txn_002", type: "credit", description: "SLA Credit — Job #job_3f8a", amount: 0.0031, balance: -0.6790, date: "May 25, 2024" },
  { id: "txn_001", type: "debit", description: "Job #job_2d7b — Batch Rendering", amount: -0.0310, balance: -0.6821, date: "May 20, 2024" },
];

const txnIcons: Record<TxnType, React.ReactNode> = {
  debit: <ArrowUpRight className="h-4 w-4 text-indicator-stale" />,
  credit: <ArrowDownLeft className="h-4 w-4 text-indicator-active" />,
  topup: <Wallet className="h-4 w-4 text-indicator-stale" />,
  withdraw: <ArrowDownLeft className="h-4 w-4 text-indicator-stale" />,
};

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader
        title="Transaction History"
        description="Complete record of all billing transactions"
        breadcrumbs={[
          { label: "Billing", href: "/dashboard/billing" },
          { label: "Transactions" },
        ]}
      />

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {TRANSACTIONS.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 hover:bg-bg-base/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    t.amount > 0 ? "bg-indicator-active/10" : "bg-indicator-stale/10"
                  )}>
                    {txnIcons[t.type]}
                  </div>
                  <div>
                    <div className="text-sm text-foreground">{t.description}</div>
                    <div className="text-xs text-foreground-muted font-mono">{t.date} · ID: {t.id}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={cn("font-mono-data font-semibold", t.amount > 0 ? "text-indicator-active" : "text-foreground")}>
                    {t.amount > 0 ? "+" : ""}{t.amount.toFixed(4)} ETH
                  </div>
                  <div className="text-xs text-foreground-muted font-mono">
                    bal: {t.balance.toFixed(4)} ETH
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Link href="/dashboard/billing">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Billing
          </Button>
        </Link>
      </div>
    </div>
  );
}
