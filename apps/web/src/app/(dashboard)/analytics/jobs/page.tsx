"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Server,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  UptimeLineChart,
  JobVolumeBarChart,
  ValueWorkflowAreaChart,
  Sparkline,
} from "@/components/charts";

// Types
type JobStatus = "pending" | "running" | "completed" | "failed" | "requeued";

interface JobRecord {
  id: string;
  clientId: string;
  status: JobStatus;
  slaUptime: number;
  slaThroughput: number;
  progress: number;
  cost: number;
  nodes: number;
  duration: number;
  completedAt?: number;
}

// Mock data generators
function generateJobRecords(count: number = 100): JobRecord[] {
  const statuses: JobStatus[] = ["pending", "running", "completed", "failed", "requeued"];
  const clients = ["nexus-ai", "renderfarm", "synthwave", "neuralforge", "deepscale", "pixelflow", "aistudio"];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000;
    return {
      id: `job_${Math.random().toString(36).slice(2, 12)}`,
      clientId: clients[Math.floor(Math.random() * clients.length)],
      status,
      slaUptime: 95 + Math.random() * 5,
      slaThroughput: 100 + Math.floor(Math.random() * 400),
      progress: status === "completed" ? 100 : status === "failed" ? Math.floor(Math.random() * 80) : Math.floor(Math.random() * 100),
      cost: Math.random() * 5,
      nodes: Math.floor(Math.random() * 4) + 1,
      duration: Math.floor(Math.random() * 3600) + 300,
      completedAt: status === "completed" ? createdAt + Math.random() * 3600000 : undefined,
    };
  });
}

function generateUptimeTrendData(days: number = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      uptime: 94 + Math.random() * 6,
      slaTarget: 95,
    };
  });
}

function generateJobTrendData(days: number = 14) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      submitted: Math.floor(Math.random() * 30) + 10,
      completed: Math.floor(Math.random() * 25) + 8,
      failed: Math.floor(Math.random() * 5),
    };
  });
}

function generateSLAComplianceData(days: number = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      compliance: 92 + Math.random() * 8,
    };
  });
}

function generateCostDistributionData() {
  return [
    { name: "LLM Fine-tuning", value: 45, color: "#10b981" },
    { name: "Batch Rendering", value: 28, color: "#3b82f6" },
    { name: "Image Processing", value: 15, color: "#f59e0b" },
    { name: "Data Processing", value: 12, color: "#8b5cf6" },
  ];
}

function generateClientBreakdown() {
  return [
    { client: "nexus-ai", jobs: 245, revenue: 12.4, SLA: 99.2 },
    { client: "renderfarm", jobs: 189, revenue: 9.8, SLA: 98.7 },
    { client: "synthwave", jobs: 156, revenue: 8.2, SLA: 99.5 },
    { client: "neuralforge", jobs: 134, revenue: 7.1, SLA: 97.8 },
    { client: "deepscale", jobs: 98, revenue: 5.4, SLA: 99.1 },
  ];
}

// Format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// Status distribution pie chart (simple)
function StatusPieChart({ data }: { data: { status: JobStatus; count: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex items-center gap-6">
      {/* Simple bar representation */}
      <div className="flex-1 space-y-2">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div className="w-16 text-xs text-foreground-muted capitalize">
              {item.status}
            </div>
            <div className="flex-1 h-4 bg-bg-base rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(item.count / total) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
            <div className="w-12 text-xs font-mono-data text-foreground text-right">
              {item.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Client breakdown table
function ClientBreakdownTable({
  data,
}: {
  data: { client: string; jobs: number; revenue: number; SLA: number }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th className="text-left px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Client
            </th>
            <th className="text-right px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Jobs
            </th>
            <th className="text-right px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Revenue
            </th>
            <th className="text-right px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              SLA
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {data.map((row) => (
            <tr key={row.client} className="hover:bg-bg-base/50 transition-colors">
              <td className="px-3 py-2">
                <span className="text-xs font-mono-data text-indicator-active">
                  {row.client}
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                <span className="text-xs font-mono-data text-foreground">
                  {row.jobs}
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                <span className="text-xs font-mono-data text-indicator-active">
                  {row.revenue.toFixed(2)} ETH
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                <span
                  className={cn(
                    "text-xs font-mono-data",
                    row.SLA >= 99 ? "text-indicator-active" : "text-indicator-stale"
                  )}
                >
                  {row.SLA.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Recent jobs table
function RecentJobsTable({ jobs }: { jobs: JobRecord[] }) {
  const recentJobs = jobs.slice(0, 10);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th className="text-left px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Job ID
            </th>
            <th className="text-left px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Client
            </th>
            <th className="text-center px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Status
            </th>
            <th className="text-right px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              SLA
            </th>
            <th className="text-right px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Cost
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {recentJobs.map((job) => (
            <tr key={job.id} className="hover:bg-bg-base/50 transition-colors">
              <td className="px-3 py-2">
                <span className="text-xs font-mono-data text-foreground">
                  {job.id}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="text-xs text-foreground-muted">{job.clientId}</span>
              </td>
              <td className="px-3 py-2">
                <div className="flex justify-center">
                  <StatusBadge status={job.status} size="sm" />
                </div>
              </td>
              <td className="px-3 py-2 text-right">
                <span className="text-xs font-mono-data text-foreground">
                  {job.slaUptime.toFixed(1)}%
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                <span className="text-xs font-mono-data text-indicator-active">
                  ${job.cost.toFixed(4)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function JobsAnalyticsPage() {
  const jobs = React.useMemo(() => generateJobRecords(100), []);
  const uptimeData = React.useMemo(() => generateUptimeTrendData(30), []);
  const jobTrendData = React.useMemo(() => generateJobTrendData(14), []);
  const slaComplianceData = React.useMemo(() => generateSLAComplianceData(30), []);
  const costDistribution = React.useMemo(() => generateCostDistributionData(), []);
  const clientBreakdown = React.useMemo(() => generateClientBreakdown(), []);

  // Calculate stats
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const failedJobs = jobs.filter((j) => j.status === "failed").length;
  const runningJobs = jobs.filter((j) => j.status === "running").length;
  const avgSLA = jobs.reduce((sum, j) => sum + j.slaUptime, 0) / jobs.length;
  const totalCost = jobs.reduce((sum, j) => sum + j.cost, 0);
  const successRate = (completedJobs / (completedJobs + failedJobs)) * 100;

  // Status distribution
  const statusDistribution = [
    { status: "completed" as JobStatus, count: completedJobs, color: "#10b981" },
    { status: "failed" as JobStatus, count: failedJobs, color: "#f43f5e" },
    { status: "running" as JobStatus, count: runningJobs, color: "#3b82f6" },
    {
      status: "pending" as JobStatus,
      count: jobs.filter((j) => j.status === "pending").length,
      color: "#f59e0b",
    },
    {
      status: "requeued" as JobStatus,
      count: jobs.filter((j) => j.status === "requeued").length,
      color: "#8b5cf6",
    },
  ];

  // Sparkline data
  const slaSparkData = slaComplianceData.map((d) => d.compliance);
  const jobsSparkData = jobTrendData.map((d) => d.completed);
  const successSparkData = jobTrendData.map((d) =>
    d.completed + d.failed > 0
      ? (d.completed / (d.completed + d.failed)) * 100
      : 100
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link
              href="/analytics"
              className="text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              Analytics
            </Link>
            <span className="text-xs text-foreground-muted">/</span>
            <span className="text-xs text-foreground">Jobs</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Job Analytics
          </h1>
          <p className="text-sm text-foreground-muted">
            Detailed metrics and trends for GPU compute jobs
          </p>
        </div>
        <Badge variant="outline" className="font-mono-data text-xs">
          Last 30 days
        </Badge>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Jobs"
          value={totalJobs}
          trend="up"
          trendValue="+12%"
          glowColor="active"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          trend={successRate >= 95 ? "up" : "down"}
          trendValue={successRate >= 95 ? "Good" : "At Risk"}
          glowColor={successRate >= 95 ? "active" : "stale"}
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Avg SLA"
          value={`${avgSLA.toFixed(2)}%`}
          trend={avgSLA >= 95 ? "up" : "down"}
          trendValue="compliance"
          glowColor={avgSLA >= 95 ? "active" : "stale"}
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Total Revenue"
          value={`${totalCost.toFixed(2)} ETH`}
          trend="up"
          trendValue="all time"
          glowColor="none"
          className="bg-bg-surface/80"
        />
      </div>

      {/* Charts Row 1: Job Volume Bar Chart */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Job Submission & Completion Trend
            </CardTitle>
            <Badge variant="outline" className="font-mono-data text-xs">
              14-Day Trend
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <JobVolumeBarChart
            data={jobTrendData.map((d) => ({
              date: d.date,
              completed: d.completed,
              failed: d.failed,
              pending: d.submitted - d.completed - d.failed,
            }))}
          />
        </CardContent>
      </Card>

      {/* Two Column: SLA Compliance & Status Distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* SLA Compliance Over Time */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-indicator-active" />
              SLA Compliance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UptimeLineChart
              data={slaComplianceData.map((d) => ({
                date: d.date,
                uptime: d.compliance,
                slaTarget: 95,
              }))}
            />
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-indicator-stale" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={statusDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Three Column Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Job Type Cost Distribution */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-indicator-stale" />
              Cost by Job Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1 text-xs text-foreground-muted">
                    {item.name}
                  </span>
                  <span className="text-xs font-mono-data text-foreground">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indicator-active" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Avg Duration</span>
                <span className="text-xs font-mono-data text-foreground">
                  {formatDuration(
                    jobs.reduce((sum, j) => sum + j.duration, 0) / jobs.length
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Avg Nodes/Job</span>
                <span className="text-xs font-mono-data text-foreground">
                  {(
                    jobs.reduce((sum, j) => sum + j.nodes, 0) / jobs.length
                  ).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">P95 Progress</span>
                <span className="text-xs font-mono-data text-indicator-stale">
                  {
                    jobs
                      .filter((j) => j.status === "running")
                      .sort((a, b) => b.progress - a.progress)[0]?.progress
                      ??
                    0
                  }
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Requeue Rate</span>
                <span className="text-xs font-mono-data text-indicator-stale">
                  {(
                    (jobs.filter((j) => j.status === "requeued").length /
                      totalJobs) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-400" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Completed</span>
                <span className="text-xs font-mono-data text-indicator-active">
                  {completedJobs}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Failed</span>
                <span className="text-xs font-mono-data text-indicator-slashed">
                  {failedJobs}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Running</span>
                <span className="text-xs font-mono-data text-blue-400">
                  {runningJobs}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Pending</span>
                <span className="text-xs font-mono-data text-indicator-stale">
                  {totalJobs - completedJobs - failedJobs - runningJobs}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column: Client Breakdown & Recent Jobs */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Client Breakdown */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-indicator-active" />
              Client Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ClientBreakdownTable data={clientBreakdown} />
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-indicator-stale" />
              Recent Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <RecentJobsTable jobs={jobs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
