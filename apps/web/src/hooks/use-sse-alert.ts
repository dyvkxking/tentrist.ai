"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";
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

  const handleAlert = React.useCallback(
    (alert: AlertItem) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 50));

      if (alert.severity === "critical") {
        toast.error(alert.title, alert.message);
      } else if (alert.severity === "warning") {
        toast.warning(alert.title, alert.message);
      } else {
        toast.info(alert.title, alert.message);
      }

      onAlert?.(alert);
    },
    [onAlert]
  );

  React.useEffect(() => {
    // Subscribe to alerts table inserts (new alerts)
    const channel = supabase
      .channel("public:alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          const a = payload.new as {
            id: string;
            severity: "info" | "warning" | "critical";
            message: string;
            node_id?: string;
            job_id?: string;
            created_at: string;
          };

          const alert: AlertItem = {
            id: a.id,
            severity: a.severity,
            title: `Alert: ${a.severity}`,
            message: a.message,
            timestamp: new Date(a.created_at).getTime(),
            metadata: {
              node_id: a.node_id ?? "",
              job_id: a.job_id ?? "",
            },
          };

          handleAlert(alert);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleAlert]);

  const dismissAlert = React.useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    );
  }, []);

  const clearAlerts = React.useCallback(() => {
    setAlerts([]);
  }, []);

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  return { alerts: activeAlerts, dismissAlert, clearAlerts, isConnected: true };
}
