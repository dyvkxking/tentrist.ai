"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "outline";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default:
    "bg-zinc-800/50 text-foreground border-border-hairline",
  success:
    "bg-indicator-active/15 text-indicator-active border-indicator-active/30",
  warning:
    "bg-indicator-stale/15 text-indicator-stale border-indicator-stale/30",
  danger:
    "bg-indicator-slashed/15 text-indicator-slashed border-indicator-slashed/30",
  outline:
    "bg-transparent text-foreground border-border-hairline",
};

const badgeSizes: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border font-medium",
        "transition-colors duration-150",
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = "Badge";