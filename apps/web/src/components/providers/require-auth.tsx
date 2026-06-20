"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/stores/auth-store";
import { ShieldAlert } from "lucide-react";

interface RequireAuthOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function useRequireAuth(options: RequireAuthOptions = {}) {
  const { requiredRole, redirectTo = "/login" } = options;
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (isAuthenticated && requiredRole) {
      const roleHierarchy: Record<UserRole, number> = {
        viewer: 0,
        member: 1,
        admin: 2,
      };

      const userRoleLevel = roleHierarchy[user?.role as UserRole] ?? -1;
      const requiredRoleLevel = roleHierarchy[requiredRole] ?? 999;

      if (userRoleLevel < requiredRoleLevel) {
        router.push("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, redirectTo, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasAccess:
      !isLoading &&
      isAuthenticated &&
      (!requiredRole || user?.role === requiredRole || user?.role === "admin"),
  };
}

// Component wrapper for route protection
export function RequireAuth({
  children,
  requiredRole,
  fallback,
}: {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}) {
  const { isLoading, hasAccess } = useRequireAuth({ requiredRole });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indicator-active border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hasAccess) {
    return fallback ?? (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ShieldAlert className="h-12 w-12 text-indicator-slashed" />
        <p className="text-foreground-muted">You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
