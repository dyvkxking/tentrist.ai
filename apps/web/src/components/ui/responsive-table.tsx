"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveCardProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  items: { label: string; value: React.ReactNode; align?: "left" | "center" | "right" }[];
  actions?: React.ReactNode;
  className?: string;
}

export function ResponsiveCard({
  title,
  subtitle,
  badge,
  items,
  actions,
  className,
}: ResponsiveCardProps) {
  return (
    <div
      className={cn(
        "p-4 bg-bg-surface border border-hairline rounded-lg",
        "flex flex-col gap-3",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{title}</span>
            {badge}
          </div>
          {subtitle && (
            <span className="text-xs text-foreground-muted font-mono-data">
              {subtitle}
            </span>
          )}
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between gap-2">
            <span className="text-foreground-muted">{item.label}</span>
            <span
              className={cn(
                "font-mono-data text-foreground",
                item.align === "right" && "text-right",
                item.align === "center" && "text-center"
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook to detect mobile view
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

// Responsive wrapper that shows table on desktop, cards on mobile
export function ResponsiveTable<T extends { id: string }>({
  desktopContent,
  mobileContent,
  items,
  renderItem,
  keyExtractor,
}: {
  desktopContent: React.ReactNode;
  mobileContent?: (items: T[]) => React.ReactNode;
  items: T[];
  renderItem?: (item: T) => React.ReactNode;
  keyExtractor?: (item: T) => string;
}) {
  const isMobile = useIsMobile();

  if (isMobile && mobileContent) {
    return <>{mobileContent(items)}</>;
  }

  if (isMobile && renderItem) {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item) =>
          renderItem(item)
        )}
      </div>
    );
  }

  return <>{desktopContent}</>;
}
