"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SLAEnforcementPage() {
  return (
    <div className="min-h-screen bg-[#010102] text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="border-[#27272a] text-zinc-400 mb-4">
            Trustless Guarantees
          </Badge>
          <h1 className="text-4xl font-sans font-semibold mb-4">
            SLA Enforcement
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Automated, on-chain, financially enforced SLAs. No manual refunds,
            no support tickets — every breach triggers automatic compensation.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Overview</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg border border-[#27272a] bg-[#010102]">
                  <div className="text-2xl font-bold text-[#22c55e] mb-1">Automated</div>
                  <p className="text-sm text-zinc-400">
                    No human intervention. Smart contracts execute enforcement logic.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-[#27272a] bg-[#010102]">
                  <div className="text-2xl font-bold text-[#22c55e] mb-1">On-Chain</div>
                  <p className="text-sm text-zinc-400">
                    SLA parameters and monitoring data are recorded immutably.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-[#27272a] bg-[#010102]">
                  <div className="text-2xl font-bold text-[#22c55e] mb-1">Financial</div>
                  <p className="text-sm text-zinc-400">
                    Credits and slashing execute atomically via smart contract.
                  </p>
                </div>
              </div>
              <p className="text-zinc-300">
                Traditional cloud providers offer SLAs as marketing commitments backed by
                vague refund policies. Tentrist encodes SLA terms as Solidity logic on an
                EVM-compatible chain. When monitoring data shows a breach, the contract
                executes the enforcement action automatically.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* SLA Parameters */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">SLA Parameters</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-6">
                Every SLA is defined by three dimensions, recorded at job submission:
              </p>
              <div className="space-y-4">
                {[
                  {
                    param: "Uptime",
                    unit: "%",
                    icon: "UP",
                    desc: "Percentage of heartbeat intervals where the node responded successfully within the window.",
                    example: "99.9% = node must respond to at least 2997 of 3000 heartbeats in a 24h period",
                  },
                  {
                    param: "Throughput",
                    unit: "FLOPs",
                    icon: "TP",
                    desc: "Minimum computational output rate the node must sustain, measured in floating-point operations per second.",
                    example: "Minimum 10 TFLOPS sustained for the duration of the job",
                  },
                  {
                    param: "Deadline",
                    unit: "blocks",
                    icon: "DL",
                    desc: "Maximum block height by which the job must complete. 1 block ≈ 12 seconds on Ethereum mainnet.",
                    example: "Deadline at block 19800000 = job must complete before block 19800000",
                  },
                ].map((item) => (
                  <div
                    key={item.param}
                    className="p-4 rounded-lg border border-[#27272a] bg-[#010102]"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded bg-[#0f1011] border border-[#27272a] flex items-center justify-center flex-shrink-0">
                        <span className="font-mono text-xs text-[#22c55e]">{item.icon}</span>
                      </div>
                      <div>
                        <span className="font-medium">{item.param}</span>
                        <span className="text-zinc-500 ml-2 text-sm">({item.unit})</span>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">{item.desc}</p>
                    <p className="text-xs text-zinc-500 font-mono">{item.example}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* On-Chain Recording */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">On-Chain Recording</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-4">
                When a job is submitted, the API calls the{" "}
                <code className="font-mono text-zinc-100 bg-[#010102] px-1 py-0.5 rounded">
                  SLAContract.recordJob()
                </code>{" "}
                function. This writes the SLA parameters to the blockchain:
              </p>
              <div className="p-4 rounded-lg bg-[#010102] border border-[#27272a] font-mono text-sm overflow-x-auto">
                <pre className="text-zinc-400">
{`struct SLA {
  uint256 jobId;
  uint8 uptimeRequired;      // e.g., 990 = 99.0%
  uint128 minFLOPs;          // minimum sustained FLOPS
  uint256 deadlineBlock;     // absolute block number
  uint256 budget;            // job budget in wei
  uint256 clientAddress;
  uint256 nodeAddress;
  Status status;             // PENDING, ACTIVE, COMPLETED, BREACHED
}`}
                </pre>
              </div>
              <p className="text-sm text-zinc-500 mt-3">
                This record is immutable. Once written, the SLA parameters cannot be altered
                by any party — not the client, not the node, not Tentrist.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Monitoring */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Monitoring</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-4">
                The Heartbeat Monitor service runs on each node as a Go/Rust daemon.
                Every 30 seconds, it collects telemetry and submits a signed pulse to the
                validator network.
              </p>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-[#27272a] bg-[#010102]">
                <div className="w-3 h-3 rounded-full bg-[#22c55e] animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-300">
                    Heartbeat pulse sent every 30 seconds
                  </p>
                </div>
                <span className="font-mono text-xs text-zinc-500">30s</span>
              </div>
              <p className="text-sm text-zinc-500 mt-3">
                Validators aggregate heartbeats and update on-chain state via the
                SLAContract. The heartbeat data feeds directly into breach detection.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Breach Detection */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Breach Detection</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-6">
                Breach detection is automated and deterministic. No human reviews the data.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-lg border border-[#27272a] bg-[#010102]">
                  <div className="w-12 h-12 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-sm text-[#f59e0b]">1</span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300">
                      <span className="text-[#f59e0b]">Missed heartbeat #1</span> — Node
                      flagged as stale. Warning issued to node operator.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg border border-[#27272a] bg-[#010102]">
                  <div className="w-12 h-12 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-sm text-[#f59e0b]">2</span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300">
                      <span className="text-[#f59e0b]">Missed heartbeat #2</span> — Node
                      remains in stale state. Job continues on alternate standby.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5">
                  <div className="w-12 h-12 rounded bg-[#ef4444]/20 border border-[#ef4444]/50 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-sm text-[#ef4444]">3</span>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300">
                      <span className="text-[#ef4444]">Missed heartbeat #3</span> — SLA
                      breach triggered. Smart contract executes slashing and re-routes job.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Financial Enforcement */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Financial Enforcement</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-6">
                On breach, the SLAContract atomically executes three actions:
              </p>
              <div className="grid gap-4">
                {[
                  {
                    action: "Node Slashed",
                    desc: "Collateral deducted from node's Escrow balance. Percentage varies by SLA tier.",
                    color: "#ef4444",
                  },
                  {
                    action: "Job Re-Routed",
                    desc: "Orchestrator assigns partition to standby node using last checkpoint.",
                    color: "#f59e0b",
                  },
                  {
                    action: "SLA Credit Issued",
                    desc: "Client wallet credited automatically. Credit = (1 - actual/required) × budget.",
                    color: "#22c55e",
                  },
                ].map((item, i) => (
                  <div
                    key={item.action}
                    className="p-4 rounded-lg border border-[#27272a] bg-[#010102]"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: `${item.color}20`,
                          color: item.color,
                          border: `1px solid ${item.color}50`,
                        }}
                      >
                        {i + 1}
                      </div>
                      <h3 className="font-medium">{item.action}</h3>
                    </div>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SLA Credit Calculation */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">SLA Credit Calculation</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="p-4 rounded-lg bg-[#010102] border border-[#27272a] mb-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-zinc-500 mb-2">SLA Credit Formula</p>
                  <p className="font-mono text-xl text-zinc-100">
                    credit = (1 - actual_uptime / required_uptime) × job_budget
                  </p>
                </div>
                <div className="border-t border-[#27272a] pt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">Capped at: </span>
                    <span className="font-mono text-zinc-100">job_budget</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Minimum breach: </span>
                    <span className="font-mono text-zinc-100">0.1%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">Example scenarios:</p>
                {[
                  { uptime: "100%", required: "99%", budget: "1000 USDC", credit: "0 USDC (no breach)" },
                  { uptime: "98%", required: "99%", budget: "1000 USDC", credit: "101.01 USDC" },
                  { uptime: "95%", required: "99%", budget: "1000 USDC", credit: "404.04 USDC" },
                  { uptime: "90%", required: "99%", budget: "1000 USDC", credit: "909.09 USDC" },
                  { uptime: "0%", required: "99%", budget: "1000 USDC", credit: "1000 USDC (full budget)" },
                ].map((row) => (
                  <div
                    key={row.uptime}
                    className="grid grid-cols-4 gap-4 p-3 rounded border border-[#27272a] bg-[#010102] text-sm"
                  >
                    <span className="font-mono text-zinc-400">{row.uptime}</span>
                    <span className="text-zinc-500">of {row.required}</span>
                    <span className="font-mono text-zinc-300 text-right">{row.budget}</span>
                    <span className={row.credit.startsWith("0") ? "text-[#22c55e]" : "text-[#f59e0b]"}>
                      {row.credit}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SLA Tiers */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">SLA Tiers</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#27272a]">
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Tier</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Uptime</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Throughput</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Slashing</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4">
                        <span className="text-zinc-300">Standard</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-300">95%</td>
                      <td className="py-3 px-4 font-mono text-zinc-300">50% capacity</td>
                      <td className="py-3 px-4 font-mono text-zinc-300">10% stake</td>
                      <td className="py-3 px-4 text-zinc-400">
                        Best-effort workloads, batch processing
                      </td>
                    </tr>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4">
                        <span className="text-zinc-300">Professional</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#22c55e]">99%</td>
                      <td className="py-3 px-4 font-mono text-zinc-300">75% capacity</td>
                      <td className="py-3 px-4 font-mono text-[#f59e0b]">25% stake</td>
                      <td className="py-3 px-4 text-zinc-400">
                        Production AI workloads, fine-tuning
                      </td>
                    </tr>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4">
                        <span className="text-zinc-300">Enterprise</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#22c55e]">99.9%</td>
                      <td className="py-3 px-4 font-mono text-[#22c55e]">90% capacity</td>
                      <td className="py-3 px-4 font-mono text-[#ef4444]">50% stake</td>
                      <td className="py-3 px-4 text-zinc-400">
                        Mission-critical inference, real-time systems
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Navigation */}
        <div className="flex gap-4 pt-8 border-t border-[#27272a]">
          <Link href="/docs/gpu-orchestration">
            <Button variant="outline" className="border-[#27272a] text-zinc-400 hover:text-zinc-100">
              GPU Orchestration
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
