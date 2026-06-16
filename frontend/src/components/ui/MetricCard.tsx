"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  glowColor?: "active" | "stale" | "slashed" | "none";
}

export function MetricCard({
  label,
  value,
  trend,
  trendValue,
  className,
  glowColor = "none",
}: MetricCardProps) {
  const glowClasses = {
    active: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    stale: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    slashed: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-bg-surface border border-hairline rounded-lg p-4",
        "flex flex-col gap-1",
        glowClasses[glowColor],
        className
      )}
    >
      <span className="text-xs text-foreground-muted uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold font-mono-data">{value}</span>
        {trendValue && (
          <span
            className={cn(
              "text-xs font-mono-data",
              trend === "up" && "text-indicator-active",
              trend === "down" && "text-indicator-slashed",
              trend === "neutral" && "text-foreground-muted"
            )}
          >
            {trend === "up" && "+"}
            {trend === "down" && "-"}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}