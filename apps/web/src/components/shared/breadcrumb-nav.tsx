"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[];
  homeLabel?: string;
  homeHref?: string;
  className?: string;
}

// Auto-generate breadcrumbs from pathname
export function BreadcrumbNav({
  items,
  homeLabel = "Dashboard",
  homeHref = "/dashboard",
  className,
}: BreadcrumbNavProps) {
  const pathname = usePathname();

  const breadcrumbs = React.useMemo<BreadcrumbItem[]>(() => {
    if (items) return items;

    const segments = pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [
      { label: homeLabel, href: homeHref },
    ];

    let currentPath = "";
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      // Skip dynamic segments like [id] or [slug]
      if (segment.startsWith("[") && segment.endsWith("]")) {
        continue;
      }

      // Format label: capitalize, replace hyphens/underscores with spaces
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      crumbs.push({
        label,
        href: currentPath,
      });
    }

    return crumbs;
  }, [pathname, items, homeLabel, homeHref]);

  if (breadcrumbs.length < 2) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <ol className="flex items-center gap-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-foreground-muted/50" />
              )}

              {/* Breadcrumb item */}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded",
                    isLast
                      ? "text-foreground font-medium"
                      : "text-foreground-muted"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-foreground-muted",
                    "hover:text-foreground hover:bg-bg-base transition-colors"
                  )}
                >
                  {index === 0 ? (
                    <Home className="h-3.5 w-3.5" />
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
