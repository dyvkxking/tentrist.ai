"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Cpu,
  Wallet,
  BarChart3,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { LiveIndicator } from "@/components/shared/live-indicator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { label: "Overview", href: "/node", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "My Nodes", href: "/node/nodes", icon: <Cpu className="h-4 w-4" /> },
  { label: "Earnings", href: "/node/earnings", icon: <Wallet className="h-4 w-4" /> },
  { label: "Settings", href: "/node/settings", icon: <Settings className="h-4 w-4" /> },
];

export default function NodesDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(true); // TODO: wire to auth
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#010102]">
        <p className="text-[#71717a]">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#010102] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-[#0f1011] border-r border-[#27272a] transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-12 px-3 border-b border-[#27272a]">
          {!collapsed ? (
            <Link href="/node" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#22c55e]/20 border border-[#22c55e]/30">
                <Zap className="h-4 w-4 text-[#22c55e]" />
              </div>
              <span className="font-semibold text-white">Tentrist Nodes</span>
            </Link>
          ) : (
            <Link href="/node" className="flex-1 flex justify-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#22c55e]/20 border border-[#22c55e]/30">
                <Zap className="h-4 w-4 text-[#22c55e]" />
              </div>
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-[#22c55e]/10 text-[#22c55e]"
                  : "text-[#71717a] hover:text-white hover:bg-[#3f3f46]/50",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-[#27272a] p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full justify-center text-[#71717a] hover:text-white", !collapsed && "justify-start px-2")}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 mr-2" /><span>Collapse</span></>}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 px-4 flex items-center justify-between gap-4 bg-[#010102] border-b border-[#27272a]">
          {/* Status */}
          <div className="flex items-center gap-2 px-2 py-0.5 bg-[#0f1011]/50 border border-[#27272a] rounded text-[10px] font-mono">
            <LiveIndicator status="connected" size="sm" />
            <span className="text-[#71717a]">SYS::</span>
            <span className="text-white">NOMINAL</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4 text-[#71717a]" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30">
                    <User className="h-4 w-4 text-[#22c55e]" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-white">Node Provider</span>
                    <span className="text-xs text-[#71717a]">provider@tentrist.ai</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Settings className="h-4 w-4 mr-2" />Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[#ef4444]"><LogOut className="h-4 w-4 mr-2" />Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}