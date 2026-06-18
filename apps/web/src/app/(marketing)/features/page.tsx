"use client";

import * as React from "react";
import Link from "next/link";
import {
  Zap,
  Shield,
  Server,
  Clock,
  Activity,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Lock,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const coreFeatures = [
  {
    title: "On-Chain SLA Enforcement",
    description: "Every SLA benchmark is recorded on-chain. No manual verification, no human intervention.",
    icon: <Shield className="h-6 w-6" />,
    color: "indicator-active",
    size: "large",
  },
  {
    title: "30-Second Heartbeat",
    description: "Real-time monitoring pulses every 30 seconds. Failures detected and acted upon instantly.",
    icon: <Activity className="h-6 w-6" />,
    color: "indicator-stale",
    size: "medium",
  },
  {
    title: "Automatic Slashing",
    description: "Smart contracts execute penalties instantly when SLAs are breached.",
    icon: <Zap className="h-6 w-6" />,
    color: "indicator-slashed",
    size: "medium",
  },
];

const gpuFeatures = [
  {
    title: "GPU Orchestration",
    description: "Split workloads across multiple decentralized GPU nodes with automatic load balancing.",
    icon: <Server className="h-5 w-5" />,
    color: "indicator-active",
  },
  {
    title: "Checkpointing",
    description: "Save progress every 60 seconds. Jobs resume seamlessly on any node.",
    icon: <GitBranch className="h-5 w-5" />,
    color: "indicator-stale",
  },
  {
    title: "Fault Tolerance",
    description: "Automatic failover when nodes drop. Zero job failures from hardware issues.",
    icon: <Globe className="h-5 w-5" />,
    color: "indicator-active",
  },
];

const securityFeatures = [
  {
    title: "Collateral Staking",
    description: "Node operators stake collateral as skin in the game.",
    icon: <Lock className="h-5 w-5" />,
    color: "indicator-active",
  },
  {
    title: "Reputation Ledger",
    description: "On-chain reputation scores built over time. High-rep nodes get priority.",
    icon: <Users className="h-5 w-5" />,
    color: "indicator-stale",
  },
  {
    title: "Cryptographic Verification",
    description: "All claims verified cryptographically. No trusted third parties.",
    icon: <Shield className="h-5 w-5" />,
    color: "indicator-active",
  },
];

const analyticsFeatures = [
  {
    title: "Real-time Dashboard",
    description: "Monitor job progress, SLA compliance, and costs in live dashboards.",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "indicator-active",
  },
  {
    title: "Performance Metrics",
    description: "VRAM utilization, latency, throughput — all tracked with timestamps.",
    icon: <Activity className="h-5 w-5" />,
    color: "indicator-stale",
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indicator-stale/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indicator-active/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
            Infrastructure-grade GPU compute
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Every feature designed to enforce SLA guarantees automatically.
            No manual interventions. No exceptions.
          </p>
        </div>
      </section>

      {/* Bento Grid - Core Features */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">SLA Enforcement</h2>
            <p className="text-foreground-muted">The foundation of trustless GPU compute</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Large feature card */}
            <Card className="lg:col-span-2 lg:row-span-2 bg-bg-surface/50 overflow-hidden group hover:border-zinc-700 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indicator-active/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-8 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-indicator-active/20 text-indicator-active">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {coreFeatures[0].title}
                  </h3>
                </div>
                <p className="text-foreground-muted text-lg mb-8 flex-1">
                  {coreFeatures[0].description}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-bg-base/50 border border-hairline">
                    <div className="text-3xl font-bold font-mono-data text-indicator-active mb-1">99.9%</div>
                    <div className="text-sm text-foreground-muted">SLA compliance</div>
                  </div>
                  <div className="p-4 rounded-lg bg-bg-base/50 border border-hairline">
                    <div className="text-3xl font-bold font-mono-data text-indicator-stale mb-1">&lt;30s</div>
                    <div className="text-sm text-foreground-muted">Detection time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medium feature cards */}
            {coreFeatures.slice(1).map((feature) => (
              <Card key={feature.title} className="bg-bg-surface/50 overflow-hidden group hover:border-zinc-700 transition-all duration-300">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-indicator-active/5 to-transparent" />
                <CardContent className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      feature.color === "indicator-stale" ? "bg-indicator-stale/20 text-indicator-stale" : "bg-indicator-slashed/20 text-indicator-slashed"
                    )}>
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-foreground-muted">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* GPU Orchestration */}
      <section className="py-12 bg-bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">GPU Orchestration</h2>
            <p className="text-foreground-muted">Workload splitting and failover built-in</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {gpuFeatures.map((feature) => (
              <Card key={feature.title} className="bg-bg-surface/50 overflow-hidden group hover:border-zinc-700 transition-all duration-300">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity from-indicator-active/5 to-transparent bg-gradient-to-br" />
                <CardContent className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      feature.color === "indicator-active" ? "bg-indicator-active/20 text-indicator-active" : "bg-indicator-stale/20 text-indicator-stale"
                    )}>
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-foreground-muted">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Security & Trust</h2>
            <p className="text-foreground-muted">Cryptographic guarantees, not promises</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {securityFeatures.map((feature) => (
              <Card key={feature.title} className="bg-bg-surface/50 overflow-hidden group hover:border-zinc-700 transition-all duration-300">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity from-indicator-active/5 to-transparent bg-gradient-to-br" />
                <CardContent className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      feature.color === "indicator-active" ? "bg-indicator-active/20 text-indicator-active" : "bg-indicator-stale/20 text-indicator-stale"
                    )}>
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-foreground-muted">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section className="py-12 bg-bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Analytics & Monitoring</h2>
            <p className="text-foreground-muted">Full visibility into every job</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {analyticsFeatures.map((feature) => (
              <Card key={feature.title} className="bg-bg-surface/50 overflow-hidden group hover:border-zinc-700 transition-all duration-300">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity from-indicator-active/5 to-transparent bg-gradient-to-br" />
                <CardContent className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      feature.color === "indicator-active" ? "bg-indicator-active/20 text-indicator-active" : "bg-indicator-stale/20 text-indicator-stale"
                    )}>
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-foreground-muted">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
              How Slash Protection Works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Stake", desc: "Node operators stake collateral into escrow" },
              { step: "02", title: "Monitor", desc: "30-second heartbeats verify uptime & performance" },
              { step: "03", title: "Detect", desc: "Missed SLA triggers automatic detection" },
              { step: "04", title: "Slash", desc: "Smart contract executes penalty instantly" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-bold text-hairline/50 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-foreground-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-bg-surface/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
            Ready to experience trustless compute?
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto mb-8">
            Start with 100 free GPU hours. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-lg bg-indicator-active text-bg-base hover:bg-indicator-active/90 transition-colors"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}