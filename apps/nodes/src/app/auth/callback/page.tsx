"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const client = supabase;
    if (!client) {
      router.push("/");
      return;
    }
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        client
          .from("user_onboarding_status")
          .select("user_type, onboarding_completed")
          .eq("id", session.user.id)
          .single()
          .then(({ data: statusData }) => {
            const completed = statusData?.onboarding_completed ?? false;
            if (!completed) {
              router.push("/onboarding");
            } else {
              router.push("/dashboard");
            }
          });
      } else {
        router.push("/");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#010102] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#22c55e] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-[#71717a] text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
