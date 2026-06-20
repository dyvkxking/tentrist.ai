"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User as SbUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuth as useAuthContext } from "@/components/providers/supabase-auth-provider";
import {
  useAuthStore,
  useUserType,
  signOut as authSignOut,
  type User as LocalUser,
  type UserRole,
} from "@/stores/auth-store";

// Route protection configuration
interface ProtectedRoute {
  path: string;
  roles?: UserRole[];
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

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/docs",
  "/features",
  "/pricing",
  "/explore",
  "/onboarding",
];

function isRouteProtected(pathname: string): ProtectedRoute | null {
  return (
    PROTECTED_ROUTES.find((route) =>
      route.exact ? pathname === route.path : pathname.startsWith(route.path)
    ) ?? null
  );
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      route === "/" ? pathname === "/" : pathname.startsWith(route)
  );
}

// Maps Supabase auth user metadata to our internal User type
function mapSbUser(sbUser: SbUser): LocalUser {
  const meta = sbUser.user_metadata ?? {};
  return {
    id: sbUser.id,
    email: sbUser.email ?? "",
    name:
      meta.display_name ||
      meta.full_name ||
      sbUser.email?.split("@")[0] ||
      "User",
    avatar: meta.avatar_url,
    role: (meta.role as UserRole) ?? "member",
    userType: (meta.user_type as "client" | "provider") ?? undefined,
  };
}

// Hook: Main auth lifecycle — delegates to SupabaseAuthProvider context
export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();

  // Read session from context (single supabase subscription lives here)
  const { user: rawSbUser, session, isLoading: ctxLoading, signOut: ctxSignOut } = useAuthContext();

  // Local error state (Zustand for persistence across re-renders)
  const [localError, setLocalError] = useState<string | null>(null);
  const userType = useUserType();
  const { setError: setStoreError, clearError: clearStoreError } = useAuthStore();

  // Mapped user
  const localUser: LocalUser | null = rawSbUser ? mapSbUser(rawSbUser) : null;

  // Route protection — runs only when session state settles
  useEffect(() => {
    if (ctxLoading || isPublicRoute(pathname)) return;

    const protectedRoute = isRouteProtected(pathname);

    if (protectedRoute && !rawSbUser) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (protectedRoute && rawSbUser && protectedRoute.roles) {
      const role = (rawSbUser.user_metadata?.role as UserRole) ?? "member";
      if (!protectedRoute.roles.includes(role)) {
        router.push("/dashboard");
      }
    }
  }, [pathname, rawSbUser, ctxLoading, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      clearStoreError();
      const { error: sbError } = await supabase.auth.signInWithPassword({ email, password });
      if (sbError) {
        setLocalError(sbError.message);
        setStoreError(sbError.message);
      }
    },
    [clearStoreError, setStoreError]
  );

  const loginWithWallet = useCallback(
    async (address: string) => {
      clearStoreError();
      try {
        if (typeof window === "undefined" || !window.ethereum) {
          throw new Error("No wallet detected");
        }

        const challengeRes = await fetch("/api/v1/auth/wallet/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address }),
        });
        const { nonce, error: challengeErr } = await challengeRes.json();
        if (challengeErr || !nonce) {
          throw new Error(challengeErr || "Failed to get challenge");
        }

        const signature = (await window.ethereum.request({
          method: "personal_sign",
          params: [nonce, address],
        })) as string;

        const verifyRes = await fetch("/api/v1/auth/wallet/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address, signature, nonce }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          throw new Error(verifyData.error || "Wallet verification failed");
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Wallet verification failed";
        setLocalError(msg);
        setStoreError(msg);
      }
    },
    [clearStoreError, setStoreError]
  );

  const logout = useCallback(async () => {
    await authSignOut();
    router.push("/");
  }, [router]);

  const hasRole = useCallback(
    (roles: UserRole[]) => {
      if (!localUser) return false;
      return roles.includes(localUser.role);
    },
    [localUser]
  );

  const isAdmin = useCallback(() => {
    return localUser?.role === "admin";
  }, [localUser]);

  const isAuthenticated = !!rawSbUser;

  // Merge persisted userType from Zustand store into the exposed user
  const user: LocalUser | null =
    localUser && userType
      ? { ...localUser, userType }
      : localUser;

  const clearError = useCallback(() => {
    setLocalError(null);
    clearStoreError();
  }, [clearStoreError]);

  return {
    user,
    isAuthenticated,
    isLoading: ctxLoading,
    error: localError,
    login,
    loginWithWallet,
    logout,
    clearError,
    updateUser: (updates: Partial<LocalUser>) => {
      // No-op: user is derived from Supabase session — updates go through Supabase metadata
    },
    hasRole,
    isAdmin,
  };
}

// Hook: Protected route wrapper
export function useProtectedRoute(requiredRoles?: UserRole[]) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const isAuthorized =
    !isLoading &&
    isAuthenticated &&
    (!requiredRoles ||
      (user && requiredRoles.includes(user.role)));

  return { isAuthorized, isLoading, user };
}

// Hook: Auth redirect (redirects if already authenticated)
export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!isLoading && isAuthenticated &&
      (pathname === "/login" || pathname === "/signup")) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return { isLoading };
}

// Hook: Session timeout
export function useSessionTimeout(timeoutMs = 30 * 60 * 1000) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(logout, timeoutMs);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimeout));
    resetTimeout();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimeout));
    };
  }, [isAuthenticated, timeoutMs, logout]);
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}
