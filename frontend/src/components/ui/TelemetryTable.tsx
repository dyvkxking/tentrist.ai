"use client";

import { cn } from "@/lib/utils";

interface TelemetryTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    label: string;
    align?: "left" | "center" | "right";
    width?: string;
    render?: (item: T) => React.ReactNode;
  }[];
  emptyMessage?: string;
  className?: string;
}

export function TelemetryTable<T>({
  data,
  columns,
  emptyMessage = "No data available",
  className,
}: TelemetryTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          "border border-dashed border-zinc-800 rounded-lg",
          className
        )}
      >
        <span className="text-foreground-muted text-sm">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-hairline", className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-bg-surface border-b border-hairline">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider",
                  col.align === "left" && "text-left",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right"
                )}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {data.map((item, index) => (
            <tr
              key={index}
              className="bg-bg-base hover:bg-bg-surface/50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={cn(
                    "px-4 py-3 text-sm",
                    col.align === "left" && "text-left",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    // Default monospace for address-like fields
                    typeof col.key === "string" &&
                      (col.key.toLowerCase().includes("address") ||
                        col.key.toLowerCase().includes("hash") ||
                        col.key.toLowerCase().includes("id"))
                      ? "font-mono-data"
                      : "font-sans"
                  )}
                >
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key as string] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}