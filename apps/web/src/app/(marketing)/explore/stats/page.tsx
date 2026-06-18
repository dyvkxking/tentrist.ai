"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/shared/page-header";

export default function StatsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <PageHeader title="Protocol Stats" description="Aggregate statistics for the Tentrist DePIN GPU network" />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Jobs (all time)" value="48,291" trend="up" trendValue="+12%" glowColor="active" />
        <MetricCard label="Total Slashed" value="124.5 ETH" />
        <MetricCard label="Total Credits Issued" value="87.2 ETH" />
        <MetricCard label="Avg Node Uptime" value="98.7%" trend="up" trendValue="+0.3%" />
        <MetricCard label="Active Nodes" value="1,284" trend="up" trendValue="+47" />
        <MetricCard label="Total Staked" value="12,840 ETH" trend="up" trendValue="+3.2%" glowColor="active" />
        <MetricCard label="Gold Tier Nodes" value="142" />
        <MetricCard label="Jobs in Flight" value="342" trend="up" trendValue="+12%" />
        <MetricCard label="Avg Reputation" value="67.4" />
      </div>

      <Card className="bg-bg-surface/80">
        <CardHeader><CardTitle>Network Health</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Online Nodes", value: "1,180 / 1,284", pct: 92, color: "indicator-active" },
            { label: "Stale Nodes", value: "87 / 1,284", pct: 7, color: "indicator-stale" },
            { label: "Offline Nodes", value: "17 / 1,284", pct: 1, color: "foreground-muted" },
          ].map(({ label, value, pct, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-32 text-sm text-foreground-muted">{label}</div>
              <div className="flex-1 h-2 bg-bg-base rounded-full overflow-hidden">
                <div className={`h-full bg-${color} rounded-full`} style={{ width: `${pct}%` }} />
              </div>
              <div className="w-36 text-sm font-mono text-foreground text-right">{value}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
