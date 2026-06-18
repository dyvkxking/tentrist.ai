"use client";

import * as React from "react";
import { useSSE, SSEAlertEvent, createSSEUrl } from "./use-sse";
import { toast } from "@/hooks/use-toast";

export interface AlertItem {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, string>;
  dismissed?: boolean;
}

export function useAlertUpdates(onAlert?: (alert: AlertItem) => void) {
  const [alerts, setAlerts] = React.useState<AlertItem[]>([]);

  const handleMessage = React.useCallback(
    (event: SSEAlertEvent) => {
      if (event.type === "alert") {
        const alert: AlertItem = {
          id: `alert_${event.timestamp}_${Math.random().toString(36).slice(2, 8)}`,
          severity: event.severity,
          title: event.title,
          message: event.message,
          timestamp: event.timestamp,
          metadata: event.metadata,
        };

        setAlerts((prev) => [alert, ...prev].slice(0, 50));

        // Show toast immediately
        if (event.severity === "critical") {
          toast.error(event.title, event.message);
        } else if (event.severity === "warning") {
          toast.warning(event.title, event.message);
        } else {
          toast.info(event.title, event.message);
        }

        onAlert?.(alert);
      }
    },
    [onAlert]
  );

  const url = React.useMemo(
    () => createSSEUrl("/api/v1/sse/alerts", {}),
    []
  );

  const { isConnected } = useSSE<SSEAlertEvent>(url, {
    onMessage: handleMessage,
    enabled: true,
  });

  const dismissAlert = React.useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    );
  }, []);

  const clearAlerts = React.useCallback(() => {
    setAlerts([]);
  }, []);

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  return { alerts: activeAlerts, dismissAlert, clearAlerts, isConnected };
}
