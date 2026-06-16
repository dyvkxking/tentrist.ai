"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Mail, Lock, User, Wallet, Loader2, Eye, EyeOff, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

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
    // In a real app, this would call a signup API
    // For demo, we just log in with the credentials
    await login(data.email, data.password);
  };

  const handleWalletSignup = async () => {
    // Mock wallet signup - in real app would use wagmi/rainbowkit
    const mockAddress = "0x862d35Cc6634C0532925a3b844Bc9e7595f8dE82";
    const { loginWithWallet } = useAuth();
    await loginWithWallet(mockAddress);
  };

  const passwordRequirements = [
    { met: false, label: "At least 8 characters" },
    { met: false, label: "One uppercase letter" },
    { met: false, label: "One lowercase letter" },
    { met: false, label: "One number" },
  ];

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
              {/* Error message */}
              {error && (
                <div className="p-3 rounded-md bg-indicator-slashed/10 border border-indicator-slashed/30 text-indicator-slashed text-sm">
                  {error}
                </div>
              )}

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
                onClick={handleWalletSignup}
                disabled={isLoading}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
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