"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, AlertTriangle, Info, XCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useJobLogs } from "@/hooks/use-jobs";

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const levelConfig = {
  info: { icon: Info, color: "text-indicator-active", bg: "bg-indicator-active/10", dot: "bg-indicator-active" },
  warn: { icon: AlertTriangle, color: "text-indicator-stale", bg: "bg-indicator-stale/10", dot: "bg-indicator-stale" },
  error: { icon: XCircle, color: "text-indicator-slashed", bg: "bg-indicator-slashed/10", dot: "bg-indicator-slashed" },
  debug: { icon: Clock, color: "text-foreground-muted", bg: "bg-bg-surface", dot: "bg-foreground-muted" },
};

export default function JobEventsPage() {
  const { id } = useParams();
  const { data: logs, isLoading } = useJobLogs(id as string);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader
        title="Event Timeline"
        description="Chronological event log for this job"
        breadcrumbs={[
          { label: "Jobs", href: "/dashboard/jobs" },
          { label: (id as string).slice(0, 8), href: `/dashboard/jobs/${id}` },
          { label: "Events" },
        ]}
      />

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Event Stream</CardTitle>
            <span className="text-xs text-foreground-muted font-mono">
              {logs?.length ?? 0} events
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-foreground-muted">Loading events…</div>
          ) : logs && logs.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto">
              {logs.map((log, i) => {
                const cfg = levelConfig[log.level];
                const Icon = cfg.icon;
                return (
                  <div
                    key={log.id}
                    className={cn("flex items-start gap-3 px-4 py-3 border-b border-hairline/50 hover:bg-bg-base/30 transition-colors", cfg.bg)}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5", cfg.dot)} />
                    </div>
                    <div className="shrink-0 mt-0.5">
                      <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-xs font-medium uppercase tracking-wider", cfg.color)}>
                          {log.level}
                        </span>
                        <span className="text-xs font-mono text-foreground-muted shrink-0">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-0.5 break-all">{log.message}</p>
                      {log.nodeId && (
                        <code className="text-xs font-mono text-foreground-muted mt-1">
                          node: {log.nodeId}
                        </code>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-foreground-muted text-sm">No events recorded.</div>
          )}
        </CardContent>
      </Card>

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
