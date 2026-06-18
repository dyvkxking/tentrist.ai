"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Terminal,
  Download,
  Trash2,
  Filter,
  ChevronDown,
  Play,
  Pause,
  AlertTriangle,
  Info,
  AlertCircle,
  Bug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useStreamingLogs } from "@/hooks/use-jobs";
import type { JobLog } from "@/hooks/use-jobs";

// Log level icons and colors
const logLevelConfig = {
  info: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    label: "INFO",
  },
  warn: {
    icon: AlertTriangle,
    color: "text-indicator-stale",
    bg: "bg-indicator-stale/10",
    border: "border-indicator-stale/20",
    label: "WARN",
  },
  error: {
    icon: AlertCircle,
    color: "text-indicator-slashed",
    bg: "bg-indicator-slashed/10",
    border: "border-indicator-slashed/20",
    label: "ERROR",
  },
  debug: {
    icon: Bug,
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    label: "DEBUG",
  },
};

// Format timestamp for log entry
function formatLogTimestamp(ts: number): string {
  const date = new Date(ts);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const ms = date.getMilliseconds().toString().padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

// Single log line component
function LogLine({ log }: { log: JobLog }) {
  const config = logLevelConfig[log.level];

  return (
    <div className="flex items-start gap-3 py-1 px-2 hover:bg-bg-surface/30 transition-colors group">
      {/* Timestamp */}
      <span className="text-xs font-mono-data text-zinc-600 flex-shrink-0 w-24">
        {formatLogTimestamp(log.timestamp)}
      </span>

      {/* Level badge */}
      <span
        className={cn(
          "flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded w-14 text-center",
          config.bg,
          config.color,
          config.border
        )}
      >
        {config.label}
      </span>

      {/* Node ID */}
      {log.nodeId && (
        <span className="text-xs font-mono-data text-zinc-500 flex-shrink-0 w-20">
          {log.nodeId}
        </span>
      )}

      {/* Message */}
      <span className="text-sm font-mono-data text-foreground flex-1 break-all">
        {log.message}
      </span>
    </div>
  );
}

// Empty logs state
function EmptyLogsState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16">
      <Terminal className="h-12 w-12 text-zinc-700 mb-4" />
      <h3 className="text-base font-semibold text-foreground mb-2">
        No logs yet
      </h3>
      <p className="text-sm text-foreground-muted max-w-sm">
        Log entries will appear here as the job executes. This terminal
        automatically streams new entries.
      </p>
    </div>
  );
}

// Loading state
function LogsLoadingState() {
  return (
    <div className="flex flex-col gap-1 p-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="h-5 bg-bg-surface/50 rounded animate-pulse"
          style={{ width: `${60 + Math.random() * 40}%` }}
        />
      ))}
    </div>
  );
}

// Filter dropdown component
function FilterDropdown({
  selectedLevels,
  onToggle,
}: {
  selectedLevels: Set<JobLog["level"]>;
  onToggle: (level: JobLog["level"]) => void;
}) {
  const levels: JobLog["level"][] = ["info", "warn", "error", "debug"];

  return (
    <div className="relative group">
      <Button variant="outline" size="sm" className="gap-1.5">
        <Filter className="h-3.5 w-3.5" />
        Filter
        <Badge variant="default" className="ml-1 px-1 py-0 text-[10px]">
          {selectedLevels.size || "All"}
        </Badge>
      </Button>
      <div className="absolute right-0 top-full mt-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <Card className="bg-bg-surface border-hairline w-36">
          <CardContent className="p-2">
            {levels.map((level) => {
              const config = logLevelConfig[level];
              const Icon = config.icon;
              return (
                <button
                  key={level}
                  onClick={() => onToggle(level)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-bg-base transition-colors",
                    selectedLevels.has(level) && "bg-bg-base"
                  )}
                >
                  <Icon className={cn("h-3 w-3", config.color)} />
                  <span className={config.color}>{config.label}</span>
                  {selectedLevels.has(level) && (
                    <span className="ml-auto text-indicator-active">✓</span>
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function JobLogsPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [isPaused, setIsPaused] = React.useState(false);
  const [selectedLevels, setSelectedLevels] = React.useState<Set<JobLog["level"]>>(
    new Set()
  );
  const [autoScroll, setAutoScroll] = React.useState(true);
  const logsEndRef = React.useRef<HTMLDivElement>(null);

  const { logs, isConnected } = useStreamingLogs(jobId, !isPaused);

  // Filter logs by selected levels
  const filteredLogs = React.useMemo(() => {
    if (selectedLevels.size === 0) return logs;
    return logs.filter((log) => selectedLevels.has(log.level));
  }, [logs, selectedLevels]);

  // Auto-scroll to bottom when new logs arrive
  React.useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs, autoScroll]);

  const handleToggleLevel = (level: JobLog["level"]) => {
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const handleClearLogs = () => {
    // In a real implementation, this would call a mutation to clear logs
    // For mock purposes, we just reset the state
  };

  const handleDownloadLogs = () => {
    const content = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${
            log.nodeId ? `[${log.nodeId}] ` : ""
          }${log.message}`
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${jobId}-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Count logs by level
  const logCounts = React.useMemo(() => {
    return filteredLogs.reduce(
      (acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      },
      {} as Record<JobLog["level"], number>
    );
  }, [filteredLogs]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Back Button */}
      <div className="flex-shrink-0 mb-4">
        <Link
          href={`/jobs/${jobId}`}
          className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground-muted hover:bg-bg-surface hover:text-foreground h-8 px-3 text-xs gap-1.5 transition-all w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Detail
        </Link>
      </div>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-indicator-active" />
            <h1 className="text-lg font-semibold">Job Logs</h1>
          </div>
          <Badge variant="outline" className="font-mono-data">
            {jobId}
          </Badge>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-indicator-active pulse-active" : "bg-zinc-600"
              )}
            />
            <span className="text-xs text-foreground-muted">
              {isConnected ? "Streaming" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FilterDropdown
            selectedLevels={selectedLevels}
            onToggle={handleToggleLevel}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(autoScroll && "bg-indicator-active/10 border-indicator-active/30")}
          >
            {autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume streaming" : "Pause streaming"}
          >
            {isPaused ? (
              <Play className="h-3.5 w-3.5" />
            ) : (
              <Pause className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownloadLogs}
            title="Download logs"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-indicator-slashed hover:text-indicator-slashed"
            onClick={handleClearLogs}
            title="Clear logs"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Log Stats Bar */}
      <div className="flex-shrink-0 flex items-center gap-4 mb-2 text-xs">
        <span className="text-foreground-muted font-mono-data">
          {filteredLogs.length} entries
        </span>
        {Object.entries(logCounts).map(([level, count]) => {
          const config = logLevelConfig[level as JobLog["level"]];
          return (
            <span key={level} className={cn("font-mono-data", config.color)}>
              {config.label}: {count}
            </span>
          );
        })}
      </div>

      {/* Terminal Container */}
      <Card className="flex-1 bg-bg-base border-hairline overflow-hidden flex flex-col">
        {/* Terminal Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-bg-surface border-b border-hairline">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indicator-slashed/60" />
              <div className="w-3 h-3 rounded-full bg-indicator-stale/60" />
              <div className="w-3 h-3 rounded-full bg-indicator-active/60" />
            </div>
            <span className="text-xs text-foreground-muted ml-2">
              tentrist@node-{jobId.slice(-6)}
            </span>
          </div>
          <span className="text-xs text-foreground-muted font-mono-data">
            {isPaused ? "PAUSED" : "LIVE"}
          </span>
        </div>

        {/* Log Content */}
        <CardContent
          ref={logsEndRef}
          className="flex-1 overflow-y-auto p-0 font-mono-data"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        >
          {filteredLogs.length === 0 ? (
            <EmptyLogsState />
          ) : (
            <div className="p-2">
              {filteredLogs.map((log) => (
                <LogLine key={log.id} log={log} />
              ))}
            </div>
          )}
          <div ref={logsEndRef} />
        </CardContent>
      </Card>
    </div>
  );
}
