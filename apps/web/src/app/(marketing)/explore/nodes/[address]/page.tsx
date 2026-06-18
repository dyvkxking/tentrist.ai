"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Wallet, Cpu, TrendingUp, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReputationBadge } from "@/components/ui/ReputationBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

const MOCK_NODE: Record<string, { address: string; gpu: string; vram: number; region: string; status: "online" | "stale" | "offline" | "slashed"; reputation: number; stake: string; uptime: string; jobsCompleted: number; jobsFailed: number; avgLatency: number; slashCount: number; slashTotal: string; registeredAt: string }> = {
  "0x4A5e9F2c1D8b3A7e6f": { address: "0x4A5e9F2c1D8b3A7e6f", gpu: "NVIDIA H100 80GB", vram: 80, region: "us-east-1", status: "online", reputation: 142, stake: "2.5 ETH", uptime: "99.8%", jobsCompleted: 1247, jobsFailed: 3, avgLatency: 42, slashCount: 1, slashTotal: "0.025 ETH", registeredAt: "Jan 15, 2024" },
};

export default function NodeProfilePage() {
  const { address } = useParams();
  const node = MOCK_NODE[address as string] ?? Object.values(MOCK_NODE)[0];

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader
        title="Node Profile"
        description={address as string}
        breadcrumbs={[
          { label: "Explore", href: "/explore" },
          { label: "Nodes", href: "/explore/nodes" },
          { label: address as string },
        ]}
      />

      {/* Identity */}
      <Card className="bg-bg-surface/80 border-indicator-active/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indicator-active/10 border border-indicator-active/30 flex items-center justify-center">
                <Cpu className="h-6 w-6 text-indicator-active" />
              </div>
              <div>
                <div className="font-mono text-foreground font-semibold">{node.address}</div>
                <div className="text-sm text-foreground-muted">{node.gpu} · {node.region}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={node.status} />
              <ReputationBadge score={node.reputation} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Stake" value={node.stake} glowColor="active" />
        <MetricCard label="Reputation" value={String(node.reputation)} />
        <MetricCard label="Jobs Completed" value={String(node.jobsCompleted)} trend="up" trendValue="+12%" />
        <MetricCard label="Avg Latency" value={`${node.avgLatency}ms`} />
      </div>

      {/* Performance */}
      <Card className="bg-bg-surface/80">
        <CardHeader><CardTitle>Performance (30d)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Uptime", value: node.uptime },
            { label: "Jobs Completed", value: String(node.jobsCompleted) },
            { label: "Jobs Failed", value: String(node.jobsFailed) },
            { label: "Avg Latency", value: `${node.avgLatency}ms` },
            { label: "Slash Events", value: `${node.slashCount} (${node.slashTotal})` },
            { label: "Registered", value: node.registeredAt },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-hairline/50 last:border-0">
              <span className="text-foreground-muted text-sm">{label}</span>
              <span className="font-mono-data text-foreground text-sm">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Link href="/explore/nodes">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back to Registry</Button>
        </Link>
      </div>
    </div>
  );
}
