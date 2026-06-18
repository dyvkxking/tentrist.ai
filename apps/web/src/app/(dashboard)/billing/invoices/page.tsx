"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const INVOICES = [
  { id: "inv_001", period: "June 2024", date: "Jul 1, 2024", amount: 0.19, status: "paid" as const, jobs: 14 },
  { id: "inv_002", period: "May 2024", date: "Jun 1, 2024", amount: 0.15, status: "paid" as const, jobs: 11 },
  { id: "inv_003", period: "April 2024", date: "May 1, 2024", amount: 0.22, status: "paid" as const, jobs: 18 },
  { id: "inv_004", period: "March 2024", date: "Apr 1, 2024", amount: 0.09, status: "paid" as const, jobs: 7 },
];

export default function InvoicesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader
        title="Invoices"
        description="Monthly invoices for your compute usage"
        breadcrumbs={[
          { label: "Billing", href: "/dashboard/billing" },
          { label: "Invoices" },
        ]}
      />

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {INVOICES.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-bg-base/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">{inv.period}</div>
                    <div className="text-xs text-foreground-muted mt-0.5">
                      {inv.date} · {inv.jobs} jobs
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono-data font-semibold text-foreground">{inv.amount.toFixed(4)} ETH</div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full",
                      inv.status === "paid" ? "bg-indicator-active/10 text-indicator-active" : "bg-indicator-stale/10 text-indicator-stale"
                    )}>
                      {inv.status}
                    </span>
                  </div>
                  <Link href={`/dashboard/billing/invoices/${inv.id}`}><Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button></Link>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
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
