"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/shared/page-header";

const TOP_STAKERS = [
  { rank: 1, address: "0xEfA2b4C8d3E9F1a6B7", stake: "5.0 ETH", nodes: 3, reputation: 215 },
  { rank: 2, address: "0x4A5e9F2c1D8b3A7e6f", stake: "2.5 ETH", nodes: 1, reputation: 142 },
  { rank: 3, address: "0xBcD1a3F9e2B7c8D4e5", stake: "1.2 ETH", nodes: 1, reputation: 87 },
];

const MONTHLY_STAKE = [
  { month: "Jan", total: 8400 }, { month: "Feb", total: 9200 }, { month: "Mar", total: 10100 },
  { month: "Apr", total: 11200 }, { month: "May", total: 11900 }, { month: "Jun", total: 12840 },
];
const MAX = Math.max(...MONTHLY_STAKE.map((m) => m.total));

export default function StakeLeaderboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader title="Stake Leaderboard" description="Top stakers on the Tentrist network" />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Staked" value="12,840 ETH" trend="up" trendValue="+8%" glowColor="active" />
        <MetricCard label="Active Stakers" value="847" trend="up" trendValue="+23" />
        <MetricCard label="Avg Stake per Node" value="10.0 ETH" />
      </div>

      {/* Staking Over Time */}
      <Card className="bg-bg-surface/80">
        <CardHeader><CardTitle>Total Staked Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {MONTHLY_STAKE.map((m) => {
              const pct = (m.total / MAX) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-28">
                    <div className="w-full bg-indicator-active/20 border border-indicator-active/30 rounded-t-sm hover:bg-indicator-active/30 transition-all" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-foreground-muted">{m.month}</span>
                  <span className="text-xs font-mono text-foreground">{(m.total / 1000).toFixed(1)}k</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Stakers */}
      <Card className="bg-bg-surface/80">
        <CardHeader><CardTitle>Top Stakers</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {TOP_STAKERS.map((s) => (
              <Link
                key={s.rank}
                href={`/explore/nodes/${s.address}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-bg-base/30 transition-colors"
              >
                <span className="w-8 text-center font-mono text-foreground-muted font-bold">{s.rank}</span>
                <code className="text-sm font-mono text-foreground flex-1">{s.address.slice(0, 12)}…</code>
                <span className="text-sm font-mono text-indicator-active font-semibold">{s.stake}</span>
                <span className="text-sm text-foreground-muted">{s.nodes} node{s.nodes > 1 ? "s" : ""}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
