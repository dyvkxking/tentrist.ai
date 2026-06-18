"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Briefcase,
  Server,
  BarChart3,
  Wallet,
  Settings,
  Shield,
  Users,
  Zap,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LiveIndicator } from "@/components/shared/live-indicator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
}

const mainNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    label: "Nodes",
    href: "/nodes",
    icon: <Server className="h-4 w-4" />,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: <Wallet className="h-4 w-4" />,
  },
];

const secondaryNavItems: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: <Shield className="h-4 w-4" />,
    children: [
      { label: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
      { label: "Slashing", href: "/admin/slashing", icon: <Zap className="h-4 w-4" /> },
    ],
  },
];

export interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

export function Sidebar({
  collapsed = false,
  onCollapsedChange,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  const toggleCollapsed = () => {
    onCollapsedChange?.(!collapsed);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    // For /jobs, /nodes, etc. check if pathname equals or starts with them
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full",
        "bg-bg-surface border-r border-hairline",
        "transition-all duration-200 ease-in-out",
        collapsed ? "w-16" : "w-56",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center h-14 px-3 border-b border-hairline">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indicator-active/20 border border-indicator-active/30">
              <Zap className="h-4 w-4 text-indicator-active" />
            </div>
            <span className="font-semibold text-foreground">Tentrist</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="flex-1 flex justify-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indicator-active/20 border border-indicator-active/30">
              <Zap className="h-4 w-4 text-indicator-active" />
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {/* Main nav */}
        <div className="space-y-0.5">
          {mainNavItems.map((item) => (
            <NavItemRow
              key={item.href}
              item={item}
              collapsed={collapsed}
              isActive={isActive(item.href)}
            />
          ))}
        </div>

        {/* Secondary nav */}
        <div className="mt-6 pt-4 border-t border-hairline">
          {!collapsed && (
            <span className="px-3 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
              System
            </span>
          )}
          <div className="mt-2 space-y-0.5">
            {secondaryNavItems.map((item) => (
              <NavItemRow
                key={item.href}
                item={item}
                collapsed={collapsed}
                isActive={isActive(item.href)}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer with collapse toggle */}
      <div className="border-t border-hairline p-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-center",
            !collapsed && "justify-start px-2"
          )}
          onClick={toggleCollapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

interface NavItemRowProps {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}

function NavItemRow({ item, collapsed, isActive }: NavItemRowProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md",
          "text-sm font-medium transition-colors duration-100",
          isActive
            ? "bg-indicator-active/10 text-indicator-active"
            : "text-foreground-muted hover:text-foreground hover:bg-zinc-800/50",
          collapsed && "justify-center"
        )}
        title={collapsed ? item.label : undefined}
      >
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-indicator-active/20 text-indicator-active">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-100",
                  expanded && "rotate-180"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              />
            )}
          </>
        )}
      </Link>

      {/* Children */}
      {!collapsed && hasChildren && expanded && (
        <div className="ml-6 mt-1 space-y-0.5 border-l border-hairline pl-2">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-md",
                "text-sm transition-colors duration-100",
                "text-foreground-muted hover:text-foreground hover:bg-zinc-800/50"
              )}
            >
              <span className="shrink-0">{child.icon}</span>
              <span>{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Mobile navigation component
export interface MobileNavProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={cn("lg:hidden", className)}>
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-bg-surface border-r border-hairline z-50">
            <div className="flex items-center h-14 px-3 border-b border-hairline">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-indicator-active/20 border border-indicator-active/30">
                  <Zap className="h-4 w-4 text-indicator-active" />
                </div>
                <span className="font-semibold text-foreground">Tentrist</span>
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2">
              <div className="space-y-0.5">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md",
                      "text-sm font-medium transition-colors",
                      pathname === item.href || pathname.startsWith(item.href + "/")
                        ? "bg-indicator-active/10 text-indicator-active"
                        : "text-foreground-muted hover:text-foreground hover:bg-zinc-800/50"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}