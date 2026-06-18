"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Cpu, Wifi, WifiOff, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/shared/page-header";
import { LiveIndicator } from "@/components/shared/live-indicator";
import { useNodeAssignments } from "@/hooks/use-jobs";

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export default function JobNodesPage() {
  const { id } = useParams();
  const { data: assignments, isLoading } = useNodeAssignments(id as string);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader
        title="Assigned Nodes"
        description={`Nodes assigned to job ${(id as string).slice(0, 8)}…`}
        breadcrumbs={[
          { label: "Jobs", href: "/dashboard/jobs" },
          { label: (id as string).slice(0, 8), href: `/dashboard/jobs/${id}` },
          { label: "Nodes" },
        ]}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-bg-surface/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : assignments && assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((node) => {
            const vramPct = (node.vramUsed / node.vramTotal) * 100;
            return (
              <Card key={node.nodeId} className="bg-bg-surface/80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <LiveIndicator status={node.status === "processing" ? "connected" : "disconnected"} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono text-foreground">{node.address}</code>
                          <StatusBadge status={node.status === "completed" ? "completed" : node.status === "failed" ? "failed" : node.status === "processing" ? "running" : "pending"} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-foreground-muted">
                          <span className="flex items-center gap-1">
                            <Cpu className="h-3 w-3" />
                            {node.vramTotal}GB VRAM
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last heartbeat {formatRelativeTime(node.lastHeartbeat)}
                          </span>
                        </div>
                        {/* VRAM bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-bg-base rounded-full overflow-hidden max-w-[200px]">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                vramPct > 90 ? "bg-indicator-slashed" : vramPct > 75 ? "bg-indicator-stale" : "bg-indicator-active"
                              )}
                              style={{ width: `${vramPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-foreground-muted">
                            {node.vramUsed}/{node.vramTotal} GB
                          </span>
                        </div>
                        {/* Progress */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-bg-base rounded-full overflow-hidden max-w-[200px]">
                            <div
                              className="h-full bg-indicator-active rounded-full"
                              style={{ width: `${node.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-foreground-muted">{node.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/nodes/${node.nodeId}`}>
                      <Button variant="ghost" size="sm">View Node</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-bg-surface/80">
          <CardContent className="p-8 text-center">
            <p className="text-foreground-muted">No nodes assigned to this job yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-start">
        <Link href={`/dashboard/jobs/${id}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job
          </Button>
        </Link>
      </div>
    </div>
  );
}
