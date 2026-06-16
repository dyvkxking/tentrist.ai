"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const buttonVariants = {
  primary: [
    "bg-indicator-active/20 text-indicator-active border-indicator-active/40",
    "hover:bg-indicator-active/30 hover:border-indicator-active/60",
    "active:bg-indicator-active/40",
  ],
  secondary: [
    "bg-bg-surface text-foreground border-border-hairline",
    "hover:bg-zinc-800/50 hover:border-zinc-700",
    "active:bg-zinc-800",
  ],
  outline: [
    "bg-transparent text-foreground border-border-hairline",
    "hover:bg-bg-surface hover:border-zinc-700",
    "active:bg-zinc-800/50",
  ],
  ghost: [
    "bg-transparent text-foreground-muted",
    "hover:bg-bg-surface hover:text-foreground",
    "active:bg-zinc-800/30",
  ],
  destructive: [
    "bg-indicator-slashed/20 text-indicator-slashed border-indicator-slashed/40",
    "hover:bg-indicator-slashed/30 hover:border-indicator-slashed/60",
    "active:bg-indicator-slashed/40",
  ],
};

const buttonSizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  icon: "h-10 w-10 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md font-medium",
          "border transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-active/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
          "disabled:pointer-events-none disabled:opacity-50",

          // Variant styles
          buttonVariants[variant],

          // Size styles
          buttonSizes[size],

          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";