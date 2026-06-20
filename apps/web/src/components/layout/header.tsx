"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, User, LogOut, Settings } from "lucide-react";
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
import { AutoBreadcrumbs } from "@/components/shared/page-header";
import { useAuth as useAuthContext } from "@/components/providers/supabase-auth-provider";

export interface HeaderProps {
  className?: string;
  notificationCount?: number;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export function Header({ className, notificationCount = 0, user }: HeaderProps) {
  const router = useRouter();
  // Use Supabase context directly for reliable logout
  const { signOut } = useAuthContext();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header
      className={cn(
        "h-12 px-4 flex items-center justify-between gap-4",
        "bg-bg-base border-b border-hairline",
        className
      )}
    >
      {/* Left: Breadcrumbs */}
      <AutoBreadcrumbs />

      {/* Right: notifications + user */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indicator-slashed text-[10px] font-bold text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
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
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-indicator-slashed cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
