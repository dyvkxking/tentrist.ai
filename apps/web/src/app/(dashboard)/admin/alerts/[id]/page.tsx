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
import { adminGetAlert } from "@/lib/supabase-admin";

type AlertStatus = "triggered" | "acknowledged" | "resolved" | "open";

interface TimelineEntry {
  timestamp: number;
  status: AlertStatus;
  note?: string;
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
  const [alert, setAlert] = React.useState<Record<string, any> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [adminNotes, setAdminNotes] = React.useState("");

  React.useEffect(() => {
    adminGetAlert(alertId)
      .then(setAlert)
      .catch((err) => setError(err.message));
  }, [alertId]);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-lg border border-indicator-slashed/30 bg-indicator-slashed/10 text-indicator-slashed text-sm">
          Failed to load alert: {error}
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 animate-pulse rounded-md bg-bg-surface" />
            <div className="flex flex-col gap-2">
              <div className="h-8 w-48 animate-pulse rounded-md bg-bg-surface" />
              <div className="h-4 w-32 animate-pulse rounded-md bg-bg-surface" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-bg-surface/80">
            <CardContent className="p-4">
              <div className="h-6 w-32 animate-pulse rounded-md bg-bg-surface" />
              <div className="mt-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 w-full animate-pulse rounded-md bg-bg-surface" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-bg-surface/80">
            <CardContent className="p-4">
              <div className="h-6 w-32 animate-pulse rounded-md bg-bg-surface" />
              <div className="mt-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 w-full animate-pulse rounded-md bg-bg-surface" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const SeverityIcon = severityConfig[alert.severity as keyof typeof severityConfig]?.icon || AlertTriangle;
  const TypeIcon = typeIcons[alert.type as keyof typeof typeIcons] || Server;

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
              <Badge className={cn("text-xs", severityConfig[alert.severity as keyof typeof severityConfig]?.color || "bg-indicator-slashed/10 text-indicator-slashed border-indicator-slashed/30")}>
                <SeverityIcon className="h-3 w-3 mr-1" />
                {alert.severity}
              </Badge>
              <Badge variant="outline">
                {alert.status}
              </Badge>
            </div>
            <p className="text-sm text-foreground-muted">
              Triggered {formatRelativeTime(new Date(alert.created_at).getTime())}
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
                <Badge className={severityConfig[alert.severity as keyof typeof severityConfig]?.color || "bg-indicator-slashed/10 text-indicator-slashed border-indicator-slashed/30"} size="sm">
                  {alert.severity}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Status</span>
                <Badge variant="outline" size="sm">{alert.status}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Triggered</span>
                <span className="text-foreground">{formatDate(new Date(alert.created_at).getTime())}</span>
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
            {alert.node_id && (
              <div>
                <div className="text-xs text-foreground-muted mb-1">Node</div>
                <div className="flex items-center justify-between">
                  <Link href={`/admin/nodes/${alert.node_id}`}>
                    <span className="text-sm font-mono-data text-indicator-active hover:underline cursor-pointer">
                      {alert.node_id}
                    </span>
                  </Link>
                  <Badge variant="outline" size="sm">
                    {alert.node_id}
                  </Badge>
                </div>
              </div>
            )}

            {alert.job_id && (
              <div className="pt-3 border-t border-hairline">
                <div className="text-xs text-foreground-muted mb-1">Job</div>
                <div className="flex items-center justify-between">
                  <Link href={`/admin/jobs/${alert.job_id}`}>
                    <span className="text-sm font-mono-data text-indicator-active hover:underline cursor-pointer">
                      {alert.job_id}
                    </span>
                  </Link>
                </div>
              </div>
            )}

            {!alert.node_id && !alert.job_id && (
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
            {(alert.timeline || []).map((entry: TimelineEntry, index: number) => {
              const TimelineIcon = timelineConfig[entry.status as AlertStatus]?.icon || AlertTriangle;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn("p-1.5 rounded-full", timelineConfig[entry.status as AlertStatus]?.color || "bg-indicator-slashed")}>
                      <TimelineIcon className="h-3 w-3 text-bg-base" />
                    </div>
                    {index < (alert.timeline?.length || 0) - 1 && (
                      <div className="w-px h-8 bg-hairline mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        {timelineConfig[entry.status as AlertStatus]?.label || entry.status}
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
