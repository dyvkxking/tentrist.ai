"use client";

import * as React from "react";
import Link from "next/link";
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

// Mock data generators
function generateUptimeData(days: number = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      uptime: 95 + Math.random() * 5,
      slaTarget: 95,
    };
  });
}

function generateJobVolumeData(days: number = 14) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completed: Math.floor(Math.random() * 50) + 20,
      failed: Math.floor(Math.random() * 8),
      pending: Math.floor(Math.random() * 15) + 5,
    };
  });
}

function generateValueWorkflowData(days: number = 14) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const revenue = Math.random() * 10 + 5;
    const cost = revenue * (0.4 + Math.random() * 0.3);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: parseFloat(revenue.toFixed(3)),
      cost: parseFloat(cost.toFixed(3)),
      margin: parseFloat((revenue - cost).toFixed(3)),
    };
  });
}

// Format large numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Metric with sparkline
function MetricWithSparkline({
  label,
  value,
  trend,
  trendValue,
  data,
  color,
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
          <span className="text-xs text-foreground-muted uppercase tracking-wider">
            {label}
          </span>
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
        <div className="text-2xl font-mono-data text-foreground mb-3">
          {value}
        </div>
        <Sparkline data={data} color={color} height={40} />
      </CardContent>
    </Card>
  );
}

// SLA Compliance Gauge
function SLAComplianceGauge({
  value,
  target,
}: {
  value: number;
  target: number;
}) {
  const percentage = Math.min((value / target) * 100, 100);
  const isCompliant = value >= target;

  return (
    <Card className="bg-bg-surface/80">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-foreground-muted uppercase tracking-wider">
            SLA Compliance
          </span>
          <Badge
            variant={isCompliant ? "success" : "danger"}
            className="font-mono-data text-xs"
          >
            {isCompliant ? "Compliant" : "At Risk"}
          </Badge>
        </div>
        <div className="text-3xl font-mono-data text-foreground mb-3">
          {value.toFixed(1)}
          <span className="text-lg text-foreground-muted">%</span>
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
  const uptimeData = React.useMemo(() => generateUptimeData(30), []);
  const jobVolumeData = React.useMemo(() => generateJobVolumeData(14), []);
  const valueWorkflowData = React.useMemo(() => generateValueWorkflowData(14), []);

  // Calculate summary stats
  const avgUptime =
    uptimeData.reduce((sum, d) => sum + d.uptime, 0) / uptimeData.length;
  const totalJobs = jobVolumeData.reduce(
    (sum, d) => sum + d.completed + d.failed,
    0
  );
  const totalRevenue = valueWorkflowData.reduce((sum, d) => sum + d.revenue, 0);
  const totalCost = valueWorkflowData.reduce((sum, d) => sum + d.cost, 0);
  const totalMargin = totalRevenue - totalCost;

  // Sparkline data for metrics
  const uptimeSparkData = uptimeData.map((d) => d.uptime);
  const jobsSparkData = jobVolumeData.map((d) => d.completed + d.failed);
  const revenueSparkData = valueWorkflowData.map((d) => d.revenue);
  const costSparkData = valueWorkflowData.map((d) => d.cost);

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-sm text-foreground-muted">
            Operational telemetry and workflow insights
          </p>
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
          trend="up"
          trendValue="+0.3%"
          data={uptimeSparkData}
          color="#10b981"
        />
        <MetricWithSparkline
          label="Total Jobs"
          value={formatNumber(totalJobs)}
          trend="up"
          trendValue="+12%"
          data={jobsSparkData}
          color="#3b82f6"
        />
        <MetricWithSparkline
          label="Total Revenue"
          value={`${totalRevenue.toFixed(2)} ETH`}
          trend="up"
          trendValue="+8.2%"
          data={revenueSparkData}
          color="#10b981"
        />
        <MetricWithSparkline
          label="Total Cost"
          value={`${totalCost.toFixed(2)} ETH`}
          trend="down"
          trendValue="-3.1%"
          data={costSparkData}
          color="#f59e0b"
        />
      </div>

      {/* Charts Row 1: Uptime Line Chart */}
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
                Line
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <UptimeLineChart data={uptimeData} />
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-foreground-muted">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-indicator-active" />
                <span>Actual Uptime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-indicator-stale border-dashed" style={{ borderStyle: 'dashed' }} />
                <span>SLA Target (95%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SLA Compliance Gauge */}
        <SLAComplianceGauge value={avgUptime} target={95} />
      </div>

      {/* Charts Row 2: Job Volume Bar Chart */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Daily Job Volume
            </CardTitle>
            <Badge variant="outline" className="font-mono-data text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Bar
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <JobVolumeBarChart data={jobVolumeData} />
        </CardContent>
      </Card>

      {/* Charts Row 3: Value Workflow Area Chart */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AreaChart className="h-4 w-4 text-indicator-active" />
              Value Workflow
            </CardTitle>
            <Badge variant="outline" className="font-mono-data text-xs">
              <AreaChart className="h-3 w-3 mr-1" />
              Area
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ValueWorkflowAreaChart data={valueWorkflowData} />
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-indicator-stale" />
              Node Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indicator-active" />
                  <span className="text-xs text-foreground-muted">Online</span>
                </div>
                <span className="text-sm font-mono-data text-indicator-active">847</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indicator-stale" />
                  <span className="text-xs text-foreground-muted">Stale</span>
                </div>
                <span className="text-sm font-mono-data text-indicator-stale">42</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indicator-slashed" />
                  <span className="text-xs text-foreground-muted">Offline</span>
                </div>
                <span className="text-sm font-mono-data text-indicator-slashed">18</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  <span className="text-xs text-foreground-muted">Slashed</span>
                </div>
                <span className="text-sm font-mono-data text-zinc-400">5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-indicator-active" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Avg Latency</span>
                <span className="text-sm font-mono-data text-indicator-active">42ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">P95 Latency</span>
                <span className="text-sm font-mono-data text-indicator-stale">128ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">P99 Latency</span>
                <span className="text-sm font-mono-data text-indicator-slashed">245ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Success Rate</span>
                <span className="text-sm font-mono-data text-indicator-active">99.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <span className="text-xs text-foreground-muted">Gross Revenue</span>
                <span className="text-sm font-mono-data text-indicator-active">
                  {totalRevenue.toFixed(3)} ETH
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Total Cost</span>
                <span className="text-sm font-mono-data text-indicator-stale">
                  {totalCost.toFixed(3)} ETH
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-hairline pt-2">
                <span className="text-xs text-foreground-muted font-medium">
                  Net Margin
                </span>
                <span className="text-sm font-mono-data text-indicator-active font-medium">
                  {totalMargin.toFixed(3)} ETH
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Margin %</span>
                <span className="text-sm font-mono-data text-indicator-active">
                  {((totalMargin / totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
