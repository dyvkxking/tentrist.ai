"use client";

import { useQuery } from "@tanstack/react-query";

// Types
export interface UptimeDataPoint {
  date: string;
  uptime: number;
  slaTarget: number;
}

export interface JobVolumeDataPoint {
  date: string;
  completed: number;
  failed: number;
  pending: number;
}

export interface ValueFlowDataPoint {
  date: string;
  revenue: number;
  cost: number;
  margin: number;
}

export interface SLAComplianceDataPoint {
  date: string;
  compliance: number;
}

export interface JobTypeBreakdown {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ClientBreakdown {
  client: string;
  jobs: number;
  revenue: number;
  SLA: number;
}

export interface AnalyticsOverview {
  totalJobs: number;
  totalJobsChange: number;
  averageUptime: number;
  averageUptimeChange: number;
  slaCompliance: number;
  slaComplianceChange: number;
  totalRevenue: number;
  totalRevenueChange: number;
  totalCost: number;
  totalCostChange: number;
}

// Mock data generators
function generateUptimeData(days: number = 30): UptimeDataPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      uptime: 95 + Math.random() * 5,
      slaTarget: 95,
    };
  });
}

function generateJobVolumeData(days: number = 14): JobVolumeDataPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completed: Math.floor(Math.random() * 50) + 20,
      failed: Math.floor(Math.random() * 8),
      pending: Math.floor(Math.random() * 15) + 5,
    };
  });
}

function generateValueFlowData(days: number = 14): ValueFlowDataPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const revenue = Math.random() * 10 + 5;
    const cost = revenue * (0.4 + Math.random() * 0.3);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: parseFloat(revenue.toFixed(3)),
      cost: parseFloat(cost.toFixed(3)),
      margin: parseFloat((revenue - cost).toFixed(3)),
    };
  });
}

function generateSLAComplianceData(days: number = 30): SLAComplianceDataPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      compliance: 92 + Math.random() * 8,
    };
  });
}

function generateJobTypeBreakdown(): JobTypeBreakdown[] {
  return [
    { name: "LLM Fine-tuning", count: 156, percentage: 45, color: "#10b981" },
    { name: "Batch Rendering", count: 98, percentage: 28, color: "#3b82f6" },
    { name: "Image Processing", count: 52, percentage: 15, color: "#f59e0b" },
    { name: "Data Processing", count: 41, percentage: 12, color: "#8b5cf6" },
  ];
}

function generateClientBreakdown(): ClientBreakdown[] {
  return [
    { client: "nexus-ai", jobs: 245, revenue: 12.4, SLA: 99.2 },
    { client: "renderfarm", jobs: 189, revenue: 9.8, SLA: 98.7 },
    { client: "synthwave", jobs: 156, revenue: 8.2, SLA: 99.5 },
    { client: "neuralforge", jobs: 134, revenue: 7.1, SLA: 97.8 },
    { client: "deepscale", jobs: 98, revenue: 5.4, SLA: 99.1 },
  ];
}

function generateAnalyticsOverview(): AnalyticsOverview {
  return {
    totalJobs: 847,
    totalJobsChange: 12.5,
    averageUptime: 97.2,
    averageUptimeChange: 0.3,
    slaCompliance: 99.1,
    slaComplianceChange: 0.2,
    totalRevenue: 45.8,
    totalRevenueChange: 8.2,
    totalCost: 18.4,
    totalCostChange: -3.1,
  };
}

// API functions
async function fetchUptimeData(days: number = 30): Promise<UptimeDataPoint[]> {
  await new Promise((r) => setTimeout(r, 200));
  return generateUptimeData(days);
}

async function fetchJobVolumeData(days: number = 14): Promise<JobVolumeDataPoint[]> {
  await new Promise((r) => setTimeout(r, 200));
  return generateJobVolumeData(days);
}

async function fetchValueFlowData(days: number = 14): Promise<ValueFlowDataPoint[]> {
  await new Promise((r) => setTimeout(r, 200));
  return generateValueFlowData(days);
}

async function fetchSLAComplianceData(days: number = 30): Promise<SLAComplianceDataPoint[]> {
  await new Promise((r) => setTimeout(r, 200));
  return generateSLAComplianceData(days);
}

async function fetchJobTypeBreakdown(): Promise<JobTypeBreakdown[]> {
  await new Promise((r) => setTimeout(r, 200));
  return generateJobTypeBreakdown();
}

async function fetchClientBreakdown(): Promise<ClientBreakdown[]> {
  await new Promise((r) => setTimeout(r, 200));
  return generateClientBreakdown();
}

async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  await new Promise((r) => setTimeout(r, 200));
  return generateAnalyticsOverview();
}

// Hooks
export function useUptimeData(days: number = 30) {
  return useQuery({
    queryKey: ["analytics", "uptime", days],
    queryFn: () => fetchUptimeData(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useJobVolumeData(days: number = 14) {
  return useQuery({
    queryKey: ["analytics", "jobVolume", days],
    queryFn: () => fetchJobVolumeData(days),
    staleTime: 1000 * 60 * 5,
  });
}

export function useValueFlowData(days: number = 14) {
  return useQuery({
    queryKey: ["analytics", "valueFlow", days],
    queryFn: () => fetchValueFlowData(days),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSLAComplianceData(days: number = 30) {
  return useQuery({
    queryKey: ["analytics", "slaCompliance", days],
    queryFn: () => fetchSLAComplianceData(days),
    staleTime: 1000 * 60 * 5,
  });
}

export function useJobTypeBreakdown() {
  return useQuery({
    queryKey: ["analytics", "jobTypeBreakdown"],
    queryFn: fetchJobTypeBreakdown,
    staleTime: 1000 * 60 * 10,
  });
}

export function useClientBreakdown() {
  return useQuery({
    queryKey: ["analytics", "clientBreakdown"],
    queryFn: fetchClientBreakdown,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: fetchAnalyticsOverview,
    staleTime: 1000 * 60 * 5,
  });
}
