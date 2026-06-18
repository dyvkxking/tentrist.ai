"use client";

import * as React from "react";
import Link from "next/link";
import {
  Book,
  Zap,
  Server,
  Shield,
  Wallet,
  Clock,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const docsSections = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quick Start", href: "/docs/quick-start" },
      { title: "Authentication", href: "/docs/authentication" },
      { title: "Your First Job", href: "/docs/first-job" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "GPU Orchestration", href: "/docs/gpu-orchestration" },
      { title: "SLA Enforcement", href: "/docs/sla-enforcement" },
      { title: "Heartbeat Monitoring", href: "/docs/heartbeat" },
      { title: "Checkpointing", href: "/docs/checkpointing" },
    ],
  },
  {
    title: "Node Operations",
    items: [
      { title: "Node Registration", href: "/docs/node-registration" },
      { title: "Staking Collateral", href: "/docs/staking" },
      { title: "Slashing Mechanics", href: "/docs/slashing" },
      { title: "Reputation System", href: "/docs/reputation" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "REST API", href: "/docs/api-rest" },
      { title: "WebSocket API", href: "/docs/api-websocket" },
      { title: "Rate Limits", href: "/docs/rate-limits" },
    ],
  },
  {
    title: "SDKs",
    items: [
      { title: "JavaScript SDK", href: "/docs/sdk-javascript" },
      { title: "Python SDK", href: "/docs/sdk-python" },
      { title: "Go SDK", href: "/docs/sdk-go" },
    ],
  },
];

const quickLinks = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Quick Start Guide",
    description: "Get up and running in 5 minutes",
    href: "/docs/quick-start",
  },
  {
    icon: <Server className="h-5 w-5" />,
    title: "GPU Job API",
    description: "Submit and monitor compute jobs",
    href: "/docs/api-rest",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "SLA Enforcement",
    description: "How on-chain SLAs work",
    href: "/docs/sla-enforcement",
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: "Staking Guide",
    description: "Collateral and rewards",
    href: "/docs/staking",
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = React.useState("Getting Started");
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-hairline bg-bg-base/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors">
            <Zap className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                type="search"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 h-9"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r border-hairline bg-bg-surface/30 overflow-y-auto hidden lg:block">
          <nav className="p-4 space-y-6">
            {docsSections.map((section) => (
              <div key={section.title}>
                <button
                  onClick={() => setActiveSection(activeSection === section.title ? "" : section.title)}
                  className="flex items-center justify-between w-full text-left text-sm font-semibold text-foreground mb-2 hover:text-indicator-active transition-colors"
                >
                  {section.title}
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    activeSection === section.title && "rotate-90"
                  )} />
                </button>
                {(activeSection === section.title || !activeSection) && (
                  <ul className="space-y-1 ml-2">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block py-1.5 px-2 text-sm text-foreground-muted hover:text-foreground hover:bg-zinc-800/50 rounded-md transition-colors"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-foreground-muted mb-8">
              <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Introduction</span>
            </div>

            {/* Content */}
            <div className="space-y-12">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 text-indicator-active mb-4">
                  <Book className="h-6 w-6" />
                  <span className="text-sm font-medium">Documentation</span>
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-4">
                  Welcome to Tentrist
                </h1>
                <p className="text-lg text-foreground-muted leading-relaxed">
                  Decentralized GPU orchestration with SLA guarantees enforced automatically
                  on-chain. This documentation covers everything from quick start guides to
                  advanced API reference.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Quick Links</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group block p-4 rounded-lg border border-hairline hover:border-zinc-700 hover:bg-bg-surface/50 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-indicator-active/20 text-indicator-active">
                          {link.icon}
                        </div>
                        <h3 className="font-medium text-foreground group-hover:text-indicator-active transition-colors">
                          {link.title}
                        </h3>
                      </div>
                      <p className="text-sm text-foreground-muted">{link.description}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* What is Tentrist */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">What is Tentrist?</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground-muted leading-relaxed mb-4">
                    Tentrist is a B2B SaaS middleware and orchestration layer that sits on top
                    of decentralized computing hardware networks (DePIN). It bridges the reliability
                    gap between AI SaaS companies and decentralized GPU pools.
                  </p>
                  <p className="text-foreground-muted leading-relaxed mb-4">
                    By utilizing blockchain smart contracts for trustless node staking, real-time
                    performance monitoring, automated cryptographic slashing, and instantaneous job
                    re-routing, Tentrist provides enterprise-grade reliability at up to 70% lower
                    cost than traditional cloud providers.
                  </p>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Key Features</h2>
                <ul className="space-y-3">
                  {[
                    "On-chain SLA enforcement with automatic slashing",
                    "30-second heartbeat monitoring for real-time failure detection",
                    "GPU workload orchestration with automatic failover",
                    "Checkpoint-based job migration for zero-failure resumptions",
                    "Reputation system for priority job allocation",
                    "Cryptographic verification — no trusted third parties",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indicator-active shrink-0" />
                      <span className="text-foreground-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Architecture */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Architecture Overview</h2>
                <Card className="bg-bg-surface/50">
                  <CardContent className="p-6">
                    <pre className="text-sm font-mono-data text-foreground-muted overflow-x-auto">
{`┌─────────────────────────────────────────────┐
│              AI SaaS Client                    │
│         (submits compute jobs)                │
└─────────────────────┬───────────────────────┘
                      │ HTTPS/REST
                      ▼
┌─────────────────────────────────────────────┐
│            Next.js Dashboard                  │
└─────────────────────┬───────────────────────┘
                      │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────┐    ┌──────────────────────────┐
│ Smart        │    │   Heartbeat Telemetry    │
│ Contracts    │    │   (30s pulse, VRAM,    │
│ (SLA, Slash) │    │   packet latency)       │
└──────┬───────┘    └───────────┬──────────────┘
       │                        │
       └───────────┬────────────┘
                   ▼
       ┌──────────────────────────┐
       │   DePIN GPU Nodes         │
       │   (staked collateral)    │
       └──────────────────────────┘`}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* Next Steps */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Next Steps</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <Link
                    href="/docs/quick-start"
                    className="flex flex-col items-center text-center p-6 rounded-lg border border-hairline hover:border-indicator-active hover:bg-indicator-active/5 transition-all"
                  >
                    <Clock className="h-8 w-8 text-indicator-active mb-3" />
                    <span className="font-medium text-foreground mb-1">Quick Start</span>
                    <span className="text-sm text-foreground-muted">Get running in 5 min</span>
                  </Link>
                  <Link
                    href="/docs/api-rest"
                    className="flex flex-col items-center text-center p-6 rounded-lg border border-hairline hover:border-indicator-stale hover:bg-indicator-stale/5 transition-all"
                  >
                    <Server className="h-8 w-8 text-indicator-stale mb-3" />
                    <span className="font-medium text-foreground mb-1">API Reference</span>
                    <span className="text-sm text-foreground-muted">REST & WebSocket</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="flex flex-col items-center text-center p-6 rounded-lg border border-hairline hover:border-indicator-active hover:bg-indicator-active/5 transition-all"
                  >
                    <Zap className="h-8 w-8 text-indicator-active mb-3" />
                    <span className="font-medium text-foreground mb-1">Start Building</span>
                    <span className="text-sm text-foreground-muted">100 free GPU hours</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}