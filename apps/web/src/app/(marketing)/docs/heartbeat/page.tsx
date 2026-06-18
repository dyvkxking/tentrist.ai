"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function HeartbeatPage() {
  return (
    <div className="min-h-screen bg-[#010102] text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="border-[#27272a] text-zinc-400 mb-4">
            Telemetry
          </Badge>
          <h1 className="text-4xl font-sans font-semibold mb-4">
            Heartbeat Monitoring
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            The 30-second heartbeat pulse is the core monitoring mechanism that powers
            Tentrist's trustless SLA enforcement.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Overview</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-4">
                Every active node on the Tentrist network emits a signed telemetry payload
                every 30 seconds. This heartbeat serves as a liveness proof — it confirms
                the node is online, has not gone silent, and is making progress on its
                assigned workload.
              </p>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-[#27272a] bg-[#010102]">
                <div className="w-3 h-3 rounded-full bg-[#22c55e] animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-300">
                    Active node heartbeat
                  </p>
                </div>
                <span className="font-mono text-xs text-zinc-500">every 30s</span>
              </div>
              <p className="text-sm text-zinc-500 mt-3">
                Heartbeats are cryptographically signed by the node's wallet private key.
                Validators verify authenticity before updating on-chain state. Invalid or
                unsigned heartbeats are rejected.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* What is a Heartbeat */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">What is a Heartbeat</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-4">
                A heartbeat is a signed JSON payload transmitted over HTTPS to the validator
                network every 30 seconds. It contains the following fields:
              </p>
              <div className="p-4 rounded-lg bg-[#010102] border border-[#27272a] font-mono text-sm overflow-x-auto">
                <pre className="text-zinc-400">
{`{
  "node_id": "0x7a2...f91",
  "block_height": 19800234,
  "vram_used_pct": 78.5,
  "flops_recent": 12.4,
  "latency_ms": 23,
  "timestamp": 1750194823,
  "signature": "0xabc...def"
}`}
                </pre>
              </div>
              <p className="text-sm text-zinc-500 mt-3">
                The signature is computed over the serialized JSON payload using the node's
                wallet private key (secp256k1). Validators use the node's on-chain public key
                to verify the signature before accepting the pulse.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Telemetry Content */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Telemetry Content</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#27272a]">
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Field</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4 font-mono text-zinc-300">node_id</td>
                      <td className="py-3 px-4 font-mono text-zinc-500">address</td>
                      <td className="py-3 px-4 text-zinc-400">
                        Node's on-chain wallet address
                      </td>
                    </tr>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4 font-mono text-zinc-300">block_height</td>
                      <td className="py-3 px-4 font-mono text-zinc-500">uint256</td>
                      <td className="py-3 px-4 text-zinc-400">
                        Current block number when pulse was sent
                      </td>
                    </tr>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4 font-mono text-zinc-300">vram_used_pct</td>
                      <td className="py-3 px-4 font-mono text-zinc-500">float</td>
                      <td className="py-3 px-4 text-zinc-400">
                        Percentage of GPU VRAM currently in use (0.0–100.0)
                      </td>
                    </tr>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4 font-mono text-zinc-300">flops_recent</td>
                      <td className="py-3 px-4 font-mono text-zinc-500">float</td>
                      <td className="py-3 px-4 text-zinc-400">
                        TFLOPS output over the last 30-second interval
                      </td>
                    </tr>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4 font-mono text-zinc-300">latency_ms</td>
                      <td className="py-3 px-4 font-mono text-zinc-500">uint32</td>
                      <td className="py-3 px-4 text-zinc-400">
                        Round-trip latency to validator network in milliseconds
                      </td>
                    </tr>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4 font-mono text-zinc-300">timestamp</td>
                      <td className="py-3 px-4 font-mono text-zinc-500">uint64</td>
                      <td className="py-3 px-4 text-zinc-400">
                        Unix epoch of when pulse was generated
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-zinc-300">signature</td>
                      <td className="py-3 px-4 font-mono text-zinc-500">bytes</td>
                      <td className="py-3 px-4 text-zinc-400">
                        secp256k1 signature over the payload
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Miss Threshold */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Miss Threshold</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-6">
                A heartbeat is considered missed if the validator network does not receive
                a valid signed pulse within the 30-second window. The threshold determines
                when a node is considered failed:
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                    <h3 className="font-medium text-[#f59e0b]">1 Missed Heartbeat</h3>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Node is marked as <span className="text-[#f59e0b]">STALE</span>. A
                    warning is dispatched to the node operator. Job continues running.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                    <h3 className="font-medium text-[#f59e0b]">2 Missed Heartbeats</h3>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Node remains in STALE state. The orchestrator begins preparing a
                    standby node for potential failover. No SLA penalty yet.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    <h3 className="font-medium text-[#ef4444]">3 Missed Heartbeats (SLA Breach)</h3>
                  </div>
                  <p className="text-sm text-zinc-400">
                    SLA breach is triggered. Smart contract atomically: (1) slashes node
                    collateral, (2) issues SLA credit to client, (3) re-routes job to
                    standby node using last checkpoint.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cryptographic Verification */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Cryptographic Verification</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-4">
                Every heartbeat payload is signed by the node's wallet private key using
                ECDSA on the secp256k1 curve. This is the same signature scheme used for
                Ethereum transactions, ensuring strong cryptographic guarantees.
              </p>
              <div className="p-4 rounded-lg bg-[#010102] border border-[#27272a] font-mono text-sm mb-4">
                <pre className="text-zinc-400">
{`// Verification steps performed by validators:
1. Deserialize heartbeat payload
2. Extract node_id (address) from payload
3. Recover public key from signature using ecrecover
4. Verify recovered address == node_id
5. Verify timestamp is within acceptable drift (±5 seconds)
6. Update SLAContract on success`}
                </pre>
              </div>
              <div className="p-4 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/5">
                <p className="text-sm text-zinc-300">
                  <span className="text-[#22c55e] font-medium">Security property: </span>
                  Only the node operator who controls the wallet private key can produce
                  valid heartbeats. An attacker cannot spoof liveness for a node they do
                  not control.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Heartbeat Monitor Service */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Heartbeat Monitor Service</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-4">
                The Heartbeat Monitor is a lightweight Go/Rust daemon that runs on each
                registered node. It is responsible for collecting local telemetry,
                packaging it into a signed heartbeat payload, and transmitting it to the
                validator network every 30 seconds.
              </p>
              <div className="space-y-3">
                {[
                  {
                    title: "Telemetry Collection",
                    desc: "Queries GPU metrics (VRAM, utilization, temperature), network latency probes, and job progress state from the local executor.",
                  },
                  {
                    title: "Payload Signing",
                    desc: "Constructs the JSON payload and signs it using the node's wallet private key stored in an encrypted local keystore.",
                  },
                  {
                    title: "Transmission",
                    desc: "Sends the signed payload via HTTPS to the validator REST endpoint. Retries up to 3 times on transient failures.",
                  },
                  {
                    title: "Checkpoint Publishing",
                    desc: "Every 6th pulse (3 minutes), the monitor also publishes a checkpoint of current job state to the SLAContract for failover recovery.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-3 rounded border border-[#27272a] bg-[#010102]"
                  >
                    <h3 className="text-sm font-medium mb-1">{item.title}</h3>
                    <p className="text-xs text-zinc-400">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded border border-[#27272a] bg-[#010102]">
                <p className="text-xs text-zinc-500 font-mono">
                  # Example systemd unit for heartbeat service
                  <br />
                  ExecStart=/usr/local/bin/heartbeat-monitor --keystore /var/lib/tentrist/keystore
                  <br />
                  Restart=always
                  <br />
                  RestartSec=5
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Monitoring Your Node */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Monitoring Your Node</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-zinc-300 mb-4">
                Node operators can view real-time and historical heartbeat status for
                their registered nodes directly from the dashboard.
              </p>
              <Link href="/nodes">
                <Button className="bg-[#22c55e] text-black hover:bg-[#22c55e]/90">
                  View Node Dashboard
                </Button>
              </Link>
              <p className="text-sm text-zinc-500 mt-3">
                The node detail page shows heartbeat history, latency trends, VRAM
                utilization charts, and any SLA incidents.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Missed Pulses */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-medium mb-4">Missed Pulses</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#27272a]">
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Misses</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-zinc-400 font-medium">Consequence</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4 font-mono text-zinc-300">1</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10"
                        >
                          STALE
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        Warning issued to operator. Job continues. No penalty.
                      </td>
                    </tr>
                    <tr className="border-b border-[#27272a]">
                      <td className="py-3 px-4 font-mono text-zinc-300">2</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10"
                        >
                          STALE
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        Standby node prepared. Job continues. No penalty.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-[#ef4444]">3</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className="border-[#ef4444] text-[#ef4444] bg-[#ef4444]/10"
                        >
                          BREACHED
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        SLA breach triggered. Node slashed. Job re-routed. Credit issued.
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
          <Link href="/docs/sla-enforcement">
            <Button variant="outline" className="border-[#27272a] text-zinc-400 hover:text-zinc-100">
              SLA Enforcement
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
