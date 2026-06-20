"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";
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

  React.useEffect(() => {
    // Subscribe to nodes table changes
    const channel = supabase
      .channel("public:nodes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "nodes" },
        (payload) => {
          const node = payload.new as {
            id: string;
            status: string;
            vram_total_mb?: number;
            last_heartbeat_at?: string;
            reputation_score?: number;
          };

          const update: NodeUpdate = {
            nodeId: node.id,
            status: node.status as NodeUpdate["status"],
            vramTotal: node.vram_total_mb,
            reputation: node.reputation_score,
          };

          setUpdates((prev) => {
            const filtered = prev.filter((u) => u.nodeId !== node.id);
            return [update, ...filtered].slice(0, 50);
          });

          if (node.status === "offline") {
            toast.error("Node Offline", `Node ${node.id.slice(0, 8)} went offline`);
          } else if (node.status === "stale") {
            toast.warning("Node Stale", `Node ${node.id.slice(0, 8)} has stale heartbeats`);
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
