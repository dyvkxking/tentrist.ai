"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  return <>{open && <DialogOverlay onOpenChange={onOpenChange}>{children}</DialogOverlay>}</>;
}

export interface DialogOverlayProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function DialogOverlay({ onOpenChange, children }: DialogOverlayProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onOpenChange) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onOpenChange]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (mounted) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-bg-base/80 backdrop-blur-sm",
        "animate-in fade-in-0 duration-200"
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget && onOpenChange) {
          onOpenChange(false);
        }
      }}
    >
      <div
        className={cn(
          "relative bg-bg-surface/95 backdrop-blur-xl",
          "border border-hairline rounded-lg shadow-2xl",
          "max-h-[85vh] overflow-hidden",
          "animate-in zoom-in-95 fade-in-0 duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, onClose, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col w-full", className)}
      {...props}
    >
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 p-1 rounded-md",
            "text-foreground-muted hover:text-foreground",
            "hover:bg-zinc-800/50 transition-colors duration-150"
          )}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  )
);
DialogContent.displayName = "DialogContent";

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 p-6 pb-0", className)}
      {...props}
    />
  )
);
DialogHeader.displayName = "DialogHeader";

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
);
DialogTitle.displayName = "DialogTitle";

export interface DialogDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-foreground-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
  )
);
DialogBody.displayName = "DialogBody";

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-3 p-6 pt-0",
        className
      )}
      {...props}
    />
  )
);
DialogFooter.displayName = "DialogFooter";