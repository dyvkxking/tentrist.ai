"use client";

import * as React from "react";

// Toast types
export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
}

// Global toast state
let toasts: Toast[] = [];
let listeners: Set<(toasts: Toast[]) => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener([...toasts]));
}

function addToast(toast: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  const newToast: Toast = { ...toast, id };
  toasts = [...toasts, newToast];
  notifyListeners();

  // Auto remove after duration
  const duration = toast.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

function clearToasts() {
  toasts = [];
  notifyListeners();
}

// Toast hook
export function useToast() {
  const [toastList, setToastList] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    listeners.add(setToastList);
    setToastList([...toasts]);
    return () => {
      listeners.delete(setToastList);
    };
  }, []);

  const toast = React.useCallback(
    (options: Omit<Toast, "id">) => addToast(options),
    []
  );

  const dismiss = React.useCallback((id: string) => removeToast(id), []);

  const success = React.useCallback(
    (title: string, message?: string) =>
      addToast({ variant: "success", title, message }),
    []
  );

  const error = React.useCallback(
    (title: string, message?: string) =>
      addToast({ variant: "error", title, message }),
    []
  );

  const warning = React.useCallback(
    (title: string, message?: string) =>
      addToast({ variant: "warning", title, message }),
    []
  );

  const info = React.useCallback(
    (title: string, message?: string) =>
      addToast({ variant: "info", title, message }),
    []
  );

  return {
    toasts: toastList,
    toast,
    dismiss,
    success,
    error,
    warning,
    info,
    clear: clearToasts,
  };
}

// Export convenience functions for use outside of React components
export const toast = {
  success: (title: string, message?: string) =>
    addToast({ variant: "success", title, message }),
  error: (title: string, message?: string) =>
    addToast({ variant: "error", title, message }),
  warning: (title: string, message?: string) =>
    addToast({ variant: "warning", title, message }),
  info: (title: string, message?: string) =>
    addToast({ variant: "info", title, message }),
  dismiss: removeToast,
  clear: clearToasts,
};
