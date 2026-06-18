"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Server,
  Cpu,
  HardDrive,
  Globe,
  Wifi,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReputationBadge, getReputationTier } from "@/components/ui/ReputationBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { useNode } from "@/hooks/use-nodes";
import type { NodeProvider } from "@/hooks/use-nodes";
import { useNodeUpdates } from "@/hooks/use-sse-node";

// Types
interface HeartbeatSlot {
  timestamp: number;
  status: "ok" | "vramm_warn" | "vramm_critical" | "latency_warn" | "latency_critical" | "missed";
  vramUsed: number;
  vramTotal: number;
  latencyMs: number;
}

interface CompletedTask {
  id: string;
  jobId: string;
  completedAt: number;
  duration: number;
  vramUsed: number;
  checkpointRef: string;
}

interface SlashingEvent {
  id: string;
  timestamp: number;
  reason: string;
  amount: number;
  refunded: boolean;
}

// Mock data generators
function generateHeartbeatSlots(count: number = 288): HeartbeatSlot[] {
  // 288 slots = 24 hours at 5-minute intervals
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const timestamp = now - (count - i) * 5 * 60 * 1000;
    const vramUsed = Math.floor(Math.random() * 80);
    const vramTotal = 80;
    const latencyMs = Math.floor(Math.random() * 400) + 10;

    let status: HeartbeatSlot["status"] = "ok";
    const vramPct = (vramUsed / vramTotal) * 100;

    if (Math.random() < 0.02) {
      status = "missed";
    } else if (vramPct > 95) {
      status = "vramm_critical";
    } else if (vramPct > 85) {
      status = "vramm_warn";
    } else if (latencyMs > 300) {
      status = "latency_critical";
    } else if (latencyMs > 150) {
      status = "latency_warn";
    }

    return { timestamp, status, vramUsed, vramTotal, latencyMs };
  });
}

function generateCompletedTasks(count: number = 15): CompletedTask[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `task_${i.toString().padStart(4, "0")}`,
    jobId: `job_${Math.random().toString(36).slice(2, 10)}`,
    completedAt: Date.now() - i * 3600000 * Math.random() * 12,
    duration: Math.floor(Math.random() * 3600) + 300,
    vramUsed: Math.floor(Math.random() * 80),
    checkpointRef: `chk_${Math.random().toString(36).slice(2, 8)}`,
  }));
}

function generateSlashingEvents(count: number = 5): SlashingEvent[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `slash_${i.toString().padStart(3, "0")}`,
    timestamp: Date.now() - i * 86400000 * Math.random() * 7,
    reason: ["SLA breach", "Missed heartbeats", "VRAM overflow", "Latency timeout"][
      Math.floor(Math.random() * 4)
    ],
    amount: Math.random() * 2 + 0.1,
    refunded: Math.random() > 0.5,
  }));
}

// Format relative time
function formatRelativeTime(date: number): string {
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Format timestamp
function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// Heartbeat slot colors
const slotColors: Record<HeartbeatSlot["status"], string> = {
  ok: "bg-indicator-active",
  vramm_warn: "bg-indicator-stale",
  vramm_critical: "bg-indicator-slashed",
  latency_warn: "bg-blue-500",
  latency_critical: "bg-purple-600",
  missed: "bg-zinc-800",
};

// Hardware Specs Module
function HardwareSpecsModule({ node }: { node: NodeProvider }) {
  const vramPercentage = (node.vramUsed / node.vramTotal) * 100;

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {/* CPU */}
      <div className="p-3 bg-bg-base/50 rounded-lg border border-hairline">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-4 w-4 text-blue-400" />
          <span className="text-xs text-foreground-muted uppercase tracking-wider">
            CPU
          </span>
        </div>
        <div className="text-sm font-mono-data text-foreground truncate mb-1">
          {node.cpuModel}
        </div>
        <div className="text-xs text-foreground-muted font-mono-data">
          {node.cpuCores} cores
        </div>
      </div>

      {/* VRAM */}
      <div className="p-3 bg-bg-base/50 rounded-lg border border-hairline">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="h-4 w-4 text-indicator-active" />
          <span className="text-xs text-foreground-muted uppercase tracking-wider">
            VRAM
          </span>
        </div>
        <div className="text-sm font-mono-data text-foreground mb-1">
          {node.vramUsed}GB / {node.vramTotal}GB
        </div>
        <div className="h-1.5 bg-bg-base rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              vramPercentage > 90
                ? "bg-indicator-slashed"
                : vramPercentage > 75
                ? "bg-indicator-stale"
                : "bg-indicator-active"
            )}
            style={{ width: `${vramPercentage}%` }}
          />
        </div>
      </div>

      {/* Region */}
      <div className="p-3 bg-bg-base/50 rounded-lg border border-hairline">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-indicator-stale" />
          <span className="text-xs text-foreground-muted uppercase tracking-wider">
            Region
          </span>
        </div>
        <div className="text-sm font-mono-data text-foreground">
          {node.region}
        </div>
      </div>

      {/* Uptime */}
      <div className="p-3 bg-bg-base/50 rounded-lg border border-hairline">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-indicator-active" />
          <span className="text-xs text-foreground-muted uppercase tracking-wider">
            Uptime
          </span>
        </div>
        <div className="text-sm font-mono-data text-foreground">
          {node.uptime}%
        </div>
      </div>
    </div>
  );
}

// Heartbeat Health Timeline
function HeartbeatHealthTimeline({ slots }: { slots: HeartbeatSlot[] }) {
  const [hoveredSlot, setHoveredSlot] = React.useState<HeartbeatSlot | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseEnter = (slot: HeartbeatSlot, e: React.MouseEvent) => {
    setHoveredSlot(slot);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  // Group slots by hour for better visualization
  const hourlySlots = React.useMemo(() => {
    const groups: HeartbeatSlot[][] = [];
    let currentHour = -1;
    let currentGroup: HeartbeatSlot[] = [];

    slots.forEach((slot) => {
      const hour = new Date(slot.timestamp).getHours();
      if (hour !== currentHour) {
        if (currentGroup.length > 0) groups.push(currentGroup);
        currentGroup = [slot];
        currentHour = hour;
      } else {
        currentGroup.push(slot);
      }
    });
    if (currentGroup.length > 0) groups.push(currentGroup);

    return groups;
  }, [slots]);

  // Calculate health score
  const healthScore = React.useMemo(() => {
    const okCount = slots.filter((s) => s.status === "ok").length;
    return Math.round((okCount / slots.length) * 100);
  }, [slots]);

  // Status legend counts
  const statusCounts = React.useMemo(() => {
    return slots.reduce(
      (acc, slot) => {
        acc[slot.status] = (acc[slot.status] || 0) + 1;
        return acc;
      },
      {} as Record<HeartbeatSlot["status"], number>
    );
  }, [slots]);

  return (
    <div className="space-y-3">
      {/* Legend and stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-indicator-active" />
            <span className="text-foreground-muted">
              OK <span className="font-mono-data text-foreground">{statusCounts.ok || 0}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-indicator-stale" />
            <span className="text-foreground-muted">
              VRAM Warn <span className="font-mono-data text-foreground">{statusCounts.vramm_warn || 0}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-indicator-slashed" />
            <span className="text-foreground-muted">
              VRAM Crit <span className="font-mono-data text-foreground">{statusCounts.vramm_critical || 0}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-blue-500" />
            <span className="text-foreground-muted">
              Latency <span className="font-mono-data text-foreground">{(statusCounts.latency_warn || 0) + (statusCounts.latency_critical || 0)}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-zinc-800" />
            <span className="text-foreground-muted">
              Missed <span className="font-mono-data text-foreground">{statusCounts.missed || 0}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-muted">Health:</span>
          <span
            className={cn(
              "text-sm font-mono-data font-semibold",
              healthScore >= 95
                ? "text-indicator-active"
                : healthScore >= 80
                ? "text-indicator-stale"
                : "text-indicator-slashed"
            )}
          >
            {healthScore}%
          </span>
        </div>
      </div>

      {/* Timeline grid */}
      <div className="relative">
        <div className="flex gap-px overflow-x-auto pb-2">
          {slots.map((slot, i) => (
            <button
              key={i}
              className={cn(
                "w-1.5 h-6 rounded-sm transition-all hover:scale-y-125 flex-shrink-0",
                slotColors[slot.status]
              )}
              onMouseEnter={(e) => handleMouseEnter(slot, e)}
              onMouseLeave={() => setHoveredSlot(null)}
            />
          ))}
        </div>

        {/* Hour markers */}
        <div className="flex justify-between text-[10px] font-mono-data text-foreground-muted mt-1">
          {hourlySlots.map((group, i) => {
            if (i % 4 === 0) {
              return (
                <span key={i}>
                  {formatTimestamp(group[0].timestamp)}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSlot && (
        <div
          className="fixed z-50 px-3 py-2 bg-bg-surface border border-hairline rounded-lg shadow-xl pointer-events-none"
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y + 10 }}
        >
          <div className="text-xs font-mono-data text-foreground-muted mb-1">
            {new Date(hoveredSlot.timestamp).toLocaleString()}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-foreground-muted">Status:</span>
              <span
                className={cn(
                  "font-medium capitalize",
                  hoveredSlot.status === "ok" && "text-indicator-active",
                  hoveredSlot.status.includes("vramm") && "text-indicator-stale",
                  hoveredSlot.status.includes("latency") && "text-blue-400",
                  hoveredSlot.status === "missed" && "text-zinc-500"
                )}
              >
                {hoveredSlot.status.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-foreground-muted">VRAM:</span>
              <span className="font-mono-data text-foreground">
                {hoveredSlot.vramUsed}GB / {hoveredSlot.vramTotal}GB
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-foreground-muted">Latency:</span>
              <span
                className={cn(
                  "font-mono-data",
                  hoveredSlot.latencyMs < 100
                    ? "text-indicator-active"
                    : hoveredSlot.latencyMs < 200
                    ? "text-indicator-stale"
                    : "text-indicator-slashed"
                )}
              >
                {hoveredSlot.latencyMs}ms
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Completed Tasks Table
function CompletedTasksTable({ tasks }: { tasks: CompletedTask[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th className="text-left px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Task ID
            </th>
            <th className="text-left px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Job
            </th>
            <th className="text-left px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Completed
            </th>
            <th className="text-right px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Duration
            </th>
            <th className="text-right px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              VRAM
            </th>
            <th className="text-left px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Checkpoint
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-bg-base/50 transition-colors">
              <td className="px-3 py-2">
                <span className="text-xs font-mono-data text-foreground">
                  {task.id}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="text-xs font-mono-data text-indicator-active">
                  {task.jobId}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="text-xs text-foreground-muted">
                  {formatRelativeTime(task.completedAt)}
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                <span className="text-xs font-mono-data text-foreground">
                  {formatDuration(task.duration)}
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                <span className="text-xs font-mono-data text-foreground">
                  {task.vramUsed}GB
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="text-xs font-mono-data text-foreground-muted">
                  {task.checkpointRef}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Slashing Events Table
function SlashingEventsTable({ events }: { events: SlashingEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Shield className="h-8 w-8 text-indicator-active mb-2" />
        <p className="text-sm text-foreground-muted">
          No slashing events recorded
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline">
            <th className="text-left px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Event ID
            </th>
            <th className="text-left px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Timestamp
            </th>
            <th className="text-left px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Reason
            </th>
            <th className="text-right px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Slashed
            </th>
            <th className="text-center px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-bg-base/50 transition-colors">
              <td className="px-3 py-2">
                <span className="text-xs font-mono-data text-foreground">
                  {event.id}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="text-xs text-foreground-muted">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </td>
              <td className="px-3 py-2">
                <Badge variant="danger" className="text-xs">
                  {event.reason}
                </Badge>
              </td>
              <td className="px-3 py-2 text-right">
                <span className="text-xs font-mono-data text-indicator-slashed">
                  -{event.amount.toFixed(3)} ETH
                </span>
              </td>
              <td className="px-3 py-2 text-center">
                {event.refunded ? (
                  <Badge variant="success" className="text-xs">
                    Refunded
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Loading skeleton
function NodeDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 bg-bg-surface rounded w-48" />
      <div className="grid gap-3 grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-bg-surface rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function NodeDetailPage() {
  const params = useParams();
  const nodeId = params.id as string;

  const { data: node, isLoading } = useNode(nodeId);
  const nodeUpdates = useNodeUpdates();

  // Generate mock telemetry data
  const [heartbeatSlots, setHeartbeatSlots] = React.useState(() => generateHeartbeatSlots(288));
  const completedTasks = React.useMemo(() => generateCompletedTasks(15), []);
  const slashingEvents = React.useMemo(() => generateSlashingEvents(5), []);

  // Apply SSE updates to heartbeat timeline
  React.useEffect(() => {
    if (nodeUpdates.updates.length > 0) {
      const latestUpdate = nodeUpdates.updates.find((u) => u.nodeId === nodeId);
      if (latestUpdate) {
        setHeartbeatSlots((prev) => {
          // Add new heartbeat slot at the end
          const newSlot: HeartbeatSlot = {
            timestamp: Date.now(),
            status: latestUpdate.status === "online"
              ? "ok"
              : latestUpdate.status === "stale"
              ? "vramm_warn"
              : "missed",
            vramUsed: latestUpdate.vramUsed || 0,
            vramTotal: latestUpdate.vramTotal || 16,
            latencyMs: latestUpdate.latencyMs || 0,
          };
          return [...prev.slice(1), newSlot];
        });
      }
    }
  }, [nodeUpdates.updates, nodeId]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" disabled>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Nodes
        </Button>
        <NodeDetailSkeleton />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-indicator-stale mb-4" />
        <h2 className="text-lg font-semibold mb-2">Node Not Found</h2>
        <p className="text-foreground-muted mb-4">
          The node you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/nodes"
          className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground-muted hover:bg-bg-surface hover:text-foreground h-8 px-3 text-xs gap-1.5 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Nodes
        </Link>
      </div>
    );
  }

  const tier = getReputationTier(node.reputation);
  const vramPercentage = (node.vramUsed / node.vramTotal) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Back Button */}
      <Link
        href="/nodes"
        className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground-muted hover:bg-bg-surface hover:text-foreground h-8 px-3 text-xs gap-1.5 transition-all w-fit"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Nodes
      </Link>

      {/* Page Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-foreground-muted" />
              <h1 className="text-xl font-semibold tracking-tight text-foreground font-mono-data">
                {node.id}
              </h1>
            </div>
            <StatusBadge status={node.status} showPulse />
            <ReputationBadge tier={tier} score={node.reputation} showScore />
          </div>
          <div className="flex items-center gap-4 text-sm text-foreground-muted">
            <span className="font-mono-data">{node.address}</span>
            <span>•</span>
            <span className="font-mono-data">{node.region}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <MetricCard
            label="Jobs Done"
            value={node.totalJobsCompleted}
            trend="up"
            trendValue="all time"
            glowColor="active"
            className="bg-bg-surface/80"
          />
          <MetricCard
            label="Stake"
            value={`${node.stakeAmount.toFixed(1)}`}
            trend="neutral"
            trendValue={node.stakeCurrency}
            glowColor="none"
            className="bg-bg-surface/80"
          />
        </div>
      </header>

      {/* Hardware Specs Module */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indicator-active" />
            Hardware Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HardwareSpecsModule node={node} />
        </CardContent>
      </Card>

      {/* Heartbeat Health Timeline */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-indicator-active" />
              24-Hour Heartbeat Health
            </CardTitle>
            <Badge variant="outline" className="font-mono-data text-xs">
              288 cycles @ 5min intervals
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <HeartbeatHealthTimeline slots={heartbeatSlots} />
        </CardContent>
      </Card>

      {/* Two Column Layout: Completed Tasks & Slashing Events */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Completed Tasks */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indicator-active" />
                Completed Tasks
              </CardTitle>
              <span className="text-xs text-foreground-muted font-mono-data">
                Recent 15
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <CompletedTasksTable tasks={completedTasks} />
          </CardContent>
        </Card>

        {/* Slashing Events */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-indicator-slashed" />
                Slashing History
              </CardTitle>
              <span className="text-xs text-foreground-muted font-mono-data">
                {slashingEvents.length} events
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <SlashingEventsTable events={slashingEvents} />
          </CardContent>
        </Card>
      </div>

      {/* Network Stats Summary */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indicator-stale" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-1 p-3 bg-bg-base/50 rounded-lg">
              <span className="text-xs text-foreground-muted uppercase tracking-wider">
                Avg Latency
              </span>
              <span className="text-xl font-mono-data text-indicator-active">
                47ms
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-bg-base/50 rounded-lg">
              <span className="text-xs text-foreground-muted uppercase tracking-wider">
                Peak VRAM
              </span>
              <span className="text-xl font-mono-data text-indicator-stale">
                72GB
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-bg-base/50 rounded-lg">
              <span className="text-xs text-foreground-muted uppercase tracking-wider">
                Total Runtime
              </span>
              <span className="text-xl font-mono-data text-foreground">
                847h
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-bg-base/50 rounded-lg">
              <span className="text-xs text-foreground-muted uppercase tracking-wider">
                Success Rate
              </span>
              <span className="text-xl font-mono-data text-indicator-active">
                99.2%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
