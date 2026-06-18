"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { ReputationBadge } from "@/components/ui/ReputationBadge";
import { PageHeader } from "@/components/shared/page-header";

const NODES = [
  { id: "0x4A5e9F2c1D8b3A7e6f", address: "0x4A5e...F82c", gpu: "NVIDIA H100 80GB", vram: 80, region: "us-east-1", status: "online", reputation: 142, stake: "2.5 ETH", uptime: "99.8%" },
  { id: "0xBcD1a3F9e2B7c8D4e5", address: "0xBcD1...8f2e", gpu: "NVIDIA A100 80GB", vram: 80, region: "eu-west-1", status: "stale", reputation: 87, stake: "1.2 ETH", uptime: "97.2%" },
  { id: "0xEfA2b4C8d3E9F1a6B7", address: "0xEfA2...a6B7", gpu: "AMD Instinct MI300X", vram: 128, region: "us-west-2", status: "online", reputation: 215, stake: "5.0 ETH", uptime: "99.9%" },
  { id: "0x1234abcd5678ef90ab", address: "0x1234...90ab", gpu: "NVIDIA RTX 4090 24GB", vram: 24, region: "ap-southeast-1", status: "offline", reputation: 34, stake: "0.8 ETH", uptime: "91.5%" },
];

const REGIONS = ["All", "us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"];

export default function ExploreNodesPage() {
  const [search, setSearch] = React.useState("");
  const [region, setRegion] = React.useState("All");

  const filtered = NODES.filter((n) => {
    const matchSearch = n.address.includes(search) || n.gpu.toLowerCase().includes(search.toLowerCase());
    const matchRegion = region === "All" || n.region === region;
    return matchSearch && matchRegion;
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <PageHeader
        title="Node Registry"
        description="All GPU nodes registered on the Tentrist network"
      />

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by address or GPU model…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-hairline rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-indicator-active"
          />
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="px-3 py-2 bg-bg-surface border border-hairline rounded-lg text-sm text-foreground focus:outline-none"
        >
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {/* Header */}
            <div className="grid grid-cols-7 gap-4 px-6 py-3 text-xs text-foreground-muted uppercase tracking-wider">
              <span>Node</span>
              <span>GPU</span>
              <span>Region</span>
              <span>Status</span>
              <span>Reputation</span>
              <span>Stake</span>
              <span className="text-right">Uptime</span>
            </div>
            {filtered.map((node) => (
              <Link
                key={node.id}
                href={`/explore/nodes/${node.id}`}
                className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-bg-base/30 transition-colors"
              >
                <code className="text-sm font-mono text-foreground">{node.address}</code>
                <span className="text-sm text-foreground">{node.gpu}</span>
                <span className="text-sm text-foreground-muted">{node.region}</span>
                <StatusBadge status={node.status as "online" | "offline" | "stale" | "slashed"} />
                <ReputationBadge score={node.reputation} />
                <span className="text-sm font-mono text-foreground">{node.stake}</span>
                <span className="text-sm font-mono text-foreground text-right">{node.uptime}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
