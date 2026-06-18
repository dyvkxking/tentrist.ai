"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const INVOICE_DATA: Record<string, { period: string; date: string; amount: number; jobs: { id: string; type: string; cost: number; date: string }[] }> = {
  "inv_001": {
    period: "June 2024",
    date: "Jul 1, 2024",
    amount: 0.19,
    jobs: [
      { id: "job_8a3f2e1c", type: "LLM Fine-tuning", cost: 0.0234, date: "Jun 15" },
      { id: "job_7b2e4d5f", type: "Batch Rendering", cost: 0.0089, date: "Jun 12" },
      { id: "job_6c1a3e8b", type: "Batch Compute", cost: 0.0150, date: "Jun 8" },
    ],
  },
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const inv = INVOICE_DATA[id as string] ?? { period: "—", date: "—", amount: 0, jobs: [] };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <PageHeader
        title={`Invoice ${id}`}
        description={inv.period}
        breadcrumbs={[
          { label: "Billing", href: "/dashboard/billing" },
          { label: "Invoices", href: "/dashboard/billing/invoices" },
          { label: id as string },
        ]}
      />

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Detail</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Etherscan
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Invoice ID", value: id as string },
            { label: "Billing Period", value: inv.period },
            { label: "Issue Date", value: inv.date },
            { label: "Status", value: "Paid" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-hairline">
              <span className="text-foreground-muted">{label}</span>
              <span className="font-mono-data text-foreground">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {inv.jobs.map((j) => (
              <div key={j.id} className="flex justify-between py-2 border-b border-hairline/50 last:border-0">
                <div>
                  <div className="text-sm text-foreground">{j.type}</div>
                  <div className="text-xs text-foreground-muted font-mono">{j.id} · {j.date}</div>
                </div>
                <span className="font-mono-data text-foreground">{j.cost.toFixed(4)} ETH</span>
              </div>
            ))}
            <div className="flex justify-between pt-3">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-mono-data font-semibold text-indicator-active">{inv.amount.toFixed(4)} ETH</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Link href="/dashboard/billing/invoices">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </Link>
      </div>
    </div>
  );
}
