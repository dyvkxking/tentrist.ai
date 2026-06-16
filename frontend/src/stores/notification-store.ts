"use client";

import { create } from "zustand";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  link?: {
    href: string;
    label: string;
  };
}

export type NotificationCategory = "all" | "jobs" | "nodes" | "wallet" | "system";

export interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;

  // Actions
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  getNotificationsByCategory: (category: NotificationCategory) => Notification[];
}

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,

  // Add notification
  addNotification: (notification) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    return id;
  },

  // Remove notification
  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read
          ? state.unreadCount - 1
          : state.unreadCount,
      };
    });
  },

  // Mark as read
  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (!notification || notification.read) {
        return state;
      }

      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  // Mark all as read
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  // Clear all notifications
  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  // Get notifications by category
  getNotificationsByCategory: (category) => {
    const { notifications } = get();

    if (category === "all") {
      return notifications;
    }

    // Categorize based on notification title/content patterns
    return notifications.filter((n) => {
      const titleLower = n.title.toLowerCase();
      const messageLower = n.message?.toLowerCase() || "";

      switch (category) {
        case "jobs":
          return (
            titleLower.includes("job") ||
            messageLower.includes("job") ||
            titleLower.includes("workload") ||
            messageLower.includes("workload")
          );
        case "nodes":
          return (
            titleLower.includes("node") ||
            messageLower.includes("node") ||
            titleLower.includes("gpu") ||
            messageLower.includes("gpu")
          );
        case "wallet":
          return (
            titleLower.includes("wallet") ||
            messageLower.includes("wallet") ||
            titleLower.includes("stake") ||
            messageLower.includes("stake") ||
            titleLower.includes("slash") ||
            messageLower.includes("slash")
          );
        case "system":
          return (
            titleLower.includes("system") ||
            messageLower.includes("system") ||
            titleLower.includes("sla") ||
            messageLower.includes("sla") ||
            titleLower.includes("heartbeat")
          );
        default:
          return true;
      }
    });
  },
}));

// Selector hooks
export const useNotifications = () => useNotificationStore((state) => state.notifications);
export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount);

// Helper to create typed notification creators
export const notificationCreators = {
  jobCompleted: (jobId: string) => ({
    type: "success" as const,
    title: "Job Completed",
    message: `Job ${jobId.slice(0, 12)}... has completed successfully.`,
    link: { href: `/dashboard/jobs/${jobId}`, label: "View Job" },
  }),

  jobFailed: (jobId: string, reason?: string) => ({
    type: "error" as const,
    title: "Job Failed",
    message: `Job ${jobId.slice(0, 12)}... has failed${reason ? `: ${reason}` : "."}`,
    link: { href: `/dashboard/jobs/${jobId}`, label: "View Job" },
  }),

  jobRequeued: (jobId: string) => ({
    type: "warning" as const,
    title: "Job Requeued",
    message: `Job ${jobId.slice(0, 12)}... has been requeued due to node failure.`,
    link: { href: `/dashboard/jobs/${jobId}`, label: "View Job" },
  }),

  nodeOnline: (nodeId: string) => ({
    type: "info" as const,
    title: "Node Online",
    message: `Node ${nodeId.slice(0, 12)}... is now online and receiving heartbeats.`,
    link: { href: `/dashboard/nodes/${nodeId}`, label: "View Node" },
  }),

  nodeOffline: (nodeId: string) => ({
    type: "error" as const,
    title: "Node Offline",
    message: `Node ${nodeId.slice(0, 12)}... has gone offline.`,
    link: { href: `/dashboard/nodes/${nodeId}`, label: "View Node" },
  }),

  nodeSlashed: (nodeId: string, amount: string) => ({
    type: "error" as const,
    title: "Node Slashed",
    message: `Node ${nodeId.slice(0, 12)}... was slashed for ${amount}.`,
    link: { href: `/dashboard/admin/slashing`, label: "Review" },
  }),

  slaBreach: (jobId: string) => ({
    type: "warning" as const,
    title: "SLA Breach Warning",
    message: `Job ${jobId.slice(0, 12)}... is at risk of missing its SLA deadline.`,
    link: { href: `/dashboard/jobs/${jobId}`, label: "View Job" },
  }),

  walletConnected: (address: string) => ({
    type: "success" as const,
    title: "Wallet Connected",
    message: `Connected to wallet ${address.slice(0, 6)}...${address.slice(-4)}.`,
  }),

  stakeSuccess: (amount: string) => ({
    type: "success" as const,
    title: "Stake Successful",
    message: `Successfully staked ${amount} ETH.`,
    link: { href: `/dashboard/wallet`, label: "View Wallet" },
  }),

  unstakeInitiated: (amount: string, cooldownDays: number) => ({
    type: "info" as const,
    title: "Unstake Initiated",
    message: `Unstake of ${amount} ETH initiated. Available in ${cooldownDays} days.`,
    link: { href: `/dashboard/wallet`, label: "View Wallet" },
  }),
};