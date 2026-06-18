"use client";

import * as React from "react";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const ctx = React.useContext(DropdownMenuContext)!;
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => ctx.setOpen(!ctx.open),
    });
  }
  return (
    <button onClick={() => ctx.setOpen(!ctx.open)} className="inline-flex items-center">
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(DropdownMenuContext)!;
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ctx.setOpen(false);
      }
    };
    if (ctx.open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ctx.open]);

  if (!ctx.open) return null;

  return createPortal(
    <div
      ref={ref}
      className={`absolute right-0 mt-1 z-50 min-w-[8rem] rounded-md border border-[#27272a] bg-[#0f1011] p-1 shadow-lg ${className ?? ""}`}
      style={{ top: "100%" }}
    >
      {children}
    </div>,
    document.body
  );
}

export function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-1.5 text-sm font-semibold text-white">{children}</div>;
}

export function DropdownMenuItem({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const ctx = React.useContext(DropdownMenuContext)!;
  return (
    <button
      onClick={() => { onClick?.(); ctx.setOpen(false); }}
      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-[#27272a] text-[#e4e4e7] cursor-pointer ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-[#27272a]" />;
}