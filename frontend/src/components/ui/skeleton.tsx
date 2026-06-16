"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangle" | "circle" | "text";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangle",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    rectangle: "rounded-md",
    circle: "rounded-full",
    text: "rounded h-4 w-full",
  };

  return (
    <div
      className={cn(
        "bg-bg-surface/60 animate-pulse",
        variant !== "text" && "border border-hairline",
        variantClasses[variant],
        className
      )}
      style={{
        width: width ?? (variant === "text" ? undefined : 100),
        height: height ?? (variant === "text" ? undefined : 20),
        ...style,
      }}
      {...props}
    />
  );
}

// Preset skeleton patterns for common use cases

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SkeletonCard({ className, ...props }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-surface border border-hairline rounded-lg p-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" height={12} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
}

export interface SkeletonTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  columns?: number;
}

export function SkeletonTableRow({
  className,
  columns = 5,
  ...props
}: SkeletonTableRowProps) {
  return (
    <tr
      className={cn("border-b border-hairline", className)}
      {...props}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" className={i === 0 ? "w-3/4" : "w-full"} />
        </td>
      ))}
    </tr>
  );
}

export interface SkeletonListProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: number;
}

export function SkeletonList({
  className,
  items = 3,
  ...props
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-bg-surface border border-hairline rounded-lg"
        >
          <Skeleton variant="circle" width={32} height={32} />
          <div className="flex-1 space-y-1.5">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-1/2" height={10} />
          </div>
          <Skeleton variant="rectangle" width={60} height={24} />
        </div>
      ))}
    </div>
  );
}

export interface SkeletonMetricProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function SkeletonMetric({ className, ...props }: SkeletonMetricProps) {
  return (
    <div
      className={cn(
        "bg-bg-surface border border-hairline rounded-lg p-4",
        className
      )}
      {...props}
    >
      <Skeleton variant="text" className="w-1/2 mb-2" height={10} />
      <Skeleton variant="text" className="w-3/4" height={28} />
    </div>
  );
}