"use client";

import Link from "next/link";
import { Globe, Cpu, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/shared/page-header";

export default function ExplorePage() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <PageHeader
        title="Network Explorer"
        description="Real-time stats and activity on the Tentrist DePIN GPU network"
      />

      {/* Protocol Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Staked" value="12,840 ETH" trend="up" trendValue="+3.2%" glowColor="active" />
        <MetricCard label="Active Nodes" value="1,284" trend="up" trendValue="+47 today" glowColor="active" />
        <MetricCard label="Jobs in Flight" value="342" trend="up" trendValue="+12%" />
        <MetricCard label="Avg Uptime" value="99.4%" trend="up" trendValue="+0.1%" />
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { href: "/explore/nodes", icon: Cpu, label: "Node Registry", desc: "Browse all registered GPU nodes" },
          { href: "/explore/jobs", icon: Activity, label: "Network Jobs", desc: "All jobs across the network" },
          { href: "/explore/slashing", icon: TrendingUp, label: "Slash Events", desc: "Recent slashing activity" },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}>
            <Card className="bg-bg-surface/80 hover:border-indicator-active/30 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indicator-active/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-indicator-active" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground mb-1">{label}</div>
                    <div className="text-sm text-foreground-muted">{desc}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Live Activity Preview */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Recent Network Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { type: "job", msg: "Job #job_8a3f completed on node 0x4A5e...F82c", time: "2m ago" },
            { type: "slash", msg: "Node 0xBcD1...8f2e slashed 0.01 ETH — missed heartbeat", time: "5m ago" },
            { type: "node", msg: "New node registered: RTX 4090 × 8 in eu-west-1", time: "11m ago" },
            { type: "job", msg: "Job #job_7b2e submitted — LLM Fine-tuning", time: "18m ago" },
            { type: "sla", msg: "SLA credit issued: 0.0018 ETH to client 0x1A2b...", time: "31m ago" },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-hairline/50 last:border-0">
              <div className="w-2 h-2 rounded-full bg-indicator-active shrink-0" />
              <span className="text-sm text-foreground-muted flex-1">{e.msg}</span>
              <span className="text-xs font-mono text-foreground-muted">{e.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
