"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Mail, Lock, Wallet, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  const { login, loginWithWallet, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  // Clear error on unmount
  React.useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  const handleWalletLogin = async () => {
    // Mock wallet connection - in real app would use wagmi/rainbowkit
    const mockAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f8dE81";
    await loginWithWallet(mockAddress);
  };

  const handleDemoLogin = async () => {
    // Pre-fill demo credentials and submit
    await login("alex@tentrist.ai", "demo123");
  };

  return (
    <>
      {/* Error message */}
      {error && (
        <div className="p-3 rounded-md bg-indicator-slashed/10 border border-indicator-slashed/30 text-indicator-slashed text-sm">
          {error}
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={cn("pl-10", errors.email && "border-indicator-slashed/60")}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-indicator-slashed">{errors.email.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-indicator-active hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={cn(
                "pl-10 pr-10",
                errors.password && "border-indicator-slashed/60"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-indicator-slashed">{errors.password.message}</p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-hairline" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bg-surface px-2 text-foreground-muted">
            Or continue with
          </span>
        </div>
      </div>

      {/* Wallet connect */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleWalletLogin}
        disabled={isLoading}
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>

      {/* Demo mode */}
      <Button
        type="button"
        variant="ghost"
        className="w-full text-foreground-muted hover:text-foreground"
        onClick={handleDemoLogin}
        disabled={isLoading}
      >
        Demo Mode (alex@tentrist.ai)
      </Button>
    </>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-bg-base overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indicator-active/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indicator-stale/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indicator-active/20 border border-indicator-active/30">
              <Zap className="h-5 w-5 text-indicator-active" />
            </div>
            <span className="text-xl font-semibold text-foreground">Tentrist</span>
          </Link>

          <Card className="border-hairline bg-bg-surface/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to access your GPU compute dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Suspense fallback={<LoginFormSkeleton />}>
                <LoginForm />
              </Suspense>
            </CardContent>
          </Card>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-foreground-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-indicator-active hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}