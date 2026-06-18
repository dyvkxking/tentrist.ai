"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      error = false,
      label,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium",
              disabled ? "text-foreground-muted/50" : "text-foreground"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            disabled={disabled}
            ref={ref}
            className={cn(
              // Base styles
              "flex h-10 w-full rounded-md border bg-bg-base px-3 py-2",
              "text-sm text-foreground placeholder:text-foreground-muted",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-active/50 focus-visible:border-indicator-active",
              "disabled:cursor-not-allowed disabled:opacity-50",

              // Error state
              error
                ? "border-indicator-slashed/60 focus-visible:ring-indicator-slashed/50"
                : "border-border-hairline",

              // Icon padding
              leftIcon && "pl-10",
              rightIcon && "pr-10",

              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {helperText && (
          <span
            className={cn(
              "text-xs",
              error ? "text-indicator-slashed" : "text-foreground-muted"
            )}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, label, helperText, disabled, id, ...props }, ref) => {
    const textareaId = id || React.useId();

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "text-sm font-medium",
              disabled ? "text-foreground-muted/50" : "text-foreground"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          disabled={disabled}
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border bg-bg-base px-3 py-2",
            "text-sm text-foreground placeholder:text-foreground-muted",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-active/50 focus-visible:border-indicator-active",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-indicator-slashed/60 focus-visible:ring-indicator-slashed/50"
              : "border-border-hairline",
            className
          )}
          {...props}
        />
        {helperText && (
          <span
            className={cn(
              "text-xs",
              error ? "text-indicator-slashed" : "text-foreground-muted"
            )}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";