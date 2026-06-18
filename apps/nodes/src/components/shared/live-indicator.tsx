"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

interface LiveIndicatorProps {
  status: ConnectionStatus;
  size?: "sm" | "md";
  className?: string;
}

export function LiveIndicator({ status, size = "md", className }: LiveIndicatorProps) {
  const dotClass = cn(
    "rounded-full shrink-0",
    size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
    status === "connected" && "bg-[#22c55e] pulse-active",
    status === "reconnecting" && "bg-[#f59e0b] pulse-stale",
    status === "disconnected" && "bg-[#ef4444]"
  );

  return <span className={cn("inline-block", className)} title={status}>
    <span className={dotClass} />
  </span>;
}