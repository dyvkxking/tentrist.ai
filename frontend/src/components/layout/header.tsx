"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown, Wallet, User, LogOut, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AutoBreadcrumbs, SystemStatusBar } from "@/components/shared/page-header";
import { LiveIndicator, ConnectionStatus } from "@/components/shared/live-indicator";
import { useUIStore } from "@/stores/ui-store";

export interface HeaderProps {
  className?: string;
  connectionStatus?: ConnectionStatus;
  notificationCount?: number;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  wallet?: {
    address?: string;
    balance?: string;
  };
  onSearch?: (query: string) => void;
}

export function Header({
  className,
  connectionStatus = "connected",
  notificationCount = 0,
  user,
  wallet,
  onSearch,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header
      className={cn(
        "flex flex-col gap-3 h-auto",
        "bg-bg-base border-b border-hairline",
        className
      )}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side: Mobile nav + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <AutoBreadcrumbs />
        </div>

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              type="search"
              placeholder="Search jobs, nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-9 bg-bg-surface/50"
            />
          </div>
        </form>

        {/* Right side: Status + Theme + Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : theme === "light" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuLabel className="text-xs text-foreground-muted">Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className={cn(theme === "light" && "bg-indicator-active/10")}
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className={cn(theme === "dark" && "bg-indicator-active/10")}
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className={cn(theme === "system" && "bg-indicator-active/10")}
              >
                <Monitor className="h-4 w-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* System status */}
          <LiveIndicator status={connectionStatus} showLabel size="sm" />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indicator-slashed text-[10px] font-bold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>

          {/* Wallet dropdown */}
          {wallet && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Wallet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline font-mono-data text-xs">
                    {wallet.address
                      ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                      : "Connect"}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono-data text-sm">{wallet.address || "Not connected"}</span>
                    {wallet.balance && (
                      <span className="text-xs text-foreground-muted font-normal">
                        {wallet.balance} ETH
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Wallet</DropdownMenuItem>
                <DropdownMenuItem>Transaction History</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Disconnect</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indicator-active/20 border border-indicator-active/30">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="h-4 w-4 rounded-full" />
                  ) : (
                    <User className="h-4 w-4 text-indicator-active" />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span className="text-sm">{user?.name || "Guest User"}</span>
                  {user?.email && (
                    <span className="text-xs text-foreground-muted font-normal">
                      {user.email}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-indicator-slashed">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* System status bar */}
      <div className="px-4 pb-2">
        <SystemStatusBar status={connectionStatus} latencyMs={42} className="hidden md:flex" />
      </div>
    </header>
  );
}

// Import Settings icon for the user dropdown
import { Settings } from "lucide-react";