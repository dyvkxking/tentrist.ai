"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Briefcase, Clock } from "lucide-react";

const mockEarningsData = {
  summary: {
    today: "0.085 ETH",
    thisWeek: "0.42 ETH",
    thisMonth: "1.85 ETH",
    total: "8.42 ETH",
  },
  chartData: [
    { day: "Mon", amount: 0.12 },
    { day: "Tue", amount: 0.08 },
    { day: "Wed", amount: 0.15 },
    { day: "Thu", amount: 0.22 },
    { day: "Fri", amount: 0.18 },
    { day: "Sat", amount: 0.09 },
    { day: "Sun", amount: 0.11 },
  ],
  perJob: [
    { jobId: "0xabc123def456", completedAt: "2 hours ago", duration: "45m 32s", earnings: "0.045 ETH" },
    { jobId: "0xdef789abc012", completedAt: "6 hours ago", duration: "1h 23m 15s", earnings: "0.082 ETH" },
    { jobId: "0xghi345jkl678", completedAt: "2 days ago", duration: "32m 08s", earnings: "0.032 ETH" },
    { jobId: "0xmno567pqr890", completedAt: "4 days ago", duration: "2h 01m 22s", earnings: "0.120 ETH" },
    { jobId: "0xstu789vwx012", completedAt: "5 days ago", duration: "58m 44s", earnings: "0.058 ETH" },
  ],
};

export default function NodeEarningsPage() {
  const params = useParams();
  const nodeId = params.id as string;
  const maxAmount = Math.max(...mockEarningsData.chartData.map((d) => d.amount));

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/node/nodes/${nodeId}`}
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Node Overview
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Node Earnings</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Earnings for node {nodeId}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">Today</span>
            </div>
            <p className="text-2xl font-bold font-mono text-[#22c55e] mt-2">
              {mockEarningsData.summary.today}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">This Week</span>
            </div>
            <p className="text-2xl font-bold font-mono text-[#22c55e] mt-2">
              {mockEarningsData.summary.thisWeek}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">This Month</span>
            </div>
            <p className="text-2xl font-bold font-mono text-[#22c55e] mt-2">
              {mockEarningsData.summary.thisMonth}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#22c55e]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">Total</span>
            </div>
            <p className="text-2xl font-bold font-mono text-white mt-2">
              {mockEarningsData.summary.total}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">7-Day Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {mockEarningsData.chartData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-[#22c55e]/20 rounded-t transition-all hover:bg-[#22c55e]/30"
                  style={{ height: `${(day.amount / maxAmount) * 100}%` }}
                >
                  <div
                    className="w-full bg-[#22c55e] rounded-t"
                    style={{ height: `${(day.amount / maxAmount) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#71717a] font-mono">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Per-Job Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Per-Job Earnings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-xs text-[#71717a] font-medium px-6 py-3">Job ID</th>
                <th className="text-left text-xs text-[#71717a] font-medium px-4 py-3">Completed At</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-4 py-3">Duration</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-6 py-3">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {mockEarningsData.perJob.map((job) => (
                <tr key={job.jobId} className="border-b border-[#27272a] last:border-0">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-white">{job.jobId}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[#71717a] font-mono">{job.completedAt}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-mono text-white">{job.duration}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-mono text-[#22c55e]">{job.earnings}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
