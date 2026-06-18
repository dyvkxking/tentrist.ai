"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "dark" | "light" | "system";
export type SidebarView = "expanded" | "collapsed" | "hidden";
export type JobsViewMode = "table" | "cards";
export type NodesViewMode = "table" | "cards";

export interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Sidebar
  sidebarView: SidebarView;
  sidebarCollapsed: boolean;
  setSidebarView: (view: SidebarView) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // View preferences
  jobsViewMode: JobsViewMode;
  nodesViewMode: NodesViewMode;
  setJobsViewMode: (mode: JobsViewMode) => void;
  setNodesViewMode: (mode: NodesViewMode) => void;

  // Table preferences
  jobsPerPage: number;
  nodesPerPage: number;
  setJobsPerPage: (count: number) => void;
  setNodesPerPage: (count: number) => void;

  // Filters (persisted separately to allow URL sync)
  jobStatusFilter: string[];
  nodeStatusFilter: string[];
  setJobStatusFilter: (statuses: string[]) => void;
  setNodeStatusFilter: (statuses: string[]) => void;

  // Modal/Dialog state
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: "dark",
      setTheme: (theme) => set({ theme }),

      // Sidebar
      sidebarView: "expanded",
      sidebarCollapsed: false,
      setSidebarView: (view) => set({ sidebarView: view, sidebarCollapsed: view === "collapsed" }),
      toggleSidebar: () => {
        const { sidebarView } = get();
        if (sidebarView === "expanded") {
          set({ sidebarView: "collapsed", sidebarCollapsed: true });
        } else if (sidebarView === "collapsed") {
          set({ sidebarView: "expanded", sidebarCollapsed: false });
        }
      },
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed, sidebarView: collapsed ? "collapsed" : "expanded" }),

      // View preferences
      jobsViewMode: "table",
      nodesViewMode: "table",
      setJobsViewMode: (mode) => set({ jobsViewMode: mode }),
      setNodesViewMode: (mode) => set({ nodesViewMode: mode }),

      // Table preferences
      jobsPerPage: 25,
      nodesPerPage: 25,
      setJobsPerPage: (count) => set({ jobsPerPage: count }),
      setNodesPerPage: (count) => set({ nodesPerPage: count }),

      // Filters
      jobStatusFilter: [],
      nodeStatusFilter: [],
      setJobStatusFilter: (statuses) => set({ jobStatusFilter: statuses }),
      setNodeStatusFilter: (statuses) => set({ nodeStatusFilter: statuses }),

      // Modal/Dialog state
      activeModal: null,
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),

      // Mobile menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
    }),
    {
      name: "tentrist-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarView: state.sidebarView,
        jobsViewMode: state.jobsViewMode,
        nodesViewMode: state.nodesViewMode,
        jobsPerPage: state.jobsPerPage,
        nodesPerPage: state.nodesPerPage,
      }),
    }
  )
);

// Selector hooks
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebarState = () => ({
  view: useUIStore((state) => state.sidebarView),
  collapsed: useUIStore((state) => state.sidebarCollapsed),
});
export const useJobsViewMode = () => useUIStore((state) => state.jobsViewMode);
export const useNodesViewMode = () => useUIStore((state) => state.nodesViewMode);
export const useActiveModal = () => useUIStore((state) => state.activeModal);
export const useMobileMenu = () => useUIStore((state) => state.mobileMenuOpen);