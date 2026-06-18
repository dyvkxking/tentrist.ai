"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  glowColor?: "active" | "stale" | "slashed" | "none";
  className?: string;
}

export function MetricCard({ label, value, trend, trendValue, glowColor = "none", className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-[#27272a] p-4 overflow-hidden",
        glowColor === "active" && "border-[#22c55e]/20",
        glowColor === "stale" && "border-[#f59e0b]/20",
        glowColor === "slashed" && "border-[#ef4444]/20",
        className
      )}
    >
      {/* Glow */}
      {glowColor !== "none" && (
        <div
          className={cn(
            "absolute inset-0 opacity-5",
            glowColor === "active" && "bg-[#22c55e]",
            glowColor === "stale" && "bg-[#f59e0b]",
            glowColor === "slashed" && "bg-[#ef4444]"
          )}
        />
      )}

      <div className="relative">
        <div className="text-xs text-[#71717a] mb-1">{label}</div>
        <div className="text-2xl font-semibold text-white font-mono">{value}</div>
        {trendValue && (
          <div className="flex items-center gap-1 mt-1">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-[#22c55e]" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 text-[#ef4444]" />}
            {trend === "neutral" && <Minus className="h-3 w-3 text-[#71717a]" />}
            <span className={cn(
              "text-xs font-mono",
              trend === "up" && "text-[#22c55e]",
              trend === "down" && "text-[#ef4444]",
              trend === "neutral" && "text-[#71717a]"
            )}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}