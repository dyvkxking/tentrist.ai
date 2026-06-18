"use client";

import * as React from "react";
import { useSSE, SSENodeEvent, createSSEUrl } from "./use-sse";
import { toast } from "@/hooks/use-toast";

export interface NodeUpdate {
  nodeId: string;
  status?: "online" | "offline" | "stale";
  vramUsed?: number;
  vramTotal?: number;
  latencyMs?: number;
  reputation?: number;
}

export function useNodeUpdates(onUpdate?: (data: NodeUpdate) => void) {
  const [updates, setUpdates] = React.useState<NodeUpdate[]>([]);

  const handleMessage = React.useCallback(
    (event: SSENodeEvent) => {
      if (event.type === "heartbeat" || event.type === "status_change") {
        const update: NodeUpdate = {
          nodeId: event.nodeId,
          status: event.data.status,
          vramUsed: event.data.vramUsed,
          vramTotal: event.data.vramTotal,
          latencyMs: event.data.latencyMs,
          reputation: event.data.reputation,
        };

        setUpdates((prev) => {
          // Replace existing update for same node, or prepend new
          const filtered = prev.filter((u) => u.nodeId !== event.nodeId);
          return [update, ...filtered].slice(0, 50);
        });

        // Show toast for status changes
        if (event.type === "status_change") {
          if (event.data.status === "offline") {
            toast.error("Node Offline", `Node ${event.nodeId} went offline`);
          } else if (event.data.status === "stale") {
            toast.warning("Node Stale", `Node ${event.nodeId} has stale heartbeats`);
          }
        }

        onUpdate?.(update);
      }
    },
    [onUpdate]
  );

  const url = React.useMemo(
    () => createSSEUrl("/api/v1/sse/nodes", {}),
    []
  );

  const { isConnected } = useSSE<SSENodeEvent>(url, {
    onMessage: handleMessage,
    enabled: true,
  });

  return { updates, isConnected };
}
