"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, Shield, Award } from "lucide-react";

const mockReputationData = {
  score: 127,
  tier: "gold" as const,
  totalJobs: 342,
  successfulJobs: 338,
  failedJobs: 4,
  last30Days: [
    { date: "Jun 16", change: 0 },
    { date: "Jun 15", change: +5 },
    { date: "Jun 14", change: -2 },
    { date: "Jun 13", change: 0 },
    { date: "Jun 12", change: +3 },
    { date: "Jun 11", change: +5 },
    { date: "Jun 10", change: 0 },
    { date: "Jun 9", change: -1 },
    { date: "Jun 8", change: +2 },
    { date: "Jun 7", change: 0 },
  ],
  recentEvents: [
    { id: "1", jobId: "0xabc123", change: "+5", reason: "Job completed successfully", timestamp: "2 hours ago" },
    { id: "2", jobId: "0xdef456", change: "+3", reason: "SLA target exceeded", timestamp: "6 hours ago" },
    { id: "3", jobId: "0xghi789", change: "-2", reason: "Late heartbeat", timestamp: "1 day ago" },
    { id: "4", jobId: "0xjkl012", change: "+5", reason: "Job completed successfully", timestamp: "2 days ago" },
    { id: "5", jobId: "0xmno345", change: "+2", reason: "Zero downtime", timestamp: "3 days ago" },
  ],
};

const tierConfig = {
  gold: { min: 100, label: "Gold", color: "#f59e0b", icon: Award },
  silver: { min: 50, label: "Silver", color: "#71717a", icon: Shield },
  bronze: { min: 0, label: "Bronze", color: "#cd7f32", icon: Shield },
};

export default function ReputationPage() {
  const params = useParams();
  const nodeId = params.id as string;

  const tier = mockReputationData.score >= 100 ? "gold" : mockReputationData.score >= 50 ? "silver" : "bronze";
  const TierIcon = tierConfig[tier].icon;

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
        <h1 className="text-xl font-semibold text-white">Reputation Score</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Node {nodeId} reputation history
        </p>
      </div>

      {/* Score Card */}
      <Card className={`border-${tierConfig[tier].color}/20`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${tierConfig[tier].color}20` }}
              >
                <TierIcon className="h-10 w-10" style={{ color: tierConfig[tier].color }} />
              </div>
              <div>
                <p className="text-sm text-[#71717a]">Current Score</p>
                <p className="text-5xl font-bold font-mono text-white">
                  {mockReputationData.score}
                </p>
                <span
                  className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded"
                  style={{
                    backgroundColor: `${tierConfig[tier].color}20`,
                    color: tierConfig[tier].color,
                  }}
                >
                  {tierConfig[tier].label} Tier
                </span>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 text-[#22c55e]">
                <TrendingUp className="h-5 w-5" />
                <span className="text-2xl font-bold font-mono">+15</span>
              </div>
              <p className="text-xs text-[#71717a]">Last 30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold font-mono text-white">{mockReputationData.totalJobs}</p>
            <p className="text-sm text-[#71717a]">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold font-mono text-[#22c55e]">{mockReputationData.successfulJobs}</p>
            <p className="text-sm text-[#71717a]">Successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold font-mono text-[#ef4444]">{mockReputationData.failedJobs}</p>
            <p className="text-sm text-[#71717a]">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">30-Day Reputation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-24">
            {mockReputationData.last30Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-sm ${
                    day.change > 0
                      ? "bg-[#22c55e]"
                      : day.change < 0
                      ? "bg-[#ef4444]"
                      : "bg-[#27272a]"
                  }`}
                  style={{
                    height: `${Math.max(Math.abs(day.change) * 4, day.change === 0 ? 4 : 8)}px`,
                  }}
                />
                <span className="text-[10px] text-[#71717a] font-mono">{day.date.slice(-2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Reputation Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-xs text-[#71717a] font-medium px-6 py-3">Job ID</th>
                <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">Change</th>
                <th className="text-left text-xs text-[#71717a] font-medium px-4 py-3">Reason</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-6 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {mockReputationData.recentEvents.map((event) => (
                <tr key={event.id} className="border-b border-[#27272a] last:border-0">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-[#71717a]">{event.jobId}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`text-sm font-mono ${
                        event.change.startsWith("+") ? "text-[#22c55e]" : "text-[#ef4444]"
                      }`}
                    >
                      {event.change}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-white">{event.reason}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-[#71717a] font-mono">{event.timestamp}</span>
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
