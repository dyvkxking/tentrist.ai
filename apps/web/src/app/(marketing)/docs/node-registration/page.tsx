"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function NodeRegistrationPage() {
  return (
    <div className="min-h-screen bg-[#010102] text-[#fafafa]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="border-[#27272a] text-[#a1a1aa] mb-4">
            Node Operators
          </Badge>
          <h1 className="text-4xl font-sans font-semibold mb-4">
            Node Registration Guide
          </h1>
          <p className="text-[#a1a1aa] text-lg font-sans">
            Become a Tentrist GPU provider and earn rewards by running distributed compute workloads.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Overview</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed">
                Node registration is the process of onboarding your GPU hardware onto the Tentrist network.
                As a provider, you stake collateral to guarantee SLA compliance and receive compute jobs from
                enterprise clients. In return, you earn payment in ETH for successfully completed workloads.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Prerequisites */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Prerequisites</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-6">
                Before registering, ensure your setup meets the following requirements:
              </p>
              <div className="grid gap-4">
                {[
                  {
                    title: "GPU Requirements",
                    desc: "Minimum 8GB VRAM, compute capability 8.0 or higher (CUDA-compatible). Recommended: RTX 3090, RTX 4090, A100, or H100.",
                    indicator: "active",
                  },
                  {
                    title: "Wallet",
                    desc: "An Ethereum wallet (MetaMask, WalletConnect) with a minimum balance of 1 ETH equivalent for stake collateral.",
                    indicator: "active",
                  },
                  {
                    title: "Stable Internet",
                    desc: "Reliable broadband connection with minimum 100 Mbps upload/download. Node must maintain connectivity for heartbeat telemetry.",
                    indicator: "stale",
                  },
                  {
                    title: "Server Time Sync",
                    desc: "System clock synchronized with NTP to ensure accurate heartbeat reporting and checkpoint timestamps.",
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

        {/* Minimum Stake */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Minimum Stake</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                The minimum stake requirement is <span className="text-[#fafafa] font-mono">1 ETH</span> equivalent.
                This collateral remains locked while your node is active and can be slashed if SLA violations occur.
              </p>
              <ul className="space-y-3">
                {[
                  "Stake acts as financial guarantee for job completion and heartbeat compliance",
                  "Slashed funds are partially credited to affected clients as compensation",
                  "Stake is released upon voluntary deregistration, minus any pending slash deductions",
                  "Minimum stake may be higher for nodes in high-demand regions or with premium GPU models",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#22c55e] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 rounded-lg bg-[#010102] border border-[#ef4444]/30">
                <p className="text-sm text-[#a1a1aa]">
                  <span className="text-[#ef4444] font-medium">Warning:</span> Staked collateral is at risk of slashing
                  if your node misses heartbeats or fails to complete jobs within SLA bounds.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Registration Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Registration Steps</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Connect Wallet",
                    desc: "Navigate to /node/settings/wallet and connect your Ethereum wallet using MetaMask or WalletConnect.",
                    link: "/node/settings/wallet",
                    linkText: "Connect Wallet",
                  },
                  {
                    step: "2",
                    title: "Register Node",
                    desc: "Go to /node/nodes/new and provide your GPU details: model, VRAM, region, and price-per-block configuration.",
                    link: "/node/nodes/new",
                    linkText: "Register Node",
                  },
                  {
                    step: "3",
                    title: "Deposit Stake",
                    desc: "After registration, deposit your minimum stake (1 ETH equivalent) at /node/nodes/{id}/stake/deposit.",
                    link: "/node/nodes",
                    linkText: "View Nodes",
                  },
                  {
                    step: "4",
                    title: "Node Goes Live",
                    desc: "Once your stake is confirmed on-chain, your node transitions to online status and becomes eligible for job assignments.",
                    link: null,
                    linkText: null,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#010102] border border-[#27272a] flex items-center justify-center">
                      <span className="text-sm font-mono text-[#22c55e]">{item.step}</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-sans font-medium text-[#fafafa] mb-1">{item.title}</h3>
                      <p className="text-sm text-[#a1a1aa] mb-2">{item.desc}</p>
                      {item.link && (
                        <Link href={item.link}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]"
                          >
                            {item.linkText}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Node Configuration */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Node Configuration</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-6">
                When registering a node, configure the following fields:
              </p>
              <div className="space-y-4">
                {[
                  {
                    field: "Display Name",
                    type: "text",
                    desc: "Human-readable name shown to clients (e.g., \"GPU-Rack-42-A\")",
                  },
                  {
                    field: "GPU Model",
                    type: "dropdown",
                    desc: "Select from supported models: RTX 3090, RTX 4090, A100, H100, etc.",
                  },
                  {
                    field: "VRAM (GB)",
                    type: "number",
                    desc: "Total VRAM available for compute jobs (8-80 GB depending on hardware)",
                  },
                  {
                    field: "Region",
                    type: "dropdown",
                    desc: "Geographic region: us-east-1, us-west-2, eu-west-1, ap-southeast-1",
                  },
                  {
                    field: "Price per Block",
                    type: "ETH",
                    desc: "Cost per 50-block interval in ETH (adjustable based on GPU demand)",
                  },
                  {
                    field: "Min Price per Block",
                    type: "ETH",
                    desc: "Floor price below which you will not accept jobs",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-4 rounded-lg border border-[#27272a] bg-[#010102]"
                  >
                    <div>
                      <h3 className="font-sans font-medium text-[#fafafa] mb-1">{item.field}</h3>
                      <p className="text-sm text-[#a1a1aa]">{item.desc}</p>
                    </div>
                    <span className="text-xs font-mono text-[#22c55e] bg-[#22c55e]/10 px-2 py-1 rounded">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Node States */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Node States</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#27272a]">
                      <th className="text-left py-3 px-4 text-sm font-sans font-medium text-[#a1a1aa]">
                        State
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-sans font-medium text-[#a1a1aa]">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-sans font-medium text-[#a1a1aa]">
                        Indicator
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        state: "registering",
                        desc: "Initial registration submitted, awaiting on-chain confirmation",
                        indicator: "stale",
                      },
                      {
                        state: "pending_stake",
                        desc: "Registration confirmed but minimum stake not yet deposited",
                        indicator: "stale",
                      },
                      {
                        state: "online",
                        desc: "Active and eligible for job assignments, heartbeat reporting",
                        indicator: "active",
                      },
                      {
                        state: "offline",
                        desc: "Temporarily unavailable or disconnected from the network",
                        indicator: "stale",
                      },
                      {
                        state: "slashed",
                        desc: "SLA violation detected and collateral partially or fully confiscated",
                        indicator: "slashed",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[#27272a]/50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-[#fafafa]">{row.state}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#a1a1aa]">{row.desc}</td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "inline-block w-2 h-2 rounded-full",
                              row.indicator === "active"
                                ? "bg-[#22c55e]"
                                : row.indicator === "stale"
                                ? "bg-[#f59e0b]"
                                : "bg-[#ef4444]"
                            )}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Deregistration */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Deregistration</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                To unregister your node, navigate to{" "}
                <span className="font-mono text-[#fafafa]">/node/nodes/{`{id}`}/unregister</span>.
              </p>
              <ul className="space-y-3">
                {[
                  "Node must not have any active jobs in progress",
                  "All pending checkpoints must be completed or transferred",
                  "Stake is released after a 48-hour cool-down period to account for any late slash events",
                  "Reputation score is preserved for future re-registration",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#22c55e] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/node/nodes">
                  <Button className="bg-[#22c55e] text-[#010102] hover:bg-[#22c55e]/90">
                    Manage Nodes
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
          <Link href="/docs/api-rest">
            <Button variant="outline" className="border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]">
              REST API Reference &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
