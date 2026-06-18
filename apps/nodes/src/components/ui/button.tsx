"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "outline" | "default" | "destructive";
  size?: "icon" | "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50",
          {
            "bg-[#22c55e] text-white hover:bg-[#16a34a]": variant === "default",
            "bg-transparent border border-[#27272a] text-white hover:bg-[#27272a]": variant === "outline",
            "bg-transparent hover:bg-[#27272a] text-[#71717a] hover:text-white": variant === "ghost",
            "bg-[#ef4444] text-white hover:bg-[#dc2626]": variant === "destructive",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          size === "icon" && "h-9 w-9",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : children}
      </button>
    );
  }
);
Button.displayName = "Button";