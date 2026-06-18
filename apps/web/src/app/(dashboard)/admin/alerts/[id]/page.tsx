"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Server,
  Briefcase,
  Scale,
  Activity,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RequireAuth } from "@/components/providers/require-auth";

type AlertStatus = "triggered" | "acknowledged" | "resolved" | "open";

interface TimelineEntry {
  timestamp: number;
  status: AlertStatus;
  note?: string;
}

function generateMockAlertDetail(id: string) {
  return {
    id,
    type: "Heartbeat Anomaly" as const,
    severity: "Critical" as const,
    nodeId: "node_003",
    jobId: "job_a1b2c3d4",
    message: "Node missed 5 consecutive heartbeat intervals",
    triggeredAt: Date.now() - 5 * 60 * 1000,
    status: "open" as AlertStatus,
    timeline: [
      { timestamp: Date.now() - 5 * 60 * 1000, status: "triggered", note: "Alert triggered by anomaly detection" },
    ] as TimelineEntry[],
    nodeInfo: {
      id: "node_003",
      gpu: "NVIDIA A100 40GB",
      region: "ap-southeast-1",
      operator: "0x3d9dCB725C5B078cC8d2E8a4f4C7bD9e5f6a8b7c",
      reputation: 45,
      stake: 5.0,
    },
    adminNotes: "",
  };
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const severityConfig = {
  Critical: {
    color: "bg-indicator-slashed/10 text-indicator-slashed border-indicator-slashed/30",
    icon: AlertTriangle,
  },
  Warning: {
    color: "bg-indicator-stale/10 text-indicator-stale border-indicator-stale/30",
    icon: Bell,
  },
  Info: {
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: Activity,
  },
};

const typeIcons = {
  "Heartbeat Anomaly": Server,
  "SLA Breach": Scale,
  "Unusual Activity": Activity,
  "Slash Event": AlertTriangle,
};

const timelineConfig: Record<AlertStatus, { color: string; label: string; icon: React.ElementType }> = {
  open: { color: "bg-indicator-slashed", label: "Open", icon: AlertTriangle },
  triggered: { color: "bg-indicator-slashed", label: "Triggered", icon: AlertTriangle },
  acknowledged: { color: "bg-indicator-stale", label: "Acknowledged", icon: Bell },
  resolved: { color: "bg-indicator-active", label: "Resolved", icon: CheckCircle2 },
};

export default function AdminAlertDetailPage() {
  const params = useParams();
  const alertId = params.id as string;

  return (
    <RequireAuth requiredRole="admin">
      <AdminAlertDetailContent alertId={alertId} />
    </RequireAuth>
  );
}

interface AdminAlertDetailContentProps {
  alertId: string;
}

function AdminAlertDetailContent({ alertId }: AdminAlertDetailContentProps) {
  const alert = generateMockAlertDetail(alertId);
  const [adminNotes, setAdminNotes] = React.useState(alert.adminNotes);
  const SeverityIcon = severityConfig[alert.severity].icon;
  const TypeIcon = typeIcons[alert.type];

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/alerts">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {alert.id}
              </h1>
              <Badge className={cn("text-xs", severityConfig[alert.severity].color)}>
                <SeverityIcon className="h-3 w-3 mr-1" />
                {alert.severity}
              </Badge>
              <Badge variant="outline">
                {alert.status}
              </Badge>
            </div>
            <p className="text-sm text-foreground-muted">
              Triggered {formatRelativeTime(alert.triggeredAt)}
            </p>
          </div>
        </div>
        {alert.status === "open" && (
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Acknowledge
          </Button>
        )}
      </div>

      {/* Alert Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {TypeIcon && <TypeIcon className="h-4 w-4 text-foreground-muted" />}
              Alert Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Type</span>
                <span className="text-foreground">{alert.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Severity</span>
                <Badge className={severityConfig[alert.severity].color} size="sm">
                  {alert.severity}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Status</span>
                <Badge variant="outline" size="sm">{alert.status}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Triggered</span>
                <span className="text-foreground">{formatDate(alert.triggeredAt)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-hairline">
              <div className="text-xs text-foreground-muted mb-1">Message</div>
              <div className="p-3 bg-bg-base rounded-lg text-sm">
                {alert.message}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Node/Job Context */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-foreground-muted" />
              Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alert.nodeId && (
              <div>
                <div className="text-xs text-foreground-muted mb-1">Node</div>
                <div className="flex items-center justify-between">
                  <Link href={`/admin/nodes/${alert.nodeId}`}>
                    <span className="text-sm font-mono-data text-indicator-active hover:underline cursor-pointer">
                      {alert.nodeId}
                    </span>
                  </Link>
                  <Badge variant="outline" size="sm">
                    {alert.nodeInfo.gpu}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-foreground-muted">Region:</span>
                    <span className="ml-1 text-foreground">{alert.nodeInfo.region}</span>
                  </div>
                  <div>
                    <span className="text-foreground-muted">Stake:</span>
                    <span className="ml-1 font-mono-data">{alert.nodeInfo.stake.toFixed(1)} ETH</span>
                  </div>
                </div>
              </div>
            )}

            {alert.jobId && (
              <div className="pt-3 border-t border-hairline">
                <div className="text-xs text-foreground-muted mb-1">Job</div>
                <div className="flex items-center justify-between">
                  <Link href={`/admin/jobs/${alert.jobId}`}>
                    <span className="text-sm font-mono-data text-indicator-active hover:underline cursor-pointer">
                      {alert.jobId}
                    </span>
                  </Link>
                </div>
              </div>
            )}

            {!alert.nodeId && !alert.jobId && (
              <div className="text-sm text-foreground-muted text-center py-4">
                No node or job associated with this alert
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-foreground-muted" />
            Status Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alert.timeline.map((entry, index) => {
              const TimelineIcon = timelineConfig[entry.status].icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn("p-1.5 rounded-full", timelineConfig[entry.status].color)}>
                      <TimelineIcon className="h-3 w-3 text-bg-base" />
                    </div>
                    {index < alert.timeline.length - 1 && (
                      <div className="w-px h-8 bg-hairline mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {timelineConfig[entry.status].label}
                      </span>
                      <span className="text-xs text-foreground-muted">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-foreground-muted mt-1">{entry.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      {alert.status !== "resolved" && (
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-foreground-muted" />
              Admin Notes & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Internal Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this alert..."
                className={cn(
                  "w-full h-24 rounded-md border bg-bg-base px-3 py-2 text-sm",
                  "border-border-hairline focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-indicator-active/50"
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              {alert.status === "open" && (
                <Button variant="outline" className="flex-1 gap-2">
                  <Bell className="h-4 w-4" />
                  Acknowledge Alert
                </Button>
              )}
              <Button variant="primary" className="flex-1 gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Resolve Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
