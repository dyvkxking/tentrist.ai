"use client";

import * as React from "react";
import { useSSE, SSEJobEvent, createSSEUrl } from "./use-sse";
import { toast } from "@/hooks/use-toast";

export interface JobUpdate {
  jobId: string;
  status?: "pending" | "running" | "completed" | "failed" | "requeued";
  progress?: number;
  message?: string;
}

export function useJobUpdates(onUpdate?: (data: JobUpdate) => void) {
  const [updates, setUpdates] = React.useState<JobUpdate[]>([]);

  const handleMessage = React.useCallback(
    (event: SSEJobEvent) => {
      // Handle status changes
      if (event.type === "job_status" || event.type === "job_progress" || event.type === "job_complete" || event.type === "job_failed") {
        const update: JobUpdate = {
          jobId: event.jobId,
          status: event.data.status as JobUpdate["status"],
          progress: event.data.progress,
          message: event.data.message,
        };

        setUpdates((prev) => [update, ...prev].slice(0, 100));

        // Show toast for important events
        if (event.type === "job_complete") {
          toast.success("Job Completed", `Job ${event.jobId} finished successfully`);
        } else if (event.type === "job_failed") {
          toast.error("Job Failed", `Job ${event.jobId} encountered an error`);
        }

        onUpdate?.(update);
      }
    },
    [onUpdate]
  );

  const url = React.useMemo(
    () => createSSEUrl("/api/v1/sse/jobs", {}),
    []
  );

  const { isConnected } = useSSE<SSEJobEvent>(url, {
    onMessage: handleMessage,
    enabled: true,
  });

  return { updates, isConnected };
}
