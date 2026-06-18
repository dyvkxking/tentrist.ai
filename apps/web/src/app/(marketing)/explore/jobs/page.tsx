"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/shared/page-header";

const JOBS = [
  { id: "job_8a3f2e1c4d", type: "LLM Fine-tuning", status: "completed" as const, value: "$0.023 ETH", nodes: 2, sla: "99%", createdAt: "Jun 15, 2024" },
  { id: "job_7b2e4d5f6a", type: "Batch Rendering", status: "running" as const, value: "$0.009 ETH", nodes: 1, sla: "95%", createdAt: "Jun 14, 2024" },
  { id: "job_6c1a3e8b9d", type: "LLM Fine-tuning", status: "failed" as const, value: "$0.015 ETH", nodes: 1, sla: "99.5%", createdAt: "Jun 10, 2024" },
  { id: "job_5d0b2c7a8e", type: "Batch Compute", status: "completed" as const, value: "$0.008 ETH", nodes: 3, sla: "90%", createdAt: "Jun 8, 2024" },
  { id: "job_4e9c3d8b1f", type: "LLM Fine-tuning", status: "requeued" as const, value: "$0.031 ETH", nodes: 2, sla: "99%", createdAt: "Jun 5, 2024" },
];

export default function ExploreJobsPage() {
  const [search, setSearch] = React.useState("");

  const filtered = JOBS.filter((j) => j.id.includes(search) || j.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <PageHeader title="Network Jobs" description="All jobs submitted across the Tentrist network" />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search by job ID or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-bg-surface border border-hairline rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-indicator-active"
        />
      </div>

      <Card className="bg-bg-surface/80">
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            <div className="grid grid-cols-6 gap-4 px-6 py-3 text-xs text-foreground-muted uppercase tracking-wider">
              <span>Job ID</span>
              <span>Type</span>
              <span>Status</span>
              <span className="text-right">Value</span>
              <span className="text-right">Nodes</span>
              <span className="text-right">Created</span>
            </div>
            {filtered.map((job) => (
              <Link
                key={job.id}
                href={`/explore/jobs/${job.id}`}
                className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-bg-base/30 transition-colors"
              >
                <code className="text-sm font-mono text-foreground">{job.id.slice(0, 14)}…</code>
                <span className="text-sm text-foreground">{job.type}</span>
                <StatusBadge status={job.status as "pending" | "running" | "completed" | "failed" | "requeued" | "cancelled"} />
                <span className="text-sm font-mono text-foreground text-right">{job.value}</span>
                <span className="text-sm font-mono text-foreground text-right">{job.nodes}</span>
                <span className="text-sm text-foreground-muted text-right">{job.createdAt}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
