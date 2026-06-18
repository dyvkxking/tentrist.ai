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
  nodeId: string;
  jobId: string;
  operatorAddress: string;
  amount: number;
  reason: string;
  timestamp: number;
  status: "pending" | "executed" | "disputed" | "overridden";
  disputedAt?: number;
  resolvedAt?: number;
  slaDetails?: {
    requiredUptime: number;
    actualUptime: number;
    requiredThroughput: number;
    actualThroughput: number;
    missedHeartbeats: number;
  };
  txHash?: string;
}

function generateMockSlashEvents(): SlashEvent[] {
  return [
    {
      id: "slash_001",
      nodeId: "node_0087",
      jobId: "job_a1b2c3d4",
      operatorAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      amount: 0.45,
      reason: "SLA breach: missed heartbeat intervals",
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      status: "pending",
      slaDetails: {
        requiredUptime: 95,
        actualUptime: 87.3,
        requiredThroughput: 100,
        actualThroughput: 78,
        missedHeartbeats: 12,
      },
      txHash: "0xabc123...def456",
    },
    {
      id: "slash_002",
      nodeId: "node_0142",
      jobId: "job_e5f6g7h8",
      operatorAddress: "0x862964cE01621d2F447D1A4d5d7dE0286FA8918f",
      amount: 0.32,
      reason: "VRAM exceeded 95% threshold",
      timestamp: Date.now() - 5 * 60 * 60 * 1000,
      status: "pending",
      slaDetails: {
        requiredUptime: 98,
        actualUptime: 91.2,
        requiredThroughput: 150,
        actualThroughput: 142,
        missedHeartbeats: 3,
      },
      txHash: "0x789xyz...abc123",
    },
    {
      id: "slash_003",
      nodeId: "node_0203",
      jobId: "job_i9j0k1l2",
      operatorAddress: "0x3d9dCB725C5B078cC8d2E8a4f4C7bD9e5f6a8b7c",
      amount: 0.78,
      reason: "Latency SLA breach: avg 350ms > 200ms target",
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      status: "executed",
      slaDetails: {
        requiredUptime: 95,
        actualUptime: 88.5,
        requiredThroughput: 100,
        actualThroughput: 95,
        missedHeartbeats: 5,
      },
      txHash: "0xdef456...ghi789",
    },
    {
      id: "slash_004",
      nodeId: "node_0056",
      jobId: "job_m3n4o5p6",
      operatorAddress: "0xfedc0987654321abcdef0123456789abcdef0123",
      amount: 0.21,
      reason: "Missed checkpoint deadlines",
      timestamp: Date.now() - 48 * 60 * 60 * 1000,
      status: "disputed",
      disputedAt: Date.now() - 24 * 60 * 60 * 1000,
      slaDetails: {
        requiredUptime: 95,
        actualUptime: 92.1,
        requiredThroughput: 80,
        actualThroughput: 79,
        missedHeartbeats: 8,
      },
    },
    {
      id: "slash_005",
      nodeId: "node_0099",
      jobId: "job_q7r8s9t0",
      operatorAddress: "0x2468ace13579bdfc0246f8db9310019283746fab",
      amount: 0.55,
      reason: "SLA breach: uptime 87% < 95% required",
      timestamp: Date.now() - 72 * 60 * 60 * 1000,
      status: "overridden",
      resolvedAt: Date.now() - 48 * 60 * 60 * 1000,
      slaDetails: {
        requiredUptime: 95,
        actualUptime: 87.0,
        requiredThroughput: 100,
        actualThroughput: 92,
        missedHeartbeats: 15,
      },
      txHash: "0x111222...333444",
    },
  ];
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function formatDate(timestamp: number): string {
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
  const [events, setEvents] = React.useState<SlashEvent[]>(generateMockSlashEvents());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<SlashEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [showOverrideModal, setShowOverrideModal] = React.useState(false);
  const [overrideReason, setOverrideReason] = React.useState("");

  const filteredEvents = events.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !event.nodeId.toLowerCase().includes(query) &&
        !event.jobId.toLowerCase().includes(query) &&
        !event.operatorAddress.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (statusFilter && event.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = events.filter((e) => e.status === "pending").length;
  const disputedCount = events.filter((e) => e.status === "disputed").length;
  const totalSlashed = events.reduce((sum, e) => (e.status === "executed" ? sum + e.amount : sum), 0);

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
      prev.map((e) =>
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
      prev.map((e) => (e.id === id ? { ...e, status: "executed" as const } : e))
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
            <div className="text-2xl font-semibold font-mono-data">{events.length}</div>
            <div className="text-xs text-foreground-muted">Total Events</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-stale">
              {pendingCount}
            </div>
            <div className="text-xs text-foreground-muted">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-blue-400">
              {disputedCount}
            </div>
            <div className="text-xs text-foreground-muted">Disputed</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-slashed">
              {totalSlashed.toFixed(3)} ETH
            </div>
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
                          {event.nodeId}
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
                        {event.jobId}
                      </span>
                      <span className="text-xs text-foreground-muted">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
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
                  {formatRelativeTime(selectedEvent.timestamp)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Core Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Node ID</span>
                    <span className="font-mono-data text-foreground">
                      {selectedEvent.nodeId}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Job ID</span>
                    <span className="font-mono-data text-indicator-active">
                      {selectedEvent.jobId}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Operator</span>
                    <span className="font-mono-data text-foreground text-xs">
                      {selectedEvent.operatorAddress.slice(0, 8)}...
                      {selectedEvent.operatorAddress.slice(-6)}
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
                {selectedEvent.slaDetails && (
                  <div>
                    <span className="text-xs text-foreground-muted mb-2 block">
                      SLA Breach Details
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-bg-base rounded text-center">
                        <div className="text-xs text-foreground-muted">Uptime</div>
                        <div className="font-mono-data text-sm">
                          {selectedEvent.slaDetails.actualUptime.toFixed(1)}%
                          <span className="text-indicator-slashed text-xs">
                            {" "}
                            / {selectedEvent.slaDetails.requiredUptime}%
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-bg-base rounded text-center">
                        <div className="text-xs text-foreground-muted">Throughput</div>
                        <div className="font-mono-data text-sm">
                          {selectedEvent.slaDetails.actualThroughput}
                          <span className="text-indicator-slashed text-xs">
                            {" "}
                            / {selectedEvent.slaDetails.requiredThroughput}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-bg-base rounded text-center col-span-2">
                        <div className="text-xs text-foreground-muted">Missed Heartbeats</div>
                        <div className="font-mono-data text-indicator-slashed">
                          {selectedEvent.slaDetails.missedHeartbeats}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Created</span>
                    <span className="text-foreground">{formatDate(selectedEvent.timestamp)}</span>
                  </div>
                  {selectedEvent.disputedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Disputed</span>
                      <span className="text-blue-400">{formatDate(selectedEvent.disputedAt)}</span>
                    </div>
                  )}
                  {selectedEvent.resolvedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-muted">Resolved</span>
                      <span className="text-amber-400">{formatDate(selectedEvent.resolvedAt)}</span>
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
                {selectedEvent.txHash && (
                  <a
                    href={`https://etherscan.io/tx/${selectedEvent.txHash}`}
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
                    {selectedEvent.nodeId}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-foreground-muted mb-1">Job ID</div>
                  <div className="font-mono-data text-sm bg-bg-base p-2 rounded text-indicator-active">
                    {selectedEvent.jobId}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground-muted mb-1">Operator Address</div>
                <div className="font-mono-data text-xs bg-bg-base p-2 rounded break-all">
                  {selectedEvent.operatorAddress}
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
              {selectedEvent.slaDetails && (
                <div>
                  <div className="text-xs text-foreground-muted mb-2">SLA Metrics</div>
                  <div className="bg-bg-base rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span className="font-mono-data">
                        {selectedEvent.slaDetails.actualUptime.toFixed(1)}% /{" "}
                        {selectedEvent.slaDetails.requiredUptime}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Throughput</span>
                      <span className="font-mono-data">
                        {selectedEvent.slaDetails.actualThroughput} /{" "}
                        {selectedEvent.slaDetails.requiredThroughput}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Missed Heartbeats</span>
                      <span className="font-mono-data text-indicator-slashed">
                        {selectedEvent.slaDetails.missedHeartbeats}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-xs text-foreground-muted">
                Timestamp: {formatDate(selectedEvent.timestamp)}
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
                  Overriding slash event {selectedEvent.id} for node {selectedEvent.nodeId}. This
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
