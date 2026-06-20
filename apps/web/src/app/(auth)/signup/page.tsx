"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

class ErrorBoundary extends React.Component<{children:React.ReactNode;fallback:React.ReactNode},{hasError:boolean}> {
  constructor(props:any){super(props);this.state={hasError:false}}
  static getDerivedStateFromError(){return{hasError:true}}
  render(){if(this.state.hasError)return this.props.fallback;return this.props.children}
}
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Mail, Lock, User, Wallet, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { signInWithGitHub, signInWithGoogle, signInWithDiscord } from "@/lib/supabase";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();

  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Clear error on unmount
  React.useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: SignupFormData) => {
    await login(data.email, data.password);
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google' | 'discord') => {
    setOauthLoading(provider);
    try {
      if (provider === 'github') {
        await signInWithGitHub();
      } else if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithDiscord();
      }
    } catch (err) {
      console.error('OAuth error:', err);
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-bg-base overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indicator-active/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-indicator-stale/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex items-center justify-center p-4 py-8">
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
              <CardTitle className="text-xl">Create an account</CardTitle>
              <CardDescription>
                Start using decentralized GPU compute today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <ErrorBoundary fallback={<div className="space-y-4"><div className="h-4 w-full bg-bg-base/50 animate-pulse rounded" /><div className="h-10 w-full bg-bg-base/50 animate-pulse rounded" /><div className="h-10 w-full bg-bg-base/50 animate-pulse rounded" /></div>}>
              {/* Error message */}
              {error && (
                <div className="p-3 rounded-md bg-indicator-slashed/10 border border-indicator-slashed/30 text-indicator-slashed text-sm">
                  {error}
                </div>
              )}

              {/* OAuth Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {/* GitHub */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={isLoading || oauthLoading !== null}
                >
                  {oauthLoading === 'github' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  )}
                </Button>

                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading || oauthLoading !== null}
                >
                  {oauthLoading === 'google' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                </Button>

                {/* Discord */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('discord')}
                  disabled={isLoading || oauthLoading !== null}
                >
                  {oauthLoading === 'discord' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  )}
                </Button>
              </div>

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

              {/* Signup form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name field */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className={cn("pl-10", errors.name && "border-indicator-slashed/60")}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-indicator-slashed">{errors.name.message}</p>
                  )}
                </div>

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
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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

                {/* Confirm Password field */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={cn(
                        "pl-10 pr-10",
                        errors.confirmPassword && "border-indicator-slashed/60"
                      )}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-indicator-slashed">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-2">
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-border-hairline bg-bg-base text-indicator-active focus:ring-indicator-active/50"
                    {...register("agreeTerms")}
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-foreground-muted">
                    I agree to the{" "}
                    <Link href="/terms" className="text-indicator-active hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-indicator-active hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeTerms && (
                  <p className="text-xs text-indicator-slashed -mt-2">{errors.agreeTerms.message}</p>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              {/* Wallet connect */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
              </ErrorBoundary>
            </CardContent>
          </Card>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-foreground-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-indicator-active hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
