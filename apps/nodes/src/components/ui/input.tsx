import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#ededed] mb-1.5">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "w-full px-3 py-2 bg-[#0f1011] border border-[#27272a] rounded-lg text-sm text-[#ededed] placeholder:text-[#71717a] focus:outline-none focus:border-[#22c55e] transition-colors",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
