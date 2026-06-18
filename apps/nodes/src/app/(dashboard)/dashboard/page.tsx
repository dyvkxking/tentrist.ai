"use client";

import * as React from "react";
import { Cpu, Wallet, TrendingUp, Clock, Zap, Activity, HardDrive, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { LiveIndicator } from "@/components/shared/live-indicator";

// Mock node data
interface MyNode {
  id: string;
  gpuModel: string;
  vramUsed: number;
  vramTotal: number;
  status: "online" | "stale" | "offline" | "slashed";
  reputation: number;
  stakeAmount: number;
  jobsCompleted: number;
  earningsTotal: number;
  lastHeartbeat: Date;
  region: string;
}

const mockNodes: MyNode[] = [
  { id: "node_001", gpuModel: "NVIDIA H100 80GB", vramUsed: 64, vramTotal: 80, status: "online", reputation: 142, stakeAmount: 10, jobsCompleted: 87, earningsTotal: 3.24, lastHeartbeat: new Date(Date.now() - 15000), region: "us-east-1" },
  { id: "node_002", gpuModel: "NVIDIA A100 80GB", vramUsed: 0, vramTotal: 80, status: "offline", reputation: 88, stakeAmount: 5, jobsCompleted: 34, earningsTotal: 1.12, lastHeartbeat: new Date(Date.now() - 3600000), region: "eu-west-1" },
];

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function NodesDashboardPage() {
  const nodes = mockNodes;
  const onlineNodes = nodes.filter((n) => n.status === "online").length;
  const totalEarnings = nodes.reduce((sum, n) => sum + n.earningsTotal, 0);
  const totalJobs = nodes.reduce((sum, n) => sum + n.jobsCompleted, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Node Dashboard</h1>
          <p className="text-sm text-[#71717a] mt-0.5">Monitor your staked GPU nodes and earnings</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0f1011] border border-[#27272a] rounded-md">
          <LiveIndicator status="connected" size="sm" />
          <span className="text-xs font-mono text-[#71717a]">ALL SYSTEMS NOMINAL</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="My Nodes"
          value={nodes.length.toString()}
          trend={onlineNodes > 0 ? "up" : "down"}
          trendValue={`${onlineNodes} online`}
          glowColor={onlineNodes > 0 ? "active" : "none"}
          className="bg-[#0f1011]/80"
        />
        <MetricCard
          label="Total Earnings"
          value={`${totalEarnings.toFixed(3)} ETH`}
          trend="up"
          trendValue="+0.12 this week"
          glowColor="active"
          className="bg-[#0f1011]/80"
        />
        <MetricCard
          label="Jobs Completed"
          value={totalJobs.toString()}
          trend="up"
          trendValue="+5 today"
          glowColor="active"
          className="bg-[#0f1011]/80"
        />
        <MetricCard
          label="Avg Reputation"
          value={nodes.length > 0 ? Math.round(nodes.reduce((s, n) => s + n.reputation, 0) / nodes.length).toString() : "—"}
          trend="neutral"
          trendValue="—"
          glowColor="none"
          className="bg-[#0f1011]/80"
        />
      </div>

      {/* My Nodes */}
      <Card className="bg-[#0f1011]/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#22c55e]" />
              My GPU Nodes
            </CardTitle>
            <button className="px-3 py-1.5 text-xs font-medium bg-[#22c55e] text-white rounded-md hover:bg-[#16a34a] transition-colors">
              + Register Node
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {nodes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-[#71717a] text-sm mb-1">No nodes registered</div>
              <div className="text-xs text-[#52525b]">Stake collateral to register your first GPU node</div>
            </div>
          ) : (
            <div className="divide-y divide-[#27272a]">
              {nodes.map((node) => (
                <div key={node.id} className="px-6 py-4 flex items-center gap-6">
                  {/* Node identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <LiveIndicator status={node.status === "online" ? "connected" : node.status === "stale" ? "reconnecting" : "disconnected"} size="md" />
                    <div className="min-w-0">
                      <div className="text-sm font-mono text-white">{node.id}</div>
                      <div className="text-xs text-[#71717a]">{node.gpuModel}</div>
                    </div>
                  </div>

                  {/* VRAM */}
                  <div className="flex items-center gap-3 w-40">
                    <HardDrive className="h-4 w-4 text-[#71717a] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-mono text-white">{node.vramUsed}GB</span>
                        <span className="font-mono text-[#71717a]">{node.vramTotal}GB</span>
                      </div>
                      <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            node.vramTotal > 0 && node.vramUsed / node.vramTotal > 0.9 ? "bg-[#ef4444]" :
                            node.vramTotal > 0 && node.vramUsed / node.vramTotal > 0.7 ? "bg-[#f59e0b]" : "bg-[#22c55e]"
                          )}
                          style={{ width: `${(node.vramUsed / node.vramTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-center">
                      <div className="text-[#71717a]">Rep</div>
                      <div className={cn("font-mono font-medium", node.reputation > 100 ? "text-[#22c55e]" : node.reputation > 0 ? "text-white" : "text-[#ef4444]")}>
                        {node.reputation > 0 ? "+" : ""}{node.reputation}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#71717a]">Jobs</div>
                      <div className="font-mono font-medium text-white">{node.jobsCompleted}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#71717a]">Earned</div>
                      <div className="font-mono font-medium text-[#22c55e]">{node.earningsTotal.toFixed(3)} ETH</div>
                    </div>
                  </div>

                  {/* Heartbeat */}
                  <div className="ml-auto flex items-center gap-2 text-xs text-[#71717a]">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-mono">{formatRelativeTime(node.lastHeartbeat)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity + Earnings split */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-[#0f1011]/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#f59e0b]" />
              Recent Heartbeats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nodes.filter(n => n.status === "online").map(node => (
              <div key={node.id} className="flex items-center justify-between py-2 border-b border-[#27272a] last:border-0">
                <div className="flex items-center gap-2">
                  <LiveIndicator status="connected" size="sm" />
                  <span className="text-xs font-mono text-white">{node.id}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[#71717a]">
                  <span>VRAM {node.vramUsed}/{node.vramTotal}GB</span>
                  <span className="text-[#22c55e]">OK</span>
                </div>
              </div>
            ))}
            {nodes.filter(n => n.status !== "online").length > 0 && nodes.filter(n => n.status !== "online").map(node => (
              <div key={node.id} className="flex items-center justify-between py-2 border-b border-[#27272a] last:border-0">
                <div className="flex items-center gap-2">
                  <LiveIndicator status="disconnected" size="sm" />
                  <span className="text-xs font-mono text-white">{node.id}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[#ef4444]">
                  <span>OFFLINE</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#0f1011]/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#22c55e]" />
              Earnings History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#71717a]">Today</span>
              <span className="text-sm font-mono text-[#22c55e]">+0.0847 ETH</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#71717a]">This Week</span>
              <span className="text-sm font-mono text-[#22c55e]">+0.3120 ETH</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#71717a]">This Month</span>
              <span className="text-sm font-mono text-[#22c55e]">+1.247 ETH</span>
            </div>
            <div className="pt-3 border-t border-[#27272a] flex items-center justify-between">
              <span className="text-sm text-white font-medium">Total Earned</span>
              <span className="text-sm font-mono text-[#22c55e]">{totalEarnings.toFixed(3)} ETH</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}