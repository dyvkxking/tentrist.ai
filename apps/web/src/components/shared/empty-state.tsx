"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox, Search, Server, Users, FileX, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type EmptyStateVariant =
  | "default"
  | "search"
  | "jobs"
  | "nodes"
  | "users"
  | "files"
  | "error";

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig: Record<
  EmptyStateVariant,
  { icon: React.ReactNode; defaultTitle: string; defaultDescription: string }
> = {
  default: {
    icon: <Inbox className="h-8 w-8" />,
    defaultTitle: "No data available",
    defaultDescription: "There are no items to display at this time.",
  },
  search: {
    icon: <Search className="h-8 w-8" />,
    defaultTitle: "No results found",
    defaultDescription: "Try adjusting your search terms or filters.",
  },
  jobs: {
    icon: <Server className="h-8 w-8" />,
    defaultTitle: "No jobs yet",
    defaultDescription: "Submit your first compute job to get started.",
  },
  nodes: {
    icon: <Server className="h-8 w-8" />,
    defaultTitle: "No nodes registered",
    defaultDescription: "Register a GPU node to start processing workloads.",
  },
  users: {
    icon: <Users className="h-8 w-8" />,
    defaultTitle: "No users found",
    defaultDescription: "Invite team members to collaborate.",
  },
  files: {
    icon: <FileX className="h-8 w-8" />,
    defaultTitle: "No files uploaded",
    defaultDescription: "Upload your first file to get started.",
  },
  error: {
    icon: <AlertCircle className="h-8 w-8" />,
    defaultTitle: "Something went wrong",
    defaultDescription: "An error occurred while loading this data.",
  },
};

export function EmptyState({
  variant = "default",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6",
        "text-center",
        className
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          "flex items-center justify-center mb-4 p-4",
          "rounded-full bg-bg-surface/50 border border-dashed border-zinc-800",
          "text-foreground-muted"
        )}
      >
        {config.icon}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground mb-1">
        {title || config.defaultTitle}
      </h3>

      {/* Description */}
      <p className="text-sm text-foreground-muted max-w-sm mb-4">
        {description || config.defaultDescription}
      </p>

      {/* Action button */}
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Compact variant for inline empty states
export interface EmptyStateInlineProps extends Omit<EmptyStateProps, "className"> {
  compact?: boolean;
}

export function EmptyStateInline({
  variant = "default",
  title,
  description,
  action,
  compact = false,
}: EmptyStateInlineProps) {
  const config = variantConfig[variant];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-foreground-muted">
        <span className="text-foreground-muted">{config.icon}</span>
        <span className="text-sm">
          {title || config.defaultTitle}
        </span>
      </div>
    );
  }

  return (
    <EmptyState
      variant={variant}
      title={title}
      description={description}
      action={action}
    />
  );
}