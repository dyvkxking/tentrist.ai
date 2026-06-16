"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveIndicator, ConnectionStatus } from "./live-indicator";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-foreground-muted">{description}</p>
          )}
        </div>

        {/* Action buttons */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumbs({
  items,
  separator = <ChevronRight className="h-3.5 w-3.5 text-foreground-muted/50" />,
  className,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              {/* Separator */}
              {index > 0 && (
                <span className="text-foreground-muted/50">{separator}</span>
              )}

              {/* Breadcrumb item */}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    isLast
                      ? "text-foreground font-medium"
                      : "text-foreground-muted hover:text-foreground transition-colors"
                  )}
                >
                  {item.icon && (
                    <span className="shrink-0">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5",
                    "text-foreground-muted hover:text-foreground transition-colors"
                  )}
                >
                  {item.icon && (
                    <span className="shrink-0">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Auto-generated breadcrumbs from pathname
export interface AutoBreadcrumbsProps {
  className?: string;
  homeLabel?: string;
  homeHref?: string;
}

export function AutoBreadcrumbs({
  className,
  homeLabel = "Dashboard",
  homeHref = "/dashboard",
}: AutoBreadcrumbsProps) {
  const pathname = usePathname();

  const items = React.useMemo<BreadcrumbItem[]>(() => {
    const segments = pathname.split("/").filter(Boolean);

    const breadcrumbs: BreadcrumbItem[] = [
      { label: homeLabel, href: homeHref, icon: <Home className="h-3.5 w-3.5" /> },
    ];

    let currentPath = "";
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      // Check if segment looks like an ID (alphanumeric with dashes/underscores)
      const isIdSegment = /^[a-zA-Z0-9_-]+$/.test(segment) && segment.length > 8;

      // Format label: capitalize, replace hyphens/underscores with spaces
      const label = isIdSegment
        ? "Details"
        : segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }

    return breadcrumbs;
  }, [pathname, homeLabel, homeHref]);

  return <Breadcrumbs items={items} className={className} />;
}

// System status bar for dashboard pages
export interface SystemStatusBarProps {
  status?: ConnectionStatus;
  latencyMs?: number;
  lastSync?: Date;
  className?: string;
}

export function SystemStatusBar({
  status = "connected",
  latencyMs,
  lastSync,
  className,
}: SystemStatusBarProps) {
  const formattedTime = lastSync
    ? lastSync.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : null;

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-3 py-1.5",
        "bg-bg-surface/30 border border-hairline rounded-md",
        "font-mono-data text-xs",
        className
      )}
    >
      {/* Connection status */}
      <LiveIndicator status={status} size="sm" />

      {/* Latency */}
      {latencyMs !== undefined && (
        <span className="text-foreground-muted">
          <span className="text-foreground">LAT</span>{" "}
          <span
            className={cn(
              latencyMs < 100 && "text-indicator-active",
              latencyMs >= 100 && latencyMs < 300 && "text-indicator-stale",
              latencyMs >= 300 && "text-indicator-slashed"
            )}
          >
            {latencyMs}ms
          </span>
        </span>
      )}

      {/* Last sync time */}
      {formattedTime && (
        <span className="text-foreground-muted">
          <span className="text-foreground">SYNC</span>{" "}
          <span>{formattedTime}</span>
        </span>
      )}

      {/* System ID */}
      <span className="text-foreground-muted ml-auto">
        SYS::STABLE
      </span>
    </div>
  );
}