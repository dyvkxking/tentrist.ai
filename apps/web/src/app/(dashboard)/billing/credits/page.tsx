"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useSLACredits } from "@/hooks/use-billing";

export default function CreditsPage() {
  const { data: credits = [], isLoading } = useSLACredits();

  const totalCredits = credits.reduce((sum, c) => sum + c.credit_amount_eth, 0);

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
            <div className="text-2xl font-mono-data font-semibold">{credits.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Credit History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-bg-base/50 rounded animate-pulse" />
              ))}
            </div>
          ) : credits.length === 0 ? (
            <div className="py-12 text-center text-sm text-foreground-muted">
              No SLA credits issued yet
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {credits.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indicator-active/10 flex items-center justify-center mt-0.5 shrink-0">
                        <ArrowUpRight className="h-4 w-4 text-indicator-active" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {c.breach_type.charAt(0).toUpperCase() + c.breach_type.slice(1)} Breach
                        </div>
                        <div className="text-xs text-foreground-muted mt-0.5">
                          Job <code className="font-mono">{c.job_id.slice(0, 12)}…</code> ·{" "}
                          {new Date(c.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-foreground-muted">
                          <span>
                            Breach: <strong className="text-foreground">{c.breach_type}</strong>
                          </span>
                          <span>
                            Required: <strong className="font-mono text-foreground">{c.required_value}%</strong>
                          </span>
                          <span>
                            Actual: <strong className="font-mono text-indicator-slashed">{c.actual_value}%</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono-data font-semibold text-indicator-active">
                        +{c.credit_amount_eth.toFixed(4)} ETH
                      </div>
                      <div className="text-xs text-foreground-muted">SLA credit</div>
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
