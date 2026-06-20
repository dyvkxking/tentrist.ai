"use client";

import * as React from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Eye,
  FileText,
  Ban,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/providers/require-auth";
import { adminListSlashEvents } from "@/lib/supabase-admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SlashEvent {
  id: string;
  node_id: string;
  job_id: string;
  operator_address: string;
  amount: number;
  reason: string;
  created_at: string;
  status: "pending" | "executed" | "disputed" | "overridden";
  disputed_at?: string;
  resolved_at?: string;
  sla_details?: {
    required_uptime: number;
    actual_uptime: number;
    required_throughput: number;
    actual_throughput: number;
    missed_heartbeats: number;
  };
  tx_hash?: string;
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-indicator-stale/10 text-indicator-stale border-indicator-stale/30",
    icon: Clock,
  },
  executed: {
    label: "Executed",
    color: "bg-indicator-active/10 text-indicator-active border-indicator-active/30",
    icon: CheckCircle2,
  },
  disputed: {
    label: "Disputed",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: Scale,
  },
  overridden: {
    label: "Overridden",
    color: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    icon: Ban,
  },
};

export default function AdminSlashingPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminSlashingContent />
    </RequireAuth>
  );
}

function AdminSlashingContent() {
  const [events, setEvents] = React.useState<SlashEvent[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<SlashEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [showOverrideModal, setShowOverrideModal] = React.useState(false);
  const [overrideReason, setOverrideReason] = React.useState("");

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await adminListSlashEvents();
        setEvents(data as SlashEvent[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load slash events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredEvents = events?.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !event.node_id.toLowerCase().includes(query) &&
        !event.job_id.toLowerCase().includes(query) &&
        !event.operator_address.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (statusFilter && event.status !== statusFilter) return false;
    return true;
  }) ?? [];

  const pendingCount = events?.filter((e) => e.status === "pending").length ?? 0;
  const disputedCount = events?.filter((e) => e.status === "disputed").length ?? 0;
  const totalSlashed = events?.reduce((sum, e) => (e.status === "executed" ? sum + e.amount : sum), 0) ?? 0;

  const openDetailModal = (event: SlashEvent) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const openOverrideModal = (event: SlashEvent) => {
    setSelectedEvent(event);
    setOverrideReason("");
    setShowOverrideModal(true);
  };

  const overrideSlash = () => {
    if (!selectedEvent) return;
    setEvents((prev) =>
      (prev || []).map((e) =>
        e.id === selectedEvent.id
          ? { ...e, status: "overridden" as const, resolvedAt: Date.now() }
          : e
      )
    );
    setShowOverrideModal(false);
    setShowDetailModal(false);
    setSelectedEvent(null);
  };

  const executeSlash = (id: string) => {
    setEvents((prev) =>
      (prev || []).map((e) => (e.id === id ? { ...e, status: "executed" as const } : e))
    );
    setShowDetailModal(false);
    setSelectedEvent(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Slashing Review
          </h1>
          <p className="text-sm text-foreground-muted">
            Audit desk for disputed slash events and manual overrides
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" className="text-sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {pendingCount} pending review
          </Badge>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            {loading ? (
              <div className="h-8 w-12 bg-bg-base rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-semibold font-mono-data">{events?.length ?? 0}</div>
            )}
            <div className="text-xs text-foreground-muted">Total Events</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            {loading ? (
              <div className="h-8 w-12 bg-bg-base rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-semibold font-mono-data text-indicator-stale">
                {pendingCount}
              </div>
            )}
            <div className="text-xs text-foreground-muted">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            {loading ? (
              <div className="h-8 w-12 bg-bg-base rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-semibold font-mono-data text-blue-400">
                {disputedCount}
              </div>
            )}
            <div className="text-xs text-foreground-muted">Disputed</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            {loading ? (
              <div className="h-8 w-16 bg-bg-base rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-semibold font-mono-data text-indicator-slashed">
                {totalSlashed.toFixed(3)} ETH
              </div>
            )}
            <div className="text-xs text-foreground-muted">Total Slashed</div>
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
                placeholder="Search by node ID, job ID, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className={cn(
                  "flex h-9 rounded-md border bg-bg-base px-3 py-2 text-sm",
                  "border-border-hairline focus-visible:outline-none"
                )}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="executed">Executed</option>
                <option value="disputed">Disputed</option>
                <option value="overridden">Overridden</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-indicator-slashed" />
              Slash Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-bg-base rounded animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-sm text-indicator-slashed">{error}</div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-sm text-foreground-muted">
                No slash events found
              </div>
            ) : (
              <div className="divide-y divide-hairline max-h-[600px] overflow-y-auto">
                {filteredEvents.map((event) => {
                  const StatusIcon = statusConfig[event.status].icon;
                  return (
                    <button
                      key={event.id}
                      onClick={() => openDetailModal(event)}
                      className={cn(
                        "w-full text-left p-4 hover:bg-bg-base/50 transition-colors",
                        selectedEvent?.id === event.id && "bg-bg-base/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono-data text-foreground">
                            {event.node_id}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", statusConfig[event.status].color)}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[event.status].label}
                          </Badge>
                        </div>
                        <span className="text-xs font-mono-data text-indicator-slashed">
                          -{event.amount.toFixed(3)} ETH
                        </span>
                      </div>
                      <div className="text-xs text-foreground-muted mb-1 line-clamp-1">
                        {event.reason}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground-muted font-mono-data">
                          {event.job_id}
                        </span>
                        <span className="text-xs text-foreground-muted">
                          {formatRelativeTime(event.created_at)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Detail Panel */}
        <Card className="bg-bg-surface/80">
          {selectedEvent ? (
            <>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">Event Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDetailModal(selectedEvent)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {statusConfig[selectedEvent.status].label} —{" "}
                  {formatRelativeTime(selectedEvent.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Core Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Node ID</span>
                    <span className="font-mono-data text-foreground">
                      {selectedEvent.node_id}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Job ID</span>
                    <span className="font-mono-data text-indicator-active">
                      {selectedEvent.job_id}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Operator</span>
                    <span className="font-mono-data text-foreground text-xs">
                      {selectedEvent.operator_address.slice(0, 8)}...
                      {selectedEvent.operator_address.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Slash Amount</span>
                    <span className="font-mono-data text-indicator-slashed font-semibold">
                      -{selectedEvent.amount.toFixed(3)} ETH
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <span className="text-xs text-foreground-muted mb-1 block">Reason</span>
                  <div className="p-3 bg-bg-base rounded-lg">
                    <span className="text-sm text-foreground">{selectedEvent.reason}</span>
                  </div>
                </div>

                {/* SLA Details */}
                {selectedEvent.sla_details && (
                  <div>
                    <span className="text-xs text-foreground-muted mb-2 block">
                      SLA Breach Details
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-bg-base rounded text-center">
                        <div className="text-xs text-foreground-muted">Uptime</div>
                        <div className="font-mono-data text-sm">
                          {selectedEvent.sla_details.actual_uptime.toFixed(1)}%
                          <span className="text-indicator-slashed text-xs">
                            {" "}
                            / {selectedEvent.sla_details.required_uptime}%
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-bg-base rounded text-center">
                        <div className="text-xs text-foreground-muted">Throughput</div>
                        <div className="font-mono-data text-sm">
                          {selectedEvent.sla_details.actual_throughput}
                          <span className="text-indicator-slashed text-xs">
                            {" "}
                            / {selectedEvent.sla_details.required_throughput}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-bg-base rounded text-center col-span-2">
                        <div className="text-xs text-foreground-muted">Missed Heartbeats</div>
                        <div className="font-mono-data text-indicator-slashed">
                          {selectedEvent.sla_details.missed_heartbeats}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Created</span>
                    <span className="text-foreground">{formatDate(selectedEvent.created_at)}</span>
                  </div>
                  {selectedEvent.disputed_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Disputed</span>
                      <span className="text-blue-400">{formatDate(selectedEvent.disputed_at)}</span>
                    </div>
                  )}
                  {selectedEvent.resolved_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Resolved</span>
                      <span className="text-amber-400">{formatDate(selectedEvent.resolved_at)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedEvent.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => openOverrideModal(selectedEvent)}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Override
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => executeSlash(selectedEvent.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                  </div>
                )}

                {/* Transaction Link */}
                {selectedEvent.tx_hash && (
                  <a
                    href={`https://etherscan.io/tx/${selectedEvent.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground border-border-hairline hover:bg-bg-surface hover:border-zinc-700 h-9 px-3 text-xs gap-1.5 transition-all w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View on Etherscan
                  </a>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="py-16 text-center">
              <Shield className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
              <p className="text-sm text-foreground-muted">
                Select an event to view details
              </p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indicator-slashed" />
              Slash Event Details
            </DialogTitle>
            <DialogDescription>
              Full audit trail for event {selectedEvent?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground-muted mb-1">Node ID</div>
                  <div className="font-mono-data text-sm bg-bg-base p-2 rounded">
                    {selectedEvent.node_id}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground-muted mb-1">Job ID</div>
                  <div className="font-mono-data text-sm bg-bg-base p-2 rounded text-indicator-active">
                    {selectedEvent.job_id}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground-muted mb-1">Operator Address</div>
                <div className="font-mono-data text-xs bg-bg-base p-2 rounded break-all">
                  {selectedEvent.operator_address}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground-muted mb-1">Amount</div>
                  <div className="font-mono-data text-lg text-indicator-slashed">
                    -{selectedEvent.amount.toFixed(3)} ETH
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground-muted mb-1">Status</div>
                  <Badge variant="outline" className={cn("mt-1", statusConfig[selectedEvent.status].color)}>
                    {statusConfig[selectedEvent.status].label}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground-muted mb-1">Reason</div>
                <div className="text-sm bg-bg-base p-3 rounded">{selectedEvent.reason}</div>
              </div>
              {selectedEvent.sla_details && (
                <div>
                  <div className="text-xs text-foreground-muted mb-2">SLA Metrics</div>
                  <div className="bg-bg-base rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span className="font-mono-data">
                        {selectedEvent.sla_details.actual_uptime.toFixed(1)}% /{" "}
                        {selectedEvent.sla_details.required_uptime}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Throughput</span>
                      <span className="font-mono-data">
                        {selectedEvent.sla_details.actual_throughput} /{" "}
                        {selectedEvent.sla_details.required_throughput}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Missed Heartbeats</span>
                      <span className="font-mono-data text-indicator-slashed">
                        {selectedEvent.sla_details.missed_heartbeats}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-xs text-foreground-muted">
                Timestamp: {formatDate(selectedEvent.created_at)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
            {selectedEvent?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailModal(false);
                    openOverrideModal(selectedEvent);
                  }}
                >
                  Override
                </Button>
                <Button onClick={() => executeSlash(selectedEvent!.id)}>
                  Confirm Slash
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override Confirmation Modal */}
      <Dialog open={showOverrideModal} onOpenChange={setShowOverrideModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-amber-400" />
              Override Slash Event
            </DialogTitle>
            <DialogDescription>
              This action will prevent the slash from being executed. Provide a reason for the
              override. This will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-lg">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warning
                </div>
                <p className="text-xs text-foreground-muted">
                  Overriding slash event {selectedEvent.id} for node {selectedEvent.node_id}. This
                  will credit {selectedEvent.amount.toFixed(3)} ETH back to the node operator.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Override Reason (Required)
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Enter administrative reason for override..."
                  className={cn(
                    "w-full h-24 rounded-md border bg-bg-base px-3 py-2 text-sm",
                    "border-border-hairline focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-indicator-active/50"
                  )}
                />
                <p className="text-xs text-foreground-muted mt-1">
                  This reason will be recorded in the audit log.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOverrideModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={overrideSlash}
              disabled={!overrideReason.trim()}
            >
              Confirm Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
