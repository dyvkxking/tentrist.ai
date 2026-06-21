import * as React from "react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto p-6">
      {/* Header skeleton */}
      <div className="h-8 w-64 bg-bg-surface/80 rounded animate-pulse" />
      <div className="h-4 w-96 bg-bg-surface/60 rounded animate-pulse" />

      {/* Stats grid skeleton */}
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-bg-surface/80 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 h-96 bg-bg-surface/80 rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-48 bg-bg-surface/80 rounded-lg animate-pulse" />
          <div className="h-48 bg-bg-surface/80 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Bottom skeleton */}
      <div className="h-64 bg-bg-surface/80 rounded-lg animate-pulse" />
    </div>
  );
}
