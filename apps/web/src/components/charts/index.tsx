"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// Custom tooltip style matching design system
const chartColors = {
  primary: "#10b981", // indicator-active
  secondary: "#f59e0b", // indicator-stale
  danger: "#f43f5e", // indicator-slashed
  blue: "#3b82f6",
  purple: "#8b5cf6",
  foreground: "#ededed",
  muted: "#71717a",
  surface: "#0f1011",
  border: "#27272a",
};

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
  label,
  unit = "",
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-bg-surface/95 backdrop-blur-xl border border-hairline rounded-lg p-3 shadow-xl">
      <p className="text-xs font-mono-data text-foreground-muted mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground-muted">{entry.name}:</span>
          <span className="font-mono-data text-foreground font-medium">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

// Custom legend
function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload?.length) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground-muted">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// Line Chart for uptime patterns
interface UptimeLineChartProps {
  data: Array<{
    date: string;
    uptime: number;
    slaTarget: number;
  }>;
}

export function UptimeLineChart({ data }: UptimeLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartColors.border}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={{ stroke: chartColors.border }}
        />
        <YAxis
          domain={[90, 100]}
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
          width={45}
        />
        <Tooltip content={<CustomTooltip unit="%" />} />
        <Line
          type="monotone"
          dataKey="slaTarget"
          name="SLA Target"
          stroke={chartColors.secondary}
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="uptime"
          name="Uptime"
          stroke={chartColors.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: chartColors.primary }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Bar Chart for job volumes
interface JobVolumeBarChartProps {
  data: Array<{
    date: string;
    completed: number;
    failed: number;
    pending: number;
  }>;
}

export function JobVolumeBarChart({ data }: JobVolumeBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartColors.border}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={{ stroke: chartColors.border }}
        />
        <YAxis
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        <Bar
          dataKey="completed"
          name="Completed"
          fill={chartColors.primary}
          radius={[2, 2, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          dataKey="failed"
          name="Failed"
          fill={chartColors.danger}
          radius={[2, 2, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          dataKey="pending"
          name="Pending"
          fill={chartColors.secondary}
          radius={[2, 2, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Area Chart for value workflows (with glow effect)
interface ValueWorkflowAreaChartProps {
  data: Array<{
    date: string;
    revenue: number;
    cost: number;
    margin: number;
  }>;
}

export function ValueWorkflowAreaChart({ data }: ValueWorkflowAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.blue} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColors.blue} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartColors.border}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={{ stroke: chartColors.border }}
        />
        <YAxis
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value} ETH`}
          width={60}
        />
        <Tooltip content={<CustomTooltip unit=" ETH" />} />
        <Legend content={<CustomLegend />} />
        <Area
          type="monotone"
          dataKey="cost"
          name="Cost"
          stroke={chartColors.blue}
          strokeWidth={2}
          fill="url(#costGradient)"
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={chartColors.primary}
          strokeWidth={2}
          fill="url(#revenueGradient)"
          activeDot={{ r: 4, fill: chartColors.primary }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Sparkline for inline metrics
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = chartColors.primary, height = 40 }: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sparklineGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sparklineGradient-${color})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
