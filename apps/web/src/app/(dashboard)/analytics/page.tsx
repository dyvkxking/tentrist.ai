"use client";

import React, { useMemo } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Server,
  Zap,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart,
  AreaChart,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/badge";
import {
  UptimeLineChart,
  JobVolumeBarChart,
  ValueWorkflowAreaChart,
  Sparkline,
} from "@/components/charts";
import {
  useUptimeData,
  useJobVolumeData,
  useValueFlowData,
  useNodeAnalytics,
  useAnalyticsOverview,
} from "@/hooks/use-analytics";

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function MetricWithSparkline({
  label, value, trend, trendValue, data, color,
}: {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  data: number[];
  color?: string;
}) {
  return (
    <Card className="bg-bg-surface/80 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs text-foreground-muted uppercase tracking-wider">{label}</span>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-xs",
                trend === "up" && "text-indicator-active",
                trend === "down" && "text-indicator-slashed",
                trend === "neutral" && "text-foreground-muted"
              )}
            >
              {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
              {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
              <span className="font-mono-data">{trendValue}</span>
            </div>
          )}
        </div>
        <div className="text-2xl font-mono-data text-foreground mb-3">{value}</div>
        <Sparkline data={data} color={color} height={40} />
      </CardContent>
    </Card>
  );
}

function SLAComplianceGauge({ value, target }: { value: number; target: number }) {
  const percentage = Math.min((value / target) * 100, 100);
  const isCompliant = value >= target;

  return (
    <Card className="bg-bg-surface/80">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-foreground-muted uppercase tracking-wider">SLA Compliance</span>
          <Badge variant={isCompliant ? "success" : "danger"} className="font-mono-data text-xs">
            {isCompliant ? "Compliant" : "At Risk"}
          </Badge>
        </div>
        <div className="text-3xl font-mono-data text-foreground mb-3">
          {value.toFixed(1)}<span className="text-lg text-foreground-muted">%</span>
        </div>
        <div className="relative h-2 bg-bg-base rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute top-0 left-0 h-full rounded-full transition-all",
              isCompliant ? "bg-indicator-active" : "bg-indicator-slashed"
            )}
            style={{ width: `${percentage}%` }}
          />
          <div
            className="absolute top-0 right-0 h-full w-0.5 bg-indicator-stale/50"
            style={{ left: `${(target / 100) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-foreground-muted">
          <span>Target: {target}%</span>
          <span>{isCompliant ? "+" : ""}{(value - target).toFixed(1)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading: analyticsLoading } = useNodeAnalytics();
  const { data: overview } = useAnalyticsOverview();
  const { data: uptimeData } = useUptimeData(30);
  const { data: jobVolumeData } = useJobVolumeData(14);
  const { data: valueFlowData } = useValueFlowData(14);

  // Derive summary from real data
  const avgUptime = uptimeData?.length
    ? uptimeData.reduce((s, d) => s + d.uptime, 0) / uptimeData.length
    : analytics?.uptimePercent ?? 0;
  const totalJobs = (analytics?.totalJobsCompleted ?? 0) + (analytics?.totalJobsFailed ?? 0);
  const totalRevenue = analytics?.totalRewardsEarned ?? 0;
  const totalCost = analytics?.totalSlashed ?? 0;
  const totalMargin = totalRevenue - totalCost;

  // Sparkline data
  const uptimeSparkData = uptimeData?.map((d) => d.uptime) ?? [];
  const jobsSparkData = jobVolumeData?.map((d) => d.completed + d.failed) ?? [];
  const revenueSparkData = valueFlowData?.map((d) => d.revenue) ?? [];
  const costSparkData = valueFlowData?.map((d) => d.cost) ?? [];

  const isLoading = analyticsLoading && !analytics;

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
          <p className="text-sm text-foreground-muted">Node provider performance telemetry</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono-data text-xs">
            Last 30 days
          </Badge>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricWithSparkline
          label="Avg Uptime"
          value={`${avgUptime.toFixed(2)}%`}
          trend={avgUptime >= 95 ? "up" : avgUptime > 0 ? "down" : "neutral"}
          trendValue={avgUptime >= 95 ? "SLA met" : "Below target"}
          data={uptimeSparkData}
          color="#10b981"
        />
        <MetricWithSparkline
          label="Total Jobs"
          value={formatNumber(totalJobs)}
          trend={totalJobs > 0 ? "up" : "neutral"}
          trendValue={`${analytics?.totalJobsCompleted ?? 0} completed`}
          data={jobsSparkData}
          color="#3b82f6"
        />
        <MetricWithSparkline
          label="Total Rewards"
          value={`${totalRevenue.toFixed(3)} ETH`}
          trend={totalRevenue > 0 ? "up" : "neutral"}
          trendValue="30d earnings"
          data={revenueSparkData}
          color="#10b981"
        />
        <MetricWithSparkline
          label="Total Slashed"
          value={`${totalCost.toFixed(3)} ETH`}
          trend={totalCost > 0 ? "down" : "neutral"}
          trendValue="30d penalties"
          data={costSparkData}
          color="#f59e0b"
        />
      </div>

      {/* Charts Row 1: Uptime + SLA Gauge */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-bg-surface/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indicator-active" />
                30-Day Uptime Pattern
              </CardTitle>
              <Badge variant="outline" className="font-mono-data text-xs">
                <LineChart className="h-3 w-3 mr-1" />
                Uptime %
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {uptimeData?.length ? (
              <UptimeLineChart data={uptimeData} />
            ) : isLoading ? (
              <div className="h-40 bg-bg-base/50 rounded animate-pulse" />
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-foreground-muted border border-dashed border-zinc-800 rounded">
                No uptime data yet
              </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-foreground-muted">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-indicator-active" />
                <span>Actual Uptime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 border-t border-dashed border-indicator-stale" />
                <span>SLA Target (95%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <SLAComplianceGauge value={avgUptime} target={95} />
      </div>

      {/* Charts Row 2: Job Volume */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Daily Job Volume
            </CardTitle>
            <Badge variant="outline" className="font-mono-data text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Completed / Failed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {jobVolumeData?.length ? (
            <JobVolumeBarChart data={jobVolumeData} />
          ) : isLoading ? (
            <div className="h-40 bg-bg-base/50 rounded animate-pulse" />
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-foreground-muted border border-dashed border-zinc-800 rounded">
              No job assignments yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row 3: Value Workflow */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AreaChart className="h-4 w-4 text-indicator-active" />
              Value Workflow
            </CardTitle>
            <Badge variant="outline" className="font-mono-data text-xs">
              <AreaChart className="h-3 w-3 mr-1" />
              Rewards vs Slashings
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {valueFlowData?.length ? (
            <ValueWorkflowAreaChart data={valueFlowData} />
          ) : isLoading ? (
            <div className="h-40 bg-bg-base/50 rounded animate-pulse" />
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-foreground-muted border border-dashed border-zinc-800 rounded">
              No financial data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Job Performance */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-indicator-stale" />
              Job Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Completed</span>
                <span className="text-sm font-mono-data text-indicator-active">
                  {analytics?.totalJobsCompleted ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Failed</span>
                <span className="text-sm font-mono-data text-indicator-slashed">
                  {analytics?.totalJobsFailed ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Success Rate</span>
                <span className="text-sm font-mono-data text-indicator-active">
                  {analytics?.successRate ?? 0}%
                </span>
              </div>
              <div className="border-t border-hairline pt-2 flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Uptime</span>
                <span className="text-sm font-mono-data text-indicator-active">
                  {avgUptime.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latency Metrics */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-indicator-active" />
              Network Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Avg Latency</span>
                <span className="text-sm font-mono-data text-indicator-active">
                  {analytics?.avgLatencyMs ?? 0}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">P95 Latency</span>
                <span className="text-sm font-mono-data text-indicator-stale">
                  {analytics?.p95LatencyMs ?? 0}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">P99 Latency</span>
                <span className="text-sm font-mono-data text-indicator-slashed">
                  {analytics?.p99LatencyMs ?? 0}ms
                </span>
              </div>
              <div className="border-t border-hairline pt-2 flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Success Rate</span>
                <span className="text-sm font-mono-data text-indicator-active">
                  {analytics?.successRate ?? 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-400" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Gross Rewards</span>
                <span className="text-sm font-mono-data text-indicator-active">
                  {totalRevenue.toFixed(3)} ETH
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Slashings</span>
                <span className="text-sm font-mono-data text-indicator-slashed">
                  -{totalCost.toFixed(3)} ETH
                </span>
              </div>
              <div className="border-t border-hairline pt-2 flex items-center justify-between">
                <span className="text-xs text-foreground-muted font-medium">Net Margin</span>
                <span
                  className={cn(
                    "text-sm font-mono-data font-medium",
                    totalMargin >= 0 ? "text-indicator-active" : "text-indicator-slashed"
                  )}
                >
                  {totalMargin >= 0 ? "+" : ""}{totalMargin.toFixed(3)} ETH
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Margin %</span>
                <span className="text-sm font-mono-data text-indicator-active">
                  {totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
