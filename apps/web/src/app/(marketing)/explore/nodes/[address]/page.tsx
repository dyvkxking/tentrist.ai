"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Wallet, Cpu, TrendingUp, Clock, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { nodesApi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReputationBadge } from "@/components/ui/ReputationBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

export default function NodeProfilePage() {
  const { address } = useParams();

  const { data: node, isLoading } = useQuery({
    queryKey: ["nodes", address],
    queryFn: () => nodesApi.getByWallet(address as string),
    enabled: !!address,
  });

  if (isLoading) {
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
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-foreground-muted text-sm">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!node) {
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
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-foreground-muted text-sm">Node not found</div>
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

  const status = node.status as "online" | "stale" | "offline" | "slashed";
  const registeredAt = new Date(node.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
                <div className="font-mono text-foreground font-semibold">{node.wallet_address}</div>
                <div className="text-sm text-foreground-muted">
                  {node.gpu_model ?? "Unknown GPU"} · {node.location ?? "Unknown region"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={status} />
              <ReputationBadge score={node.reputation_score} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="VRAM" value={`${node.vram_total_mb / 1024} GB`} />
        <MetricCard label="Reputation" value={String(node.reputation_score)} />
        <MetricCard
          label="Jobs Completed"
          value={String(node.total_jobs_completed)}
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          label="Price"
          value={`$${node.price_per_minute_usd.toFixed(4)}/min`}
        />
      </div>

      {/* Performance */}
      <Card className="bg-bg-surface/80">
        <CardHeader><CardTitle>Performance (30d)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "GPU", value: node.gpu_model ?? "Unknown" },
            { label: "VRAM Total", value: `${node.vram_total_mb / 1024} GB` },
            { label: "Location", value: node.location ?? "Unknown" },
            { label: "Jobs Completed", value: String(node.total_jobs_completed) },
            { label: "Registered", value: registeredAt },
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
