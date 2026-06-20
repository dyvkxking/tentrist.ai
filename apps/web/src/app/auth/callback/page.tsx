"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const setUserType = useAuthStore((state) => state.setUserType);

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Auth callback error:", sessionError);
          setError(sessionError.message);
          return;
        }

        if (session?.user) {
          const user = session.user;

          // Sync userType from Supabase metadata into Zustand store
          const metadataUserType = user.user_metadata?.user_type as "client" | "provider" | undefined;
          if (metadataUserType) {
            setUserType(metadataUserType);
          }

          // Check onboarding status
          const { data: statusData } = await supabase
            .from("user_onboarding_status")
            .select("user_type, onboarding_completed")
            .eq("id", user.id)
            .single();

          const onboardingCompleted = statusData?.onboarding_completed ?? false;
          const userType = statusData?.user_type ?? null;

          if (userType) {
            setUserType(userType as "client" | "provider");
          }

          if (!onboardingCompleted) {
            router.push("/onboarding");
          } else {
            router.push("/dashboard");
          }
        } else {
          setError("No session found after OAuth callback");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      }
    }

    handleCallback();
  }, [router, setUserType]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-indicator-slashed mb-4">Authentication Failed</h1>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-indicator-active/10 text-indicator-active rounded-lg hover:bg-indicator-active/20"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indicator-active border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Completing authentication...</p>
      </div>
    </div>
  );
}
