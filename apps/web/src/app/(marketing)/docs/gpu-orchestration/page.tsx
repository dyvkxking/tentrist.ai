"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GPUOrchestrationPage() {
  return (
    <div className="min-h-screen bg-[#010102] text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="border-[#27272a] text-zinc-400 mb-4">
            Architecture
          </Badge>
          <h1 className="text-4xl font-sans font-semibold mb-4">
            GPU Orchestration
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            How Tentrist splits and routes GPU workloads across decentralized nodes,
            enforcing SLAs automatically through smart contracts.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Overview</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 leading-relaxed">
                Tentrist acts as an orchestration layer between AI SaaS companies and
                decentralized GPU pools. When a compute job arrives, the platform evaluates
                registered nodes in real-time, splits workloads into checkpointed chunks,
                assigns work based on eligibility criteria, and monitors execution via
                30-second heartbeat telemetry. Every step is recorded on-chain, ensuring
                immutable auditability and automatic financial enforcement.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Node Eligibility */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Node Eligibility</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-4">
                A node must meet all criteria before it can receive workloads:
              </p>
              <div className="grid gap-4">
                {[
                  {
                    title: "Sufficient VRAM",
                    desc: "Node must have enough GPU memory to fit the job's minimum partition size.",
                    icon: "VRAM",
                  },
                  {
                    title: "Stake Threshold",
                    desc: "Node must have deposited collateral into the Escrow contract above the platform minimum.",
                    icon: "STAKE",
                  },
                  {
                    title: "Reputation Score",
                    desc: "Node must maintain a positive reputation score. Scores decrement on SLA breaches.",
                    icon: "REP",
                  },
                  {
                    title: "Geographic Region",
                    desc: "Job may specify region constraints; node must be in an allowed region for data residency compliance.",
                    icon: "GEO",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 p-4 rounded-lg border border-[#27272a] bg-[#010102]"
                  >
                    <div className="w-12 h-12 rounded bg-[#0f1011] border border-[#27272a] flex items-center justify-center flex-shrink-0">
                      <span className="font-mono text-xs text-[#22c55e]">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-zinc-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Workload Splitting */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Workload Splitting</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-4">
                Large jobs are automatically partitioned into checkpointed segments that can
                be distributed across multiple nodes. Each segment is a self-contained
                computational unit with defined inputs and outputs.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#0f1011] border border-[#27272a] flex items-center justify-center">
                    <span className="font-mono text-xs text-zinc-500">1</span>
                  </div>
                  <p className="text-sm text-zinc-300">
                    Job analyzer estimates total compute FLOPs and splits into equal partitions
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#0f1011] border border-[#27272a] flex items-center justify-center">
                    <span className="font-mono text-xs text-zinc-500">2</span>
                  </div>
                  <p className="text-sm text-zinc-300">
                    Each partition is wrapped with checkpoint metadata (state root, block height)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#0f1011] border border-[#27272a] flex items-center justify-center">
                    <span className="font-mono text-xs text-zinc-500">3</span>
                  </div>
                  <p className="text-sm text-zinc-300">
                    Partitions are assigned to eligible nodes based on VRAM capacity
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#0f1011] border border-[#27272a] flex items-center justify-center">
                    <span className="font-mono text-xs text-zinc-500">4</span>
                  </div>
                  <p className="text-sm text-zinc-300">
                    Results are merged at a synchronization barrier after all partitions complete
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Job Routing Flow */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-6">Job Routing Flow</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-4 bottom-4 w-px bg-[#27272a]" />

            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Job Submitted",
                  desc: "Client submits a compute job via REST API or SDK. Job includes FLOPs estimate, deadline, and SLA tier.",
                  status: "active",
                },
                {
                  step: "2",
                  title: "Eligible Nodes Identified",
                  desc: "Orchestrator queries on-chain registry, filtering by VRAM, stake, reputation, and region constraints.",
                  status: "active",
                },
                {
                  step: "3",
                  title: "SLA Recorded On-Chain",
                  desc: "SLAContract records uptime threshold, throughput minimum, and deadline. This is immutable.",
                  status: "active",
                },
                {
                  step: "4",
                  title: "Job Assigned",
                  desc: "Workload is split into partitions and assigned to eligible nodes. Checkpoint state is initialized.",
                  status: "active",
                },
                {
                  step: "5",
                  title: "Heartbeat Monitoring Begins",
                  desc: "30-second telemetry pulses start flowing from each assigned node to the validator network.",
                  status: "active",
                },
                {
                  step: "6",
                  title: "Completion & Payment",
                  desc: "On success, smart contract releases payment to node. On failure, slashing is triggered and job is re-routed.",
                  status: "active",
                },
              ].map((item) => (
                <div key={item.step} className="relative flex items-start gap-6 pl-0">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-xs font-bold text-black">{item.step}</span>
                  </div>
                  <Card className="bg-[#0f1011] border-[#27272a] flex-1">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-zinc-400">{item.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Automatic Failover */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Automatic Failover</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-sm text-[#ef4444]">FAIL</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Node Failure Detection</h3>
                  <p className="text-sm text-zinc-400">
                    If a node misses 3 consecutive heartbeat pulses, the platform
                    immediately flags an SLA breach and triggers recovery.
                  </p>
                </div>
              </div>
              <div className="border-t border-[#27272a] pt-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-sm text-[#22c55e]">ROUTE</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Seamless Migration</h3>
                    <p className="text-sm text-zinc-400">
                      The orchestrator retrieves the last checkpoint from on-chain state
                      and re-assigns the partition to a standby node. No client
                      intervention is required.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 rounded border border-[#27272a] bg-[#010102]">
                <p className="text-xs text-zinc-500 font-mono">
                  checkpoint_state = load_from_smart_contract(job_id, partition_id)
                  <br />
                  new_node.assign_partition(checkpoint_state)
                  <br />
                  heartbeat_monitor.start_monitoring(new_node)
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SLA Guarantees */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">SLA Guarantees</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-6">
                Every job on Tentrist carries an immutable, on-chain SLA. Financial
                enforcement is automatic — no manual refunds, no support tickets.
              </p>
              <div className="grid gap-4">
                {[
                  {
                    dimension: "Uptime",
                    requirement: "Node must send heartbeat every 30s",
                    breach: "3 missed pulses = SLA breach",
                    color: "#22c55e",
                  },
                  {
                    dimension: "Throughput",
                    requirement: "FLOPs output must meet contracted rate",
                    breach: "Below threshold for 3 consecutive checks = breach",
                    color: "#f59e0b",
                  },
                  {
                    dimension: "Deadline",
                    requirement: "Job must complete within block deadline",
                    breach: "Block height exceeded = automatic job cancellation + credit",
                    color: "#ef4444",
                  },
                ].map((item) => (
                  <div
                    key={item.dimension}
                    className="p-4 rounded-lg border border-[#27272a] bg-[#010102]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <h3 className="font-medium">{item.dimension}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-500">Requirement: </span>
                        <span className="text-zinc-300">{item.requirement}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Breach: </span>
                        <span className="text-zinc-300">{item.breach}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/5">
                <p className="text-sm text-zinc-300">
                  <span className="text-[#22c55e] font-medium">Financial Guarantee: </span>
                  On breach, the platform automatically issues an SLA credit to the
                  client wallet equal to{" "}
                  <span className="font-mono text-zinc-100">
                    (1 - actual_uptime / required_uptime) × job_budget
                  </span>
                  , capped at the full job budget.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Navigation */}
        <div className="flex gap-4 pt-8 border-t border-[#27272a]">
          <Link href="/docs/sla-enforcement">
            <Button variant="outline" className="border-[#27272a] text-zinc-400 hover:text-zinc-100">
              SLA Enforcement
            </Button>
          </Link>
          <Link href="/docs/heartbeat">
            <Button variant="outline" className="border-[#27272a] text-zinc-400 hover:text-zinc-100">
              Heartbeat Monitoring
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
