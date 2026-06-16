"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  User,
} from "@/stores/auth-store";

// Route protection configuration
interface ProtectedRoute {
  path: string;
  roles?: User["role"][];
  exact?: boolean;
}

const PROTECTED_ROUTES: ProtectedRoute[] = [
  { path: "/dashboard", exact: true },
  { path: "/dashboard/jobs", roles: ["admin", "member", "viewer"] },
  { path: "/dashboard/nodes", roles: ["admin", "member", "viewer"] },
  { path: "/dashboard/analytics", roles: ["admin", "member"] },
  { path: "/dashboard/wallet", roles: ["admin", "member", "viewer"] },
  { path: "/dashboard/settings", roles: ["admin", "member", "viewer"] },
  { path: "/dashboard/admin", roles: ["admin"] },
];

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

function isRouteProtected(pathname: string, protectedRoutes: ProtectedRoute[]): ProtectedRoute | null {
  return protectedRoutes.find((route) => {
    if (route.exact) {
      return pathname === route.path;
    }
    return pathname.startsWith(route.path);
  }) ?? null;
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );
}

// Hook: Auth lifecycle management
export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();

  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const error = useAuthError();

  const login = useAuthStore((state) => state.login);
  const loginWithWallet = useAuthStore((state) => state.loginWithWallet);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);
  const checkSession = useAuthStore((state) => state.checkSession);
  const updateUser = useAuthStore((state) => state.updateUser);

  const initialized = useRef(false);

  // Initialize session from stored token on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      // Session check happens automatically via persisted state
      // In a real app, we'd validate the token with the server here
      checkSession();
    }
  }, [checkSession]);

  // Route protection
  useEffect(() => {
    // Skip during loading or on public routes
    if (isLoading || isPublicRoute(pathname)) {
      return;
    }

    const protectedRoute = isRouteProtected(pathname, PROTECTED_ROUTES);

    if (protectedRoute && !isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    if (protectedRoute && user && protectedRoute.roles) {
      // Check role-based access
      if (!protectedRoute.roles.includes(user.role)) {
        router.push("/dashboard");
      }
    }
  }, [pathname, isAuthenticated, isLoading, user, router]);

  // Login handler
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      clearError();
      await login(email, password);
    },
    [login, clearError]
  );

  // Wallet login handler
  const handleLoginWithWallet = useCallback(
    async (address: string) => {
      clearError();
      await loginWithWallet(address);
    },
    [loginWithWallet, clearError]
  );

  // Logout handler
  const handleLogout = useCallback(() => {
    logout();
    router.push("/");
  }, [logout, router]);

  // Check if user has required role
  const hasRole = useCallback(
    (roles: User["role"][]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === "admin";
  }, [user]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    // Actions
    login: handleLogin,
    loginWithWallet: handleLoginWithWallet,
    logout: handleLogout,
    clearError,
    updateUser,

    // Helpers
    hasRole,
    isAdmin,
    checkSession,
  };
}

// Hook: Protected route wrapper (for client components)
export function useProtectedRoute(requiredRoles?: User["role"][]) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const isAuthorized =
    !isLoading &&
    isAuthenticated &&
    (!requiredRoles || (user && requiredRoles.includes(user.role)));

  return {
    isAuthorized,
    isLoading,
    user,
  };
}

// Hook: Auth redirect (redirects if already authenticated)
export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!isLoading && isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return { isLoading };
}

// Hook: Session timeout handling
export function useSessionTimeout(timeoutMs: number = 30 * 60 * 1000) {
  // 30 minutes default
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = useIsAuthenticated();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        logout();
      }, timeoutMs);
    };

    // Reset timeout on user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout);
    });

    // Start initial timeout
    resetTimeout();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [isAuthenticated, timeoutMs, logout]);
}

// Hook: Initialize auth listeners (call once in root layout)
export function useAuthInitialization() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "tentrist-auth" && !e.newValue) {
        // User logged out in another tab
        router.push("/");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  return { isAuthenticated, user };
}