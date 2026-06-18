"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

export interface LiveIndicatorProps {
  status?: ConnectionStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig: Record<
  ConnectionStatus,
  { label: string; color: string; pulse: string; icon: React.ReactNode }
> = {
  connected: {
    label: "Connected",
    color: "bg-indicator-active",
    pulse: "pulse-active",
    icon: <Wifi className="h-3 w-3" />,
  },
  disconnected: {
    label: "Disconnected",
    color: "bg-indicator-slashed",
    pulse: "",
    icon: <WifiOff className="h-3 w-3" />,
  },
  reconnecting: {
    label: "Reconnecting",
    color: "bg-indicator-stale",
    pulse: "pulse-stale",
    icon: <Wifi className="h-3 w-3" />,
  },
};

const sizeClasses = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

export function LiveIndicator({
  status = "connected",
  showLabel = false,
  size = "md",
  className,
}: LiveIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "relative flex shrink-0 rounded-full",
          sizeClasses[size],
          config.color,
          config.pulse
        )}
      >
        {status === "reconnecting" && (
          <span
            className={cn(
              "absolute inset-0 rounded-full",
              config.color,
              "animate-ping opacity-75"
            )}
          />
        )}
      </span>
      {showLabel && (
        <span
          className={cn(
            "text-xs font-medium",
            status === "connected" && "text-indicator-active",
            status === "disconnected" && "text-indicator-slashed",
            status === "reconnecting" && "text-indicator-stale"
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}

// Telemetry-specific variant with VRAM/latency display
export interface TelemetryIndicatorProps {
  vramUsed?: number;
  vramTotal?: number;
  latencyMs?: number;
  status?: ConnectionStatus;
  className?: string;
}

export function TelemetryIndicator({
  vramUsed,
  vramTotal,
  latencyMs,
  status = "connected",
  className,
}: TelemetryIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 px-2.5 py-1.5",
        "bg-bg-surface/50 border border-hairline rounded-md",
        "font-mono-data text-xs",
        className
      )}
    >
      {/* Status dot */}
      <span
        className={cn(
          "relative flex shrink-0 w-2 h-2 rounded-full",
          config.color,
          config.pulse
        )}
      />

      {/* VRAM */}
      {vramUsed !== undefined && vramTotal !== undefined && (
        <span className="text-foreground-muted">
          <span className="text-foreground">{vramUsed}</span>
          <span className="mx-0.5">/</span>
          <span>{vramTotal}</span>
          <span className="ml-1 text-foreground-muted">VRAM</span>
        </span>
      )}

      {/* Latency */}
      {latencyMs !== undefined && (
        <span className="text-foreground-muted">
          <span
            className={cn(
              latencyMs < 100 && "text-indicator-active",
              latencyMs >= 100 && latencyMs < 300 && "text-indicator-stale",
              latencyMs >= 300 && "text-indicator-slashed"
            )}
          >
            {latencyMs}
          </span>
          <span className="ml-1 text-foreground-muted">ms</span>
        </span>
      )}
    </div>
  );
}