"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  className,
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: TabsProps) {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : selectedValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setSelectedValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className={cn("w-full", className)} data-state={currentValue} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<TabsListProps>(child) && child.type === TabsList) {
          return React.cloneElement(child, {
            value: currentValue,
            onValueChange: handleValueChange,
          });
        }
        if (
          React.isValidElement<TabsContentProps>(child) &&
          child.type === TabsContent
        ) {
          return React.cloneElement(child, {
            value: currentValue,
          });
        }
        return child;
      })}
    </div>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    const tabsMap = React.useRef<Map<string, HTMLButtonElement>>(new Map());

    React.useEffect(() => {
      // Re-map tabs when children change
      tabsMap.current.clear();
    }, [children]);

    const registerTab = React.useCallback(
      (tabValue: string, element: HTMLButtonElement | null) => {
        if (element) {
          tabsMap.current.set(tabValue, element);
        } else {
          tabsMap.current.delete(tabValue);
        }
      },
      []
    );

    const selectedTab = value ? tabsMap.current.get(value) : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          "bg-bg-surface/50 backdrop-blur-sm",
          "border border-hairline rounded-lg p-1",
          "gap-0.5",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (
            React.isValidElement<TabsTriggerProps>(child) &&
            child.type === TabsTrigger
          ) {
            return React.cloneElement(child, {
              value,
              onValueChange,
              onRegister: registerTab,
              isSelected: child.props.value === value,
            });
          }
          return child;
        })}
      </div>
    );
  }
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  isSelected?: boolean;
  onValueChange?: (value: string) => void;
  onRegister?: (value: string, element: HTMLButtonElement | null) => void;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    {
      className,
      value: tabValue,
      disabled,
      isSelected,
      onValueChange,
      onRegister,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const setRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    React.useEffect(() => {
      if (onRegister) {
        onRegister(tabValue, internalRef.current);
        return () => onRegister(tabValue, null);
      }
    }, [tabValue, onRegister]);

    return (
      <button
        ref={setRef}
        type="button"
        role="tab"
        disabled={disabled}
        aria-selected={isSelected}
        data-state={isSelected ? "active" : "inactive"}
        className={cn(
          "relative px-3 py-1.5 text-sm font-medium rounded-md",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-active/50",
          "disabled:pointer-events-none disabled:opacity-50",
          isSelected
            ? "bg-bg-surface text-foreground shadow-sm"
            : "text-foreground-muted hover:text-foreground hover:bg-zinc-800/30",
          className
        )}
        onClick={() => !disabled && onValueChange?.(tabValue)}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const isActive = React.useMemo(() => {
      // Find the parent Tabs component's selected value via context or DOM
      const tabsElement = document.querySelector('[data-state]');
      const parentState = tabsElement?.getAttribute('data-state');
      return parentState === value;
    }, [value]);

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "mt-2 animate-in fade-in-0 duration-200",
          isActive && "animate-in slide-in-from-top-1 duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";