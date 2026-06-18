"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LiveIndicator } from "@/components/shared/live-indicator";
import { ArrowLeft, Cpu, Globe, TrendingUp, Shield, Clock, DollarSign, Settings, BarChart3, Heart } from "lucide-react";

const tabs = [
  { label: "Overview", href: "" },
  { label: "Stake", href: "/stake" },
  { label: "Reputation", href: "/reputation" },
  { label: "Heartbeats", href: "/heartbeats" },
  { label: "Jobs", href: "/jobs" },
  { label: "Earnings", href: "/earnings" },
  { label: "Settings", href: "/settings" },
];

const mockNode = {
  id: "0x1a2b3c4d",
  name: "GPU-Rig-Alpha",
  gpuModel: "NVIDIA H100 80GB",
  vramTotal: 80,
  region: "US-West",
  status: "online" as const,
  reputation: 127,
  stake: "12.5 ETH",
  jobsCompleted: 342,
  uptime30d: "99.7%",
  lastHeartbeat: "30 sec ago",
  earningsTotal: "8.42 ETH",
};

export default function NodeOverviewPage() {
  const params = useParams();
  const nodeId = params.id as string;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/node/nodes"
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Nodes
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#0f1011] border border-[#27272a] flex items-center justify-center">
            <Cpu className="h-6 w-6 text-[#71717a]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{mockNode.name}</h1>
            <p className="text-sm text-[#71717a] font-mono">{nodeId}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium border ${
          mockNode.status === "online"
            ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20"
            : mockNode.status === "stale"
            ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
            : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"
        }`}>
          <LiveIndicator status={mockNode.status === "online" ? "connected" : "reconnecting"} size="sm" />
          {mockNode.status.charAt(0).toUpperCase() + mockNode.status.slice(1)}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#27272a]">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={`/node/nodes/${nodeId}${tab.href}`}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab.href === ""
                ? "text-white border-[#22c55e]"
                : "text-[#71717a] border-transparent hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Overview Content */}
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Current Stake"
            value={mockNode.stake}
            glowColor="active"
          />
          <MetricCard
            label="Reputation Score"
            value={mockNode.reputation.toString()}
            trend="up"
            trendValue="+5 this week"
            glowColor="active"
          />
          <MetricCard
            label="Jobs Completed"
            value={mockNode.jobsCompleted.toString()}
            trend="up"
            trendValue="+23 this month"
          />
          <MetricCard
            label="Uptime (30d)"
            value={mockNode.uptime30d}
            glowColor="active"
          />
        </div>

        {/* Hardware & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Hardware Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-[#71717a]" />
                Hardware
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#71717a]">GPU Model</span>
                <span className="text-sm font-mono text-white">{mockNode.gpuModel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#71717a]">VRAM</span>
                <span className="text-sm font-mono text-white">{mockNode.vramTotal} GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#71717a]">Region</span>
                <span className="text-sm text-white">{mockNode.region}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-[#71717a]" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#71717a]">Status</span>
                <span className="text-sm font-medium text-[#22c55e]">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#71717a]">Last Heartbeat</span>
                <span className="text-sm font-mono text-white">{mockNode.lastHeartbeat}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#71717a]">Total Earnings</span>
                <span className="text-sm font-mono text-[#22c55e]">{mockNode.earningsTotal}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href={`/node/nodes/${nodeId}/stake`}>
              <Button variant="outline" size="sm">
                <DollarSign className="h-4 w-4 mr-1" />
                Manage Stake
              </Button>
            </Link>
            <Link href={`/node/nodes/${nodeId}/jobs`}>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-1" />
                View Jobs
              </Button>
            </Link>
            <Link href={`/node/nodes/${nodeId}/settings`}>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
