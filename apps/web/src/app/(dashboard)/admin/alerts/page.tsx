"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  AlertTriangle,
  Bell,
  Eye,
  CheckCircle2,
  Clock,
  Server,
  Briefcase,
  Scale,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/providers/require-auth";
import { adminListAlerts } from "@/lib/supabase-admin";

interface Alert {
  id: string;
  type: "Heartbeat Anomaly" | "SLA Breach" | "Unusual Activity" | "Slash Event";
  severity: "Critical" | "Warning" | "Info";
  node_id?: string;
  job_id?: string;
  message: string;
  created_at: string;
  status: "open" | "acknowledged" | "resolved";
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

const statusConfig = {
  open: { label: "Open", color: "bg-indicator-slashed/10 text-indicator-slashed border-indicator-slashed/30", icon: AlertTriangle },
  acknowledged: { label: "Acknowledged", color: "bg-indicator-stale/10 text-indicator-stale border-indicator-stale/30", icon: Bell },
  resolved: { label: "Resolved", color: "bg-indicator-active/10 text-indicator-active border-indicator-active/30", icon: CheckCircle2 },
};

export default function AdminAlertsPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminAlertsContent />
    </RequireAuth>
  );
}

function AdminAlertsContent() {
  const [alerts, setAlerts] = React.useState<Alert[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState<string | null>(null);

  React.useEffect(() => {
    adminListAlerts()
      .then(setAlerts)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-lg border border-indicator-slashed/30 bg-indicator-slashed/10 text-indicator-slashed text-sm">
          Failed to load alerts: {error}
        </div>
      </div>
    );
  }

  if (!alerts) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="h-8 w-48 animate-pulse rounded-md bg-bg-surface" />
            <div className="h-4 w-64 animate-pulse rounded-md bg-bg-surface" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-bg-surface/80">
              <CardContent className="p-4">
                <div className="h-8 w-12 animate-pulse rounded-md bg-bg-surface" />
                <div className="mt-2 h-3 w-20 animate-pulse rounded-md bg-bg-surface" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border-b border-hairline">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-bg-surface" />
                <div className="flex-1">
                  <div className="h-4 w-32 animate-pulse rounded-md bg-bg-surface" />
                  <div className="mt-2 h-3 w-48 animate-pulse rounded-md bg-bg-surface" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !alert.id.toLowerCase().includes(query) &&
        !alert.node_id?.toLowerCase().includes(query) &&
        !alert.job_id?.toLowerCase().includes(query) &&
        !alert.message.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (severityFilter && alert.severity !== severityFilter) return false;
    return true;
  });

  const openCount = alerts.filter((a) => a.status === "open").length;
  const criticalCount = alerts.filter((a) => a.severity === "Critical" && a.status === "open").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Anomaly Alerts
          </h1>
          <p className="text-sm text-foreground-muted">
            System monitoring alerts and anomaly detection — {filteredAlerts.length} alerts
          </p>
        </div>
        {criticalCount > 0 && (
          <Badge variant="danger" className="text-sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {criticalCount} critical
          </Badge>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data">{alerts.length}</div>
            <div className="text-xs text-foreground-muted">Total Alerts</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-slashed">
              {openCount}
            </div>
            <div className="text-xs text-foreground-muted">Open</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-stale">
              {alerts.filter((a) => a.status === "acknowledged").length}
            </div>
            <div className="text-xs text-foreground-muted">Acknowledged</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-active">
              {alerts.filter((a) => a.status === "resolved").length}
            </div>
            <div className="text-xs text-foreground-muted">Resolved</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                type="search"
                placeholder="Search by alert ID, node ID, job ID, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={severityFilter || ""}
                onChange={(e) => setSeverityFilter(e.target.value || null)}
                className={cn(
                  "flex h-9 rounded-md border bg-bg-base px-3 py-2 text-sm",
                  "border-border-hairline focus-visible:outline-none"
                )}
              >
                <option value="">All Severity</option>
                <option value="Critical">Critical</option>
                <option value="Warning">Warning</option>
                <option value="Info">Info</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {filteredAlerts.map((alert) => {
              const TypeIcon = typeIcons[alert.type];
              const SeverityIcon = severityConfig[alert.severity].icon;
              const StatusIcon = statusConfig[alert.status].icon;
              return (
                <div key={alert.id} className="flex items-start gap-4 p-4 hover:bg-bg-base/50 transition-colors">
                  <div className={cn("p-2 rounded-lg", severityConfig[alert.severity].color)}>
                    <SeverityIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono-data text-foreground-muted">{alert.id}</span>
                      <Badge variant="outline" size="sm">
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {alert.type}
                      </Badge>
                      <Badge className={cn("text-xs", severityConfig[alert.severity].color)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground mb-1">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-foreground-muted">
                      {alert.node_id && (
                        <Link href={`/admin/nodes/${alert.node_id}`}>
                          <span className="text-indicator-active hover:underline">
                            {alert.node_id}
                          </span>
                        </Link>
                      )}
                      {alert.job_id && (
                        <Link href={`/admin/jobs/${alert.job_id}`}>
                          <span className="text-indicator-active hover:underline">
                            {alert.job_id}
                          </span>
                        </Link>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(new Date(alert.created_at).getTime())}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", statusConfig[alert.status].color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[alert.status].label}
                    </Badge>
                    <Link href={`/admin/alerts/${alert.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
