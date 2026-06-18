"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useUnreadCount } from "@/stores/notification-store";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer } from "@/components/ui/toast";

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const unreadCount = useUnreadCount();

  // Show loading skeleton while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen bg-bg-base overflow-hidden">
        <div className="hidden md:flex w-56 flex-col border-r border-hairline bg-bg-surface">
          <div className="h-14 px-3 border-b border-hairline flex items-center">
            <Skeleton className="w-8 h-8 rounded-md" />
          </div>
          <div className="flex-1 p-2 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-14 px-4 border-b border-hairline flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex-1" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <main className="flex-1 p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    React.useEffect(() => {
      router.push("/login");
    }, [router]);
    return null;
  }

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        className="hidden lg:flex"
      />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          notificationCount={unreadCount}
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  avatar: user.avatar,
                }
              : undefined
          }
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}