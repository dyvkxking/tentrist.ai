"use client";

import { cn } from "@/lib/utils";

type ServerlessStatus =
  | "online"
  | "offline"
  | "stale"
  | "slashed"
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "requeued";

interface StatusBadgeProps {
  status: ServerlessStatus;
  className?: string;
  showPulse?: boolean;
  size?: "sm" | "md";
}

const statusConfig: Record<
  ServerlessStatus,
  { label: string; color: string; pulse: "active" | "stale" | "slashed" | "none" }
> = {
  online: { label: "Online", color: "bg-indicator-active/20 text-indicator-active border-indicator-active/30", pulse: "active" },
  offline: { label: "Offline", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", pulse: "none" },
  stale: { label: "Stale", color: "bg-indicator-stale/20 text-indicator-stale border-indicator-stale/30", pulse: "stale" },
  slashed: { label: "Slashed", color: "bg-indicator-slashed/20 text-indicator-slashed border-indicator-slashed/30", pulse: "slashed" },
  pending: { label: "Pending", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30", pulse: "none" },
  running: { label: "Running", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", pulse: "active" },
  completed: { label: "Completed", color: "bg-indicator-active/20 text-indicator-active border-indicator-active/30", pulse: "none" },
  failed: { label: "Failed", color: "bg-indicator-slashed/20 text-indicator-slashed border-indicator-slashed/30", pulse: "none" },
  requeued: { label: "Requeued", color: "bg-indicator-stale/20 text-indicator-stale border-indicator-stale/30", pulse: "stale" },
};

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-[10px] gap-1",
  md: "px-2 py-0.5 text-xs gap-1.5",
};

export function StatusBadge({ status, className, showPulse = false, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showPulse && config.pulse !== "none" && (
        <span className={cn("w-1.5 h-1.5 rounded-full", {
          "bg-indicator-active pulse-active": config.pulse === "active",
          "bg-indicator-stale pulse-stale": config.pulse === "stale",
          "bg-indicator-slashed pulse-slashed": config.pulse === "slashed",
        })} />
      )}
      {!showPulse && <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-indicator-active": config.pulse === "active",
        "bg-indicator-stale": config.pulse === "stale",
        "bg-indicator-slashed": config.pulse === "slashed",
        "bg-zinc-500": config.pulse === "none",
      })} />}
      {config.label}
    </span>
  );
}