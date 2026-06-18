"use client";

import * as React from "react";
import Link from "next/link";
import { Wallet, TrendingUp, ArrowUpRight, Plus, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/ui/MetricCard";

// Mock data
const BALANCE = { available: 1.2345, locked: 0.0500, total: 1.2845 };
const MONTHLY_SPEND = [
  { month: "Jan", amount: 0.12 },
  { month: "Feb", amount: 0.18 },
  { month: "Mar", amount: 0.09 },
  { month: "Apr", amount: 0.22 },
  { month: "May", amount: 0.15 },
  { month: "Jun", amount: 0.19 },
];
const MAX_SPEND = Math.max(...MONTHLY_SPEND.map((m) => m.amount));

function formatETH(v: number): string {
  return `${v.toFixed(4)} ETH`;
}

export default function BillingPage() {
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
              {formatETH(BALANCE.available)}
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
              {formatETH(BALANCE.locked)}
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
              {formatETH(MONTHLY_SPEND[MONTHLY_SPEND.length - 1].amount)}
            </div>
            <div className="text-xs text-foreground-muted mt-1">June 2024</div>
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
            {MONTHLY_SPEND.map((m) => {
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
                  <span className="text-xs font-mono text-foreground">{m.amount.toFixed(2)}</span>
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
          <div className="space-y-2">
            {[
              { id: "txn_001", type: "debit", desc: "Job #job_8a3f — LLM Fine-tuning", amount: -0.0234, date: "Jun 15, 2024" },
              { id: "txn_002", type: "credit", desc: "SLA Credit — Job #job_7b2e — uptime breach", amount: 0.0018, date: "Jun 14, 2024" },
              { id: "txn_003", type: "debit", desc: "Job #job_6c1d — Batch Rendering", amount: -0.0089, date: "Jun 12, 2024" },
              { id: "txn_004", type: "topup", desc: "Wallet Top-up", amount: 0.5000, date: "Jun 10, 2024" },
            ].map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-hairline/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", t.amount > 0 ? "bg-indicator-active/10" : "bg-indicator-stale/10")}>
                    <ArrowUpRight className={cn("h-4 w-4", t.amount > 0 ? "text-indicator-active" : "text-indicator-stale")} />
                  </div>
                  <div>
                    <div className="text-sm text-foreground">{t.desc}</div>
                    <div className="text-xs text-foreground-muted">{t.date}</div>
                  </div>
                </div>
                <span className={cn("font-mono-data text-sm font-medium", t.amount > 0 ? "text-indicator-active" : "text-foreground")}>
                  {t.amount > 0 ? "+" : ""}{t.amount.toFixed(4)} ETH
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
