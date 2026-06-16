"use client";

import * as React from "react";

type SSEHandler<T> = (data: T) => void;

interface SSEOptions<T> {
  onMessage: SSEHandler<T>;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  enabled?: boolean;
}

// SSE Event types for the platform
export interface SSELogEvent {
  type: "log";
  jobId: string;
  timestamp: number;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  nodeId?: string;
}

export interface SSEJobEvent {
  type: "job_status" | "job_progress" | "job_complete" | "job_failed";
  jobId: string;
  timestamp: number;
  data: {
    status?: string;
    progress?: number;
    message?: string;
  };
}

export interface SSENodeEvent {
  type: "heartbeat" | "status_change" | "reputation_change";
  nodeId: string;
  timestamp: number;
  data: {
    status?: "online" | "offline" | "stale";
    vramUsed?: number;
    vramTotal?: number;
    latencyMs?: number;
    reputation?: number;
  };
}

export interface SSEAlertEvent {
  type: "alert";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, string>;
}

export type SSEEvent = SSELogEvent | SSEJobEvent | SSENodeEvent | SSEAlertEvent;

// Re-export specialized hooks
export { useJobUpdates } from "./use-sse-job";
export { useNodeUpdates } from "./use-sse-node";
export { useAlertUpdates } from "./use-sse-alert";

export function useSSE<T = unknown>(url: string | null, options: SSEOptions<T>) {
  const { onMessage, onError, onOpen, enabled = true } = options;
  const eventSourceRef = React.useRef<EventSource | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = React.useRef(0);
  const maxReconnectAttempts = 5;

  React.useEffect(() => {
    if (!url || !enabled) {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    let mounted = true;

    function connect() {
      if (!mounted) return;

      try {
        const eventSource = new EventSource(url as string);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          if (mounted) {
            reconnectAttempts.current = 0;
            onOpen?.();
          }
        };

        eventSource.onmessage = (event) => {
          if (!mounted) return;
          try {
            const data = JSON.parse(event.data) as T;
            onMessage(data);
          } catch (e) {
            console.warn("[useSSE] Failed to parse message:", e);
          }
        };

        eventSource.onerror = (error) => {
          if (!mounted) return;
          console.warn("[useSSE] Connection error, attempting reconnect...");

          eventSource.close();

          // Exponential backoff reconnect
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            reconnectAttempts.current++;

            if (mounted) {
              reconnectTimeoutRef.current = setTimeout(() => {
                if (mounted) {
                  connect();
                }
              }, delay);
            }
          }

          onError?.(error);
        };
      } catch (err) {
        console.error("[useSSE] Failed to create EventSource:", err);
      }
    }

    connect();

    return () => {
      mounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [url, enabled, onMessage, onError, onOpen]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  };
}

// Utility to create SSE URL with query params
export function createSSEUrl(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}
