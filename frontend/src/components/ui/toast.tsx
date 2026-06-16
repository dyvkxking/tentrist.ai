"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// Simple toast store
let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

function addToast(toast: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { ...toast, id }];
  notifyListeners();

  // Auto remove after duration
  const duration = toast.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

export function useToast() {
  const [toastList, setToastList] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    toastListeners.push(setToastList);
    setToastList([...toasts]);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToastList);
    };
  }, []);

  return {
    toasts: toastList,
    toast: addToast,
    dismiss: removeToast,
  };
}

// Toast icon component
function ToastIcon({ variant }: { variant: ToastVariant }) {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-indicator-active" />;
    case "error":
      return <XCircle className="h-5 w-5 text-indicator-slashed" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-indicator-stale" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-400" />;
  }
}

// Toast item component
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg",
        "bg-bg-surface/95 backdrop-blur-xl",
        "animate-in slide-in-from-right-full duration-200",
        toast.variant === "success" && "border-indicator-active/30",
        toast.variant === "error" && "border-indicator-slashed/30",
        toast.variant === "warning" && "border-indicator-stale/30",
        toast.variant === "info" && "border-blue-500/30"
      )}
    >
      <ToastIcon variant={toast.variant} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-foreground-muted mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-bg-base rounded transition-colors"
      >
        <X className="h-4 w-4 text-foreground-muted" />
      </button>
    </div>
  );
}

// Toast container - renders to portal
export function ToastContainer() {
  const [mounted, setMounted] = React.useState(false);
  const [toastList, setToastList] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    setMounted(true);
    toastListeners.push(setToastList);
    setToastList([...toasts]);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToastList);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toastList.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}

// Convenience toast functions
export const toast = {
  success: (title: string, message?: string) => addToast({ variant: "success", title, message }),
  error: (title: string, message?: string) => addToast({ variant: "error", title, message }),
  warning: (title: string, message?: string) => addToast({ variant: "warning", title, message }),
  info: (title: string, message?: string) => addToast({ variant: "info", title, message }),
};
