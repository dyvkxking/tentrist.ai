"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export interface JobUpdate {
  jobId: string;
  status?: "pending" | "running" | "completed" | "failed" | "requeued";
  progress?: number;
  message?: string;
}

export function useJobUpdates(onUpdate?: (data: JobUpdate) => void) {
  const [updates, setUpdates] = React.useState<JobUpdate[]>([]);

  React.useEffect(() => {
    // Subscribe to job status changes on the jobs table
    const channel = supabase
      .channel("public:jobs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        (payload) => {
          const job = payload.new as {
            id: string;
            status: string;
            completed_at?: string;
          };
          const update: JobUpdate = {
            jobId: job.id,
            status: job.status as JobUpdate["status"],
            progress: job.status === "completed" ? 100 : job.status === "running" ? 50 : 0,
          };

          setUpdates((prev) => [update, ...prev].slice(0, 100));

          if (job.status === "completed") {
            toast.success("Job Completed", `Job ${job.id.slice(0, 8)} finished successfully`);
          } else if (job.status === "failed") {
            toast.error("Job Failed", `Job ${job.id.slice(0, 8)} encountered an error`);
          }

          onUpdate?.(update);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);

  return { updates, isConnected: true };
}
