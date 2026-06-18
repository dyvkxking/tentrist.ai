"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const CREDITS = [
  { id: "cr_001", jobId: "job_8a3f2e1c", jobType: "LLM Fine-tuning", breachType: "Uptime", required: 99.0, actual: 97.2, creditAmount: 0.00234, date: "Jun 15, 2024" },
  { id: "cr_002", jobId: "job_7b2e4d5f", jobType: "Batch Rendering", breachType: "Throughput", required: 250, actual: 198, creditAmount: 0.00187, date: "Jun 10, 2024" },
  { id: "cr_003", jobId: "job_6c1a3e8b", jobType: "LLM Fine-tuning", breachType: "Uptime", required: 99.5, actual: 98.1, creditAmount: 0.00092, date: "Jun 3, 2024" },
  { id: "cr_004", jobId: "job_5d0b2c7a", jobType: "Batch Compute", breachType: "Uptime", required: 95.0, actual: 90.3, creditAmount: 0.00045, date: "May 28, 2024" },
];

export default function CreditsPage() {
  const totalCredits = CREDITS.reduce((sum, c) => sum + c.creditAmount, 0);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader
        title="SLA Credits"
        description="Automatic credits issued when jobs fail to meet SLA benchmarks"
        breadcrumbs={[
          { label: "Billing", href: "/dashboard/billing" },
          { label: "SLA Credits" },
        ]}
      />

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-bg-surface/80 border-indicator-active/30">
          <CardContent className="p-4">
            <div className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Total Credits Issued</div>
            <div className="text-2xl font-mono-data font-semibold text-indicator-active">
              {totalCredits.toFixed(4)} ETH
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Breach Events</div>
            <div className="text-2xl font-mono-data font-semibold">{CREDITS.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Credit History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {CREDITS.map((c) => (
              <div key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indicator-active/10 flex items-center justify-center mt-0.5 shrink-0">
                      <ArrowUpRight className="h-4 w-4 text-indicator-active" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{c.jobType}</div>
                      <div className="text-xs text-foreground-muted mt-0.5">
                        Job <code className="font-mono">{c.jobId.slice(0, 12)}…</code> · {c.date}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-foreground-muted">
                        <span>Breach: <strong className="text-foreground">{c.breachType}</strong></span>
                        <span>Required: <strong className="font-mono text-foreground">{c.required}%</strong></span>
                        <span>Actual: <strong className="font-mono text-indicator-slashed">{c.actual}%</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono-data font-semibold text-indicator-active">
                      +{c.creditAmount.toFixed(4)} ETH
                    </div>
                    <div className="text-xs text-foreground-muted">SLA credit</div>
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
