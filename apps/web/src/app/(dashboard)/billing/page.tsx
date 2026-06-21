"use client";

import * as React from "react";
import Link from "next/link";
import { Wallet, TrendingUp, ArrowUpRight, Plus, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useBillingSummary, useWalletTransactions } from "@/hooks/use-billing";
function formatETH(v: number): string {
  return `${v.toFixed(4)} ETH`;
}

// Monthly spend chart from real transaction data
function useMonthlySpend() {
  const { data: txns = [] } = useWalletTransactions();
  return React.useMemo(() => {
    const months: { month: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en", { month: "short" });
      const spent = txns
        .filter((t) => {
          const created = new Date(t.created_at);
          return (
            t.type === "job_payment" &&
            created.getMonth() === d.getMonth() &&
            created.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum, t) => sum + Math.abs(t.amount_usd), 0);
      months.push({ month: key, amount: spent });
    }
    return months;
  }, [txns]);
}

export default function BillingPage() {
  const { availableBalance, lockedBalance, recentTransactions } = useBillingSummary();
  const monthlySpend = useMonthlySpend();
  const MAX_SPEND = Math.max(...monthlySpend.map((m) => m.amount), 0.01);

  const now = new Date();
  const currentMonth = now.toLocaleString("en", { month: "long", year: "numeric" });
  const mtdAmount = monthlySpend[monthlySpend.length - 1]?.amount ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <PageHeader
        title="Billing"
        description="Manage your prepaid balance and view spending"
        breadcrumbs={[{ label: "Billing" }]}
      />

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-bg-surface/80 border-indicator-active/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted uppercase tracking-wider">Available Balance</span>
              <Wallet className="h-4 w-4 text-indicator-active" />
            </div>
            <div className="text-2xl font-mono-data font-semibold text-indicator-active">
              {formatETH(availableBalance)}
            </div>
            <div className="text-xs text-foreground-muted mt-1">Prepaid compute credit</div>
          </CardContent>
        </Card>

        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted uppercase tracking-wider">Locked (Escrow)</span>
              <CreditCard className="h-4 w-4 text-indicator-stale" />
            </div>
            <div className="text-2xl font-mono-data font-semibold">
              {formatETH(lockedBalance)}
            </div>
            <div className="text-xs text-foreground-muted mt-1">Active job deposits</div>
          </CardContent>
        </Card>

        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted uppercase tracking-wider">Total Spent (MTD)</span>
              <TrendingUp className="h-4 w-4 text-foreground-muted" />
            </div>
            <div className="text-2xl font-mono-data font-semibold">
              {formatETH(mtdAmount)}
            </div>
            <div className="text-xs text-foreground-muted mt-1">{currentMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard/billing/topup">
          <Button className="bg-indicator-active text-bg-base hover:bg-indicator-active/90"><Plus className="h-4 w-4 mr-2" />Add Funds</Button>
        </Link>
        <Link href="/dashboard/billing/transactions">
          <Button variant="outline">Transaction History</Button>
        </Link>
      </div>

      {/* Monthly Spend Chart */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Monthly Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {monthlySpend.map((m) => {
              const pct = (m.amount / MAX_SPEND) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-28">
                    <div
                      className="w-full bg-indicator-active/20 border border-indicator-active/30 rounded-t-sm transition-all hover:bg-indicator-active/30"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground-muted">{m.month}</span>
                  <span className="text-xs font-mono text-foreground">{m.amount.toFixed(4)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link href="/dashboard/billing/transactions">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-foreground-muted">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-hairline/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", t.amount_usd > 0 ? "bg-indicator-active/10" : "bg-indicator-stale/10")}>
                      <ArrowUpRight className={cn("h-4 w-4", t.amount_usd > 0 ? "text-indicator-active" : "text-indicator-stale")} />
                    </div>
                    <div>
                      <div className="text-sm text-foreground">{t.type.replace(/_/g, " ")}</div>
                      <div className="text-xs text-foreground-muted">{new Date(t.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={cn("font-mono-data text-sm font-medium", t.amount_usd > 0 ? "text-indicator-active" : "text-foreground")}>
                    {t.amount_usd > 0 ? "+" : ""}{t.amount_usd.toFixed(4)} ETH
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
