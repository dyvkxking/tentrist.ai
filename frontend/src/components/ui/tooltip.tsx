"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  placement = "top",
  delay = 200,
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
  } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const showTooltip = React.useCallback(() => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let top = 0;
        let left = 0;

        switch (placement) {
          case "top":
            top = rect.top + scrollY - 8;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case "bottom":
            top = rect.bottom + scrollY + 8;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case "left":
            top = rect.top + scrollY + rect.height / 2;
            left = rect.left + scrollX - 8;
            break;
          case "right":
            top = rect.top + scrollY + rect.height / 2;
            left = rect.right + scrollX + 8;
            break;
        }

        setPosition({ top, left });
        setVisible(true);
      }
    }, delay);
  }, [delay, placement, disabled]);

  const hideTooltip = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!mounted) {
    return <div ref={triggerRef}>{children}</div>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </div>
      {visible && position && (
        <TooltipContent
          content={content}
          position={position}
          placement={placement}
        />
      )}
    </>
  );
}

interface TooltipContentProps {
  content: React.ReactNode;
  position: { top: number; left: number };
  placement: TooltipPlacement;
}

function TooltipContent({ content, position, placement }: TooltipContentProps) {
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);

  React.useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { top, left } = position;

      // Adjust horizontal position
      if (placement === "top" || placement === "bottom") {
        if (left - rect.width / 2 < 8) {
          left = rect.width / 2 + 8;
        } else if (left + rect.width / 2 > viewportWidth - 8) {
          left = viewportWidth - rect.width / 2 - 8;
        }
      }

      // Adjust vertical position
      if (placement === "left" || placement === "right") {
        if (top - rect.height / 2 < 8) {
          top = rect.height / 2 + 8;
        } else if (top + rect.height / 2 > viewportHeight - 8) {
          top = viewportHeight - rect.height / 2 - 8;
        }
      }

      setAdjustedPosition({ top, left });
    }
  }, [position, placement]);

  const placementClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-bg-surface border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-bg-surface border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-bg-surface border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-bg-surface border-y-transparent border-l-transparent",
  };

  return createPortal(
    <div
      ref={tooltipRef}
      className={cn(
        "absolute z-50 pointer-events-none",
        "animate-in fade-in-0 zoom-in-95 duration-150"
      )}
      style={{
        top: adjustedPosition.top,
        left: adjustedPosition.left,
      }}
    >
      <div
        className={cn(
          "relative flex items-center justify-center",
          "px-2.5 py-1.5",
          "bg-bg-surface/95 backdrop-blur-xl",
          "border border-hairline rounded-md shadow-lg",
          "text-xs text-foreground",
          placementClasses[placement]
        )}
      >
        {content}
        <span
          className={cn(
            "absolute w-0 h-0",
            "border-[5px]",
            arrowClasses[placement]
          )}
        />
      </div>
    </div>,
    document.body
  );
}

// Hook for programmatic tooltip usage
export interface UseTooltipProps {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
}

export function useTooltip({
  content,
  placement = "top",
  delay = 200,
}: UseTooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
  } | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const show = React.useCallback((trigger: HTMLElement) => {
    triggerRef.current = trigger;
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let top = 0;
        let left = 0;

        switch (placement) {
          case "top":
            top = rect.top + scrollY - 8;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case "bottom":
            top = rect.bottom + scrollY + 8;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case "left":
            top = rect.top + scrollY + rect.height / 2;
            left = rect.left + scrollX - 8;
            break;
          case "right":
            top = rect.top + scrollY + rect.height / 2;
            left = rect.right + scrollX + 8;
            break;
        }

        setPosition({ top, left });
        setVisible(true);
      }
    }, delay);
  }, [delay, placement]);

  const hide = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  }, []);

  return {
    visible,
    position,
    triggerProps: {
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => show(e.currentTarget),
      onMouseLeave: hide,
      onFocus: (e: React.FocusEvent<HTMLElement>) => show(e.currentTarget),
      onBlur: hide,
    },
    tooltipProps: visible && position ? (
      <TooltipContent content={content} position={position} placement={placement} />
    ) : null,
  };
}