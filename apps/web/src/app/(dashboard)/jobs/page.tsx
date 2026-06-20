"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Clock,
  DollarSign,
  Server,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/shared/page-header";
import { useJobs, type Job } from "@/hooks/use-jobs";

// Status icons
const statusIcons = {
  pending: <RefreshCw className="h-3.5 w-3.5" />,
  running: <Server className="h-3.5 w-3.5" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5" />,
  failed: <XCircle className="h-3.5 w-3.5" />,
  requeued: <AlertTriangle className="h-3.5 w-3.5" />,
};

// Format currency
function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Empty state component
function EmptyJobsState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-zinc-800 rounded-lg">
      <Server className="h-10 w-10 text-foreground-muted mb-4" />
      <h3 className="text-base font-semibold text-foreground mb-1">
        {hasFilters ? "No matching jobs found" : "No jobs yet"}
      </h3>
      <p className="text-sm text-foreground-muted max-w-sm mb-4">
        {hasFilters
          ? "Try adjusting your search or filter criteria"
          : "Submit your first compute job to start tracking execution on the GPU network"}
      </p>
      {!hasFilters && (
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Submit Job
        </Button>
      )}
    </div>
  );
}

// Job Card component
function JobCard({ job }: { job: Job }) {
  return (
    <Card className="bg-bg-surface/80 overflow-hidden group hover:border-zinc-700 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm font-mono-data text-foreground truncate">
              {job.id}
            </span>
            <span className="text-xs text-foreground-muted">
              {job.clientId}
            </span>
          </div>
          <StatusBadge status={job.status} showPulse />
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-foreground-muted">Progress</span>
            <span className="font-mono-data text-foreground">{job.progress}%</span>
          </div>
          <div className="h-1.5 bg-bg-base rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                job.status === "completed" ? "bg-indicator-active" :
                job.status === "failed" ? "bg-indicator-slashed" :
                "bg-indicator-stale"
              )}
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground-muted">SLA</span>
            <span className="font-mono-data text-foreground">{(job as any).sla?.requiredUptime?.toFixed(1) || 95}%</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground-muted">Nodes</span>
            <span className="font-mono-data text-foreground">{job.assignedNodes}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground-muted">Cost</span>
            <span className="font-mono-data text-indicator-active">{formatCost(job.cost)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-hairline flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-foreground-muted">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(new Date(job.createdAt))}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// View toggle component
function ViewToggle({
  view,
  onChange,
}: {
  view: "table" | "cards";
  onChange: (view: "table" | "cards") => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-bg-surface/50 border border-hairline rounded-md">
      <button
        onClick={() => onChange("table")}
        className={cn(
          "p-1.5 rounded transition-colors",
          view === "table"
            ? "bg-bg-surface text-foreground"
            : "text-foreground-muted hover:text-foreground"
        )}
        title="Table view"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange("cards")}
        className={cn(
          "p-1.5 rounded transition-colors",
          view === "cards"
            ? "bg-bg-surface text-foreground"
            : "text-foreground-muted hover:text-foreground"
        )}
        title="Card view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}

// Filter pills component
function FilterPills({
  filters,
  onRemove,
}: {
  filters: { label: string; value: string }[];
  onRemove: (value: string) => void;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Badge key={filter.value} variant="outline" className="gap-1.5 pl-2 pr-1.5">
          <span className="text-foreground-muted">{filter.label}:</span>
          <span className="text-foreground">{filter.value}</span>
          <button
            onClick={() => onRemove(filter.value)}
            className="ml-1 text-foreground-muted hover:text-foreground"
          >
            ×
          </button>
        </Badge>
      ))}
    </div>
  );
}

export default function JobsPage() {
  const { data: jobs, isLoading } = useJobs();
  const [view, setView] = React.useState<"table" | "cards">("table");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);

  // Filter jobs by status
  const filteredJobs = React.useMemo(() => {
    if (!jobs) return [];
    if (statusFilter.length === 0) return jobs;
    return jobs.filter((job) => statusFilter.includes(job.status));
  }, [jobs, statusFilter]);

  // Column definitions
  const columns = React.useMemo<ColumnDef<any>[]>(() => [
      {
        accessorKey: "id",
        header: "Job ID",
        cell: ({ row }) => (
          <span className="font-mono-data text-sm text-foreground truncate max-w-[140px] block">
            {row.original.id}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "clientId",
        header: "Client",
        cell: ({ row }) => (
          <span className="text-sm text-foreground-muted">{row.original.clientId}</span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <StatusBadge status={row.original.status} showPulse />
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "slaUptime",
        header: "SLA",
        cell: ({ row }) => (
          <span className="text-sm font-mono-data text-foreground">
            {row.original.slaUptime.toFixed(1)}%
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "assignedNodes",
        header: "Nodes",
        cell: ({ row }) => (
          <span className="text-sm font-mono-data text-foreground text-center block">
            {row.original.assignedNodes}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <div className="w-16 h-1.5 bg-bg-base rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  row.original.status === "completed" ? "bg-indicator-active" :
                  row.original.status === "failed" ? "bg-indicator-slashed" :
                  "bg-indicator-stale"
                )}
                style={{ width: `${row.original.progress}%` }}
              />
            </div>
            <span className="text-xs font-mono-data text-foreground-muted w-8">
              {row.original.progress}%
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "cost",
        header: "Cost",
        cell: ({ row }) => (
          <span className="text-sm font-mono-data text-indicator-active text-right block">
            {formatCost(row.original.cost)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "createdAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-sm text-foreground-muted">
            {formatRelativeTime(new Date(row.original.createdAt))}
          </span>
        ),
        enableSorting: true,
      },
    ],
    []
  );


  const table = useReactTable({
    data: filteredJobs,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  const activeFilters: { label: string; value: string }[] = [];
  if (statusFilter.length > 0) {
    activeFilters.push({ label: "Status", value: statusFilter.join(", ") });
  }

  const hasFilters = activeFilters.length > 0 || globalFilter.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <PageHeader
        title="Jobs"
        description="Track and monitor GPU compute job execution"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Submit Job
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search and controls row */}
            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  type="search"
                  placeholder="Search jobs..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {/* Status filter buttons */}
              <div className="flex items-center gap-1">
                {(["pending", "running", "completed", "failed", "requeued"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter.includes(status) ? "primary" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter((prev) =>
                        prev.includes(status)
                          ? prev.filter((s) => s !== status)
                          : [...prev, status]
                      );
                    }}
                    className={cn(
                      "h-9 text-xs capitalize",
                      statusFilter.includes(status) &&
                        status === "completed" && "bg-indicator-active/20 text-indicator-active border-indicator-active/30 hover:bg-indicator-active/30",
                      statusFilter.includes(status) &&
                        status === "running" && "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
                      statusFilter.includes(status) &&
                        status === "failed" && "bg-indicator-slashed/20 text-indicator-slashed border-indicator-slashed/30 hover:bg-indicator-slashed/30",
                      statusFilter.includes(status) &&
                        status === "pending" && "bg-zinc-500/20 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/30",
                      statusFilter.includes(status) &&
                        status === "requeued" && "bg-indicator-stale/20 text-indicator-stale border-indicator-stale/30 hover:bg-indicator-stale/30"
                    )}
                  >
                    {status}
                  </Button>
                ))}
              </div>

              {/* View toggle */}
              <ViewToggle view={view} onChange={setView} />

              {/* Sort indicator */}
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Active filters */}
            <FilterPills
              filters={activeFilters}
              onRemove={(value) => {
                if (value.includes(",")) {
                  setStatusFilter([]);
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content based on view */}
      {view === "table" ? (
        /* Table View */
        <Card className="bg-bg-surface/80 overflow-hidden">
          {filteredJobs.length === 0 ? (
            <CardContent className="p-6">
              <EmptyJobsState hasFilters={hasFilters} />
            </CardContent>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b border-hairline">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className={cn(
                              "px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider",
                              header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <div className="flex items-center gap-1">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() && (
                                header.column.getIsSorted() === "asc" ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-bg-base/50 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-hairline">
                <div className="text-xs text-foreground-muted">
                  Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{" "}
                  of {table.getFilteredRowModel().rows.length} jobs
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-mono-data text-foreground-muted px-2">
                    {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      ) : (
        /* Card Grid View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full">
              <EmptyJobsState hasFilters={hasFilters} />
            </div>
          ) : (
            filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      )}
    </div>
  );
}