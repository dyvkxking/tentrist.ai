"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CheckpointingPage() {
  return (
    <div className="min-h-screen bg-[#010102] text-[#fafafa]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="border-[#27272a] text-[#a1a1aa] mb-4">
            Core Concepts
          </Badge>
          <h1 className="text-4xl font-sans font-semibold mb-4">
            Checkpoint-Based Job Migration
          </h1>
          <p className="text-[#a1a1aa] text-lg font-sans">
            Seamless job migration when GPU nodes fail, ensuring SLA compliance with zero data loss.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Overview</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed">
                Checkpoints enable seamless job migration when nodes fail. Rather than restarting a job from scratch,
                Tentrist captures periodic snapshots of computation state, allowing any eligible standby node to
                resume work precisely where it left off. This mechanism is fundamental to maintaining the
                enterprise-grade SLA guarantees that protect your workloads.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* What is a Checkpoint */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">What is a Checkpoint?</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                A checkpoint is a snapshot of job state at a given block. It captures:
              </p>
              <ul className="space-y-3">
                {[
                  "Computation progress — how much of the workload has been completed",
                  "Partial outputs — intermediate results that can be reused",
                  "Memory state — GPU VRAM contents, model weights, and session data",
                  "Execution context — current instruction pointer, stack frames, and environment variables",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#22c55e] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* When Checkpoints are Saved */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">When Checkpoints are Saved</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-6">
                Checkpoints are created automatically under the following conditions:
              </p>
              <div className="grid gap-4">
                {[
                  {
                    title: "Block Interval",
                    desc: "Every N blocks (configurable, default 50). The interval can be adjusted based on job complexity and risk tolerance.",
                    indicator: "active",
                  },
                  {
                    title: "Stable Progress Reported",
                    desc: "When a node reports stable progress above a configurable threshold, indicating a safe point to resume from.",
                    indicator: "active",
                  },
                  {
                    title: "Before Node Goes Offline",
                    desc: "A checkpoint is forced whenever a node signals imminent disconnection, ensuring no work is lost.",
                    indicator: "stale",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-lg border border-[#27272a] bg-[#010102]"
                  >
                    <span
                      className={cn(
                        "w-2 h-2 mt-2 rounded-full flex-shrink-0",
                        item.indicator === "active" ? "bg-[#22c55e]" : "bg-[#f59e0b]"
                      )}
                    />
                    <div>
                      <h3 className="font-sans font-medium text-[#fafafa] mb-1">{item.title}</h3>
                      <p className="text-sm text-[#a1a1aa]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Checkpoint Storage */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Checkpoint Storage</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Checkpoints are stored off-chain for performance and cost efficiency, with cryptographic
                verification recorded on-chain:
              </p>
              <ul className="space-y-3">
                {[
                  "Storage Backend — IPFS or S3-compatible object storage, depending on size and durability requirements",
                  "Content Addressing — each checkpoint is identified by its CID (Content Identifier), ensuring integrity",
                  "On-Chain Hash — the CID and metadata hash are recorded on the smart contract for tamper evidence",
                  "Universal Retrieval — any node can retrieve a checkpoint using its CID, enabling true decentralization",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#22c55e] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 rounded-lg bg-[#010102] border border-[#27272a]">
                <p className="text-sm font-mono text-[#a1a1aa]">
                  <span className="text-[#fafafa]">CID Example:</span>QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Failover Flow */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Failover Flow</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-6">
                When a node fails, Tentrist executes the following automated recovery sequence:
              </p>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Heartbeat Miss Detected",
                    desc: "The telemetry system identifies that a node has missed 3+ consecutive heartbeat pulses (30-second intervals).",
                  },
                  {
                    step: "2",
                    title: "Smart Contract Pauses Job",
                    desc: "The job state is frozen on-chain. No further work is dispatched until a standby node assumes responsibility.",
                  },
                  {
                    step: "3",
                    title: "Standby Node Selected",
                    desc: "The orchestrator selects an eligible standby node based on GPU capacity, region, and reputation score.",
                  },
                  {
                    step: "4",
                    title: "Latest Checkpoint Retrieved",
                    desc: "The standby node retrieves the most recent checkpoint using its CID from on-chain metadata.",
                  },
                  {
                    step: "5",
                    title: "Job Resumes from Checkpoint",
                    desc: "Execution resumes from the exact computation state captured in the checkpoint, not from the beginning.",
                  },
                  {
                    step: "6",
                    title: "SLA Clock Continues",
                    desc: "The SLA compliance clock does NOT reset. Time elapsed before failure counts against the original node, not the client.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#010102] border border-[#27272a] flex items-center justify-center">
                      <span className="text-sm font-mono text-[#22c55e]">{item.step}</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-sans font-medium text-[#fafafa] mb-1">{item.title}</h3>
                      <p className="text-sm text-[#a1a1aa]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Impact on SLA */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Impact on SLA</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                The checkpoint system ensures fairness in SLA compliance calculations:
              </p>
              <ul className="space-y-3">
                {[
                  "Recalculated from Checkpoint — SLA compliance is measured from the checkpoint timestamp forward, not from job submission",
                  "Failed Node Takes the Slash — the node that missed heartbeats bears the SLA penalty, not the client",
                  "Transparent Audit Trail — all checkpoint hashes and timestamps are recorded on-chain for dispute resolution",
                  "No Double Billing — clients are never charged for compute time lost due to node failure",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#a1a1aa]">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0",
                        i === 1 ? "bg-[#ef4444]" : "bg-[#22c55e]"
                      )}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Checkpoint API */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Checkpoint API</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="mb-4">
                <span className="inline-block px-2 py-1 rounded bg-[#22c55e]/10 text-[#22c55e] text-xs font-mono mr-2">
                  GET
                </span>
                <span className="font-mono text-sm text-[#fafafa]">
                  /api/v1/jobs/{`{jobId}`}/checkpoints
                </span>
              </div>
              <p className="text-[#a1a1aa] text-sm mb-4">
                List all checkpoints for a job. Returns block height, CID, and size.
              </p>
              <div className="p-4 rounded-lg bg-[#010102] border border-[#27272a] overflow-x-auto">
                <pre className="text-sm font-mono text-[#a1a1aa]">
{`{
  "data": [
    {
      "block_height": 18450,
      "cid": "QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx",
      "size_bytes": 1073741824,
      "created_at": "2026-06-18T10:30:00Z"
    },
    {
      "block_height": 18400,
      "cid": "QmWATWQ7fVPP2EFGu71UkfnqhYXNtHap31bhjSxxouC2y2",
      "size_bytes": 2147483648,
      "created_at": "2026-06-18T10:00:00Z"
    }
  ],
  "meta": {
    "total": 2,
    "job_id": "job_abc123"
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Client View */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Client View</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Clients can monitor checkpoint history directly from the dashboard. Navigate to{" "}
                <span className="font-mono text-[#fafafa]">/jobs/{`{id}`}/checkpoints</span> to view:
              </p>
              <ul className="space-y-3">
                {[
                  "Complete checkpoint timeline with block heights and timestamps",
                  "Checkpoint sizes and storage location indicators",
                  "Failover events and recovery history",
                  "SLA compliance recalculations after node failures",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#22c55e] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/jobs">
                  <Button className="bg-[#22c55e] text-[#010102] hover:bg-[#22c55e]/90">
                    View Jobs Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-[#27272a]">
          <Link href="/docs" className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors">
            &larr; Back to Documentation
          </Link>
          <Link href="/docs/node-registration">
            <Button variant="outline" className="border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]">
              Node Registration &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
