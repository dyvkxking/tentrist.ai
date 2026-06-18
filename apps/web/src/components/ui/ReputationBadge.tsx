"use client";

import { cn } from "@/lib/utils";

export type ReputationTier = "gold" | "silver" | "bronze" | "unranked";

interface ReputationBadgeProps {
  tier?: ReputationTier;
  score?: number;
  className?: string;
  size?: "sm" | "md";
  showScore?: boolean;
}

const tierConfig: Record<
  ReputationTier,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  }
> = {
  gold: {
    label: "Gold",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/30",
    icon: "◆",
  },
  silver: {
    label: "Silver",
    color: "text-zinc-300",
    bgColor: "bg-zinc-300/10",
    borderColor: "border-zinc-400/30",
    icon: "◇",
  },
  bronze: {
    label: "Bronze",
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
    borderColor: "border-orange-700/30",
    icon: "○",
  },
  unranked: {
    label: "Unranked",
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-600/30",
    icon: "—",
  },
};

export function ReputationBadge({
  tier,
  score,
  className,
  size = "md",
  showScore = false,
}: ReputationBadgeProps) {
  const resolvedTier: ReputationTier = tier ?? (score !== undefined ? getReputationTier(score) : "unranked");
  const config = tierConfig[resolvedTier];

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px] gap-1",
    md: "px-2 py-0.5 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <span className="font-mono-data">{config.icon}</span>
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-70 ml-1 font-mono-data">
          {score > 0 ? `+${score}` : score}
        </span>
      )}
    </span>
  );
}

// Helper to determine tier from reputation score
export function getReputationTier(score: number): ReputationTier {
  if (score >= 100) return "gold";
  if (score >= 50) return "silver";
  if (score >= 0) return "bronze";
  return "unranked";
}
