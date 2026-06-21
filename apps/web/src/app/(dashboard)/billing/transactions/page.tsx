"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useWalletTransactions } from "@/hooks/use-billing";

type TxnType = "stake_added" | "stake_removed" | "job_payment" | "slashing" | "reward" | "deposit" | "withdraw";

const txnIcons: Record<string, React.ReactNode> = {
  job_payment: <ArrowUpRight className="h-4 w-4 text-indicator-stale" />,
  slashing: <ArrowUpRight className="h-4 w-4 text-indicator-slashed" />,
  reward: <ArrowDownLeft className="h-4 w-4 text-indicator-active" />,
  stake_added: <ArrowDownLeft className="h-4 w-4 text-indicator-active" />,
  stake_removed: <ArrowUpRight className="h-4 w-4 text-indicator-stale" />,
  deposit: <Wallet className="h-4 w-4 text-indicator-stale" />,
  withdraw: <ArrowDownLeft className="h-4 w-4 text-indicator-stale" />,
};

export default function TransactionsPage() {
  const { data: txns = [], isLoading } = useWalletTransactions();

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
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-bg-base/50 rounded animate-pulse" />
              ))}
            </div>
          ) : txns.length === 0 ? (
            <div className="py-12 text-center text-sm text-foreground-muted">
              No transactions yet
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {txns.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-bg-base/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      t.amount_usd > 0 ? "bg-indicator-active/10" : "bg-indicator-stale/10"
                    )}>
                      {txnIcons[t.type] ?? <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm text-foreground">
                        {t.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                      <div className="text-xs text-foreground-muted font-mono">
                        {new Date(t.created_at).toLocaleDateString()} · ID: {t.id.slice(0, 8)}…
                        {t.tx_hash && ` · ${t.tx_hash.slice(0, 10)}…`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn("font-mono-data font-semibold", t.amount_usd > 0 ? "text-indicator-active" : "text-foreground")}>
                      {t.amount_usd > 0 ? "+" : ""}{t.amount_usd.toFixed(4)} ETH
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
