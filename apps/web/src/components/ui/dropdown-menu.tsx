"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Circle } from "lucide-react";

export interface DropdownMenuProps {
  children?: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <>{children}</>;
}

export interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ className, asChild = false, children, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<DOMRect | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useImperativeHandle(ref, () => triggerRef.current!);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && triggerRef.current) {
      setPosition(triggerRef.current.getBoundingClientRect());
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [open]);

  const handleTriggerClick = () => {
    handleOpenChange(!open);
  };

  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; ref?: React.Ref<unknown> }>;
    return React.cloneElement(childElement, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent) => {
        childElement.props.onClick?.(e);
        handleTriggerClick();
      },
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      className={className}
      onClick={handleTriggerClick}
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

interface DropdownMenuPortalProps {
  position: DOMRect;
  children: React.ReactNode;
}

function DropdownMenuPortal({ position, children }: DropdownMenuPortalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const top = position.bottom + 4;
  const left = position.left;

  return createPortal(
    <div
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden",
        "bg-bg-surface/95 backdrop-blur-xl",
        "border border-hairline rounded-md shadow-xl",
        "animate-in fade-in-0 zoom-in-95 duration-150"
      )}
      style={{ top, left }}
    >
      {children}
    </div>,
    document.body
  );
}

export interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-1", className)}
    onClick={(e) => {
      if (e.target === e.currentTarget && onClose) {
        onClose();
      }
    }}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const childWithProps = child as React.ReactElement<{ onClose?: () => void }>;
        return React.cloneElement(childWithProps, { onClose });
      }
      return child;
    })}
  </div>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  destructive?: boolean;
  onClose?: () => void;
}

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ className, inset, destructive, onClose, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm",
      "px-2 py-1.5 text-sm outline-none",
      "transition-colors duration-100",
      inset ? "pl-8" : "pl-3",
      destructive
        ? "text-indicator-slashed hover:bg-indicator-slashed/10"
        : "text-foreground hover:bg-zinc-800/50 hover:text-foreground",
      "focus:bg-zinc-800/50",
      className
    )}
    onClick={() => onClose?.()}
    {...props}
  >
    {children}
  </div>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export interface DropdownMenuLabelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  DropdownMenuLabelProps
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export interface DropdownMenuSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border-hairline", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuCheckboxItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  onClose?: () => void;
}

export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(({ className, checked, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      "transition-colors duration-100",
      "hover:bg-zinc-800/50 focus:bg-zinc-800/50",
      className
    )}
    onClick={() => onClose?.()}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Check className="h-4 w-4 text-indicator-active" />}
    </span>
    {children}
  </div>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export interface DropdownMenuRadioItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  destructive?: boolean;
  onClose?: () => void;
}

export const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuRadioItemProps
>(({ className, destructive, onClose, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      "transition-colors duration-100",
      "hover:bg-zinc-800/50 focus:bg-zinc-800/50",
      destructive ? "text-indicator-slashed" : "text-foreground",
      className
    )}
    onClick={() => onClose?.()}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Circle className="h-2 w-2 fill-current" />
    </span>
    {children}
  </div>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export interface DropdownMenuSubProps {
  children?: React.ReactNode;
}

export function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  return <>{children}</>;
}

export interface DropdownMenuSubTriggerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSubTriggerProps
>(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      "hover:bg-zinc-800/50 focus:bg-zinc-800/50",
      inset ? "pl-8" : "pl-3",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </div>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export interface DropdownMenuGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuGroup = React.forwardRef<
  HTMLDivElement,
  DropdownMenuGroupProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-1", className)} {...props} />
));
DropdownMenuGroup.displayName = "DropdownMenuGroup";