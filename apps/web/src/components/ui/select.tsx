"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  disabled,
  placeholder = "Select...",
  children,
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "");
  const [position, setPosition] = React.useState<DOMRect | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : selectedValue;

  const selectedLabel = React.useMemo(() => {
    const values = React.Children.toArray(children)
      .flatMap((child) => {
        if (React.isValidElement<SelectItemProps>(child) && child.type === SelectItem) {
          return [child];
        }
        if (React.isValidElement<SelectGroupProps>(child) && child.type === SelectGroup) {
          return React.Children.toArray((child as React.ReactElement<SelectGroupProps>).props.children).filter(
            (c) => React.isValidElement<SelectItemProps>(c) && c.type === SelectItem
          );
        }
        return [];
      })
      .map((child) => child as React.ReactElement<SelectItemProps>);

    const selected = values.find(
      (v) => v.props.value === currentValue
    );
    return selected?.props.children || placeholder;
  }, [children, currentValue, placeholder]);

  const handleOpen = () => {
    if (!disabled) {
      setOpen(true);
      if (triggerRef.current) {
        setPosition(triggerRef.current.getBoundingClientRect());
      }
    }
  };

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setSelectedValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  // Handle click outside
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between",
          "rounded-md border bg-bg-base px-3 py-2 text-sm",
          "border-border-hairline",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indicator-active/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-zinc-700 transition-colors duration-150",
          open && "border-indicator-active/50",
          className
        )}
        onClick={handleOpen}
      >
        <span className={cn(!currentValue && "text-foreground-muted")}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-foreground-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && position && (
        <SelectPortal position={position}>
          <SelectContent
            value={currentValue}
            onValueChange={handleValueChange}
          >
            {children}
          </SelectContent>
        </SelectPortal>
      )}
    </>
  );
}

interface SelectPortalProps {
  position: DOMRect;
  children: React.ReactNode;
}

function SelectPortal({ position, children }: SelectPortalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden",
        "bg-bg-surface/95 backdrop-blur-xl",
        "border border-hairline rounded-md shadow-xl",
        "animate-in fade-in-0 zoom-in-95 duration-150"
      )}
      style={{
        top: position.bottom + 4,
        left: position.left,
        width: position.width,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

interface SelectContentProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

function SelectContent({ value, onValueChange, children }: SelectContentProps) {
  return (
    <div className="p-1 max-h-[300px] overflow-y-auto">
      {React.Children.map(children, (child) => {
        if (React.isValidElement<SelectItemProps>(child) && child.type === SelectItem) {
          return React.cloneElement(child, {
            isSelected: child.props.value === value,
            onSelect: () => onValueChange?.(child.props.value),
          });
        }
        if (React.isValidElement<SelectGroupProps>(child) && child.type === SelectGroup) {
          return React.cloneElement(child, {
            value,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

export interface SelectItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, disabled, isSelected, onSelect, children, ...props }, ref) => (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      data-state={isSelected ? "checked" : "unchecked"}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2",
        "text-sm outline-none",
        "transition-colors duration-100",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-zinc-800/50 focus:bg-zinc-800/50",
        isSelected ? "text-foreground" : "text-foreground-muted",
        className
      )}
      onClick={() => !disabled && onSelect?.()}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-indicator-active" />}
      </span>
      {children}
    </div>
  )
);
SelectItem.displayName = "SelectItem";

export interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-foreground-muted uppercase tracking-wider",
        className
      )}
      {...props}
    />
  )
);
SelectLabel.displayName = "SelectLabel";

export interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-border-hairline", className)}
      {...props}
    />
  )
);
SelectSeparator.displayName = "SelectSeparator";

export interface SelectGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("p-1", className)} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement<SelectItemProps>(child) && child.type === SelectItem) {
            return React.cloneElement(child, {
              isSelected: child.props.value === value,
              onSelect: () => onValueChange?.(child.props.value),
            });
          }
          if (React.isValidElement<SelectLabelProps>(child) && child.type === SelectLabel) {
            return child;
          }
          return child;
        })}
      </div>
    );
  }
);
SelectGroup.displayName = "SelectGroup";