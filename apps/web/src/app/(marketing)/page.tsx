"use client";

import * as React from "react";
import Link from "next/link";
import {
  Zap,
  Shield,
  Server,
  Clock,
  ArrowRight,
  CheckCircle2,
  Activity,
  Users,
  BarChart3,
  ChevronRight,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: <Shield className="h-5 w-5" />,
    title: "SLA Guarantees",
    description: "On-chain SLA enforcement with automatic slashing when benchmarks aren't met. No manual refunds needed.",
    glow: "indicator-active",
  },
  {
    icon: <Server className="h-5 w-5" />,
    title: "GPU Orchestration",
    description: "Split workloads across decentralized GPU pools with automatic failover and checkpointing.",
    glow: "indicator-stale",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "30s Heartbeat",
    description: "Real-time monitoring with 30-second heartbeat intervals. Failures detected and acted upon instantly.",
    glow: "indicator-active",
  },
  {
    icon: <Activity className="h-5 w-5" />,
    title: "Zero Slacking",
    description: "Automatic slashing penalties executed on-chain. 10% of collateral deducted for missed SLAs.",
    glow: "indicator-slashed",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Reputation System",
    description: "Node operators build reputation over time. High-reputation nodes get priority in job allocation.",
    glow: "indicator-active",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Real-time Analytics",
    description: "Track job progress, SLA compliance, and cost savings with live dashboards.",
    glow: "indicator-stale",
  },
];

const testimonials = [
  {
    quote: "We cut our GPU compute costs by 68% while actually improving reliability. The SLA enforcement is game-changing.",
    author: "Dr. Maya Patel",
    role: "Head of ML Infrastructure",
    company: "Nexus AI Labs",
    avatar: "MP",
  },
  {
    quote: "Finally, a DePIN solution that takes performance seriously. The 30-second heartbeat monitoring caught failures before they impacted our jobs.",
    author: "James Chen",
    role: "CTO",
    company: "RenderFarm Pro",
    avatar: "JC",
  },
  {
    quote: "The on-chain slashing isn't just penalties—it's confidence. When a node operator stakes, we know they're serious.",
    author: "Sarah Williams",
    role: "VP Engineering",
    company: "Synthwave Studios",
    avatar: "SW",
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Submit Job",
    description: "Define your compute task with SLA requirements. Set uptime, throughput, and deadline benchmarks on-chain.",
    icon: <Server className="h-6 w-6" />,
    color: "text-indicator-active",
    glowClass: "bg-indicator-active/10",
  },
  {
    number: "02",
    title: "Execute",
    description: "GPU nodes process your workload in parallel. Real-time heartbeats verify uptime and performance every 30 seconds.",
    icon: <Activity className="h-6 w-6" />,
    color: "text-indicator-stale",
    glowClass: "bg-indicator-stale/10",
  },
  {
    number: "03",
    title: "Slash",
    description: "Missed SLA? The smart contract automatically executes slashing. 70% credited to your account, job re-routed to standby.",
    icon: <Zap className="h-6 w-6" />,
    color: "text-indicator-slashed",
    glowClass: "bg-indicator-slashed/10",
  },
];

export default function LandingPage() {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indicator-active/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indicator-stale/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indicator-active/5 rounded-full blur-[150px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 text-center">
          {/* Badge */}
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
            <span className="mr-2 text-indicator-active">●</span>
            Now live on Sepolia Testnet
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-[1.1]">
            GPU Computing at{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indicator-active to-indicator-stale">
              70% Less Cost
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Decentralized GPU orchestration with{" "}
            <span className="text-foreground font-medium">SLA guarantees enforced automatically on-chain</span>.
            No manual interventions. No refunds to request.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-lg bg-indicator-active text-bg-base hover:bg-indicator-active/90 transition-colors"
            >
              Start Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-lg border border-hairline hover:bg-zinc-800/50 transition-colors"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-foreground-muted">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indicator-active" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indicator-active" />
              <span>$100 free credits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indicator-active" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-hairline flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-foreground-muted rounded-full" />
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-hairline bg-bg-surface/50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-foreground-muted mb-6">
            Trusted by AI teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 grayscale">
            {["Nexus AI", "RenderFarm Pro", "Synthwave", "NeuralForge", "DeepScale"].map((company) => (
              <span key={company} className="text-sm font-medium text-foreground">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indicator-stale/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
              Enterprise-Grade Reliability
            </h2>
            <p className="text-foreground-muted">
              Every aspect of the platform is designed to enforce performance guarantees
              without manual intervention.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className={cn(
                  "group relative overflow-hidden transition-all duration-300",
                  "hover:border-zinc-700 hover:shadow-lg"
                )}
              >
                {/* Glow effect */}
                <div
                  className={cn(
                    "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                    feature.glow === "indicator-active" && "bg-indicator-active",
                    feature.glow === "indicator-stale" && "bg-indicator-stale",
                    feature.glow === "indicator-slashed" && "bg-indicator-slashed"
                  )}
                />
                <CardContent className="relative p-6">
                  {/* Icon */}
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4",
                      feature.glow === "indicator-active" && "bg-indicator-active/20 text-indicator-active",
                      feature.glow === "indicator-stale" && "bg-indicator-stale/20 text-indicator-stale",
                      feature.glow === "indicator-slashed" && "bg-indicator-slashed/20 text-indicator-slashed"
                    )}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-bg-surface/30" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indicator-active/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
              Trustless SLA Enforcement
            </h2>
            <p className="text-foreground-muted">
              From job submission to completion, every step is verified and enforced
              by immutable smart contracts.
            </p>
          </div>

          {/* Workflow steps */}
          <div className="grid gap-8 lg:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step.number}
                className={cn(
                  "relative p-8 rounded-xl border transition-all duration-300 cursor-pointer",
                  activeStep === index
                    ? "border-hairline bg-bg-surface/80 shadow-lg"
                    : "border-transparent hover:border-hairline hover:bg-bg-surface/50"
                )}
                onClick={() => setActiveStep(index)}
              >
                {/* Step number */}
                <span className="text-6xl font-bold text-hairline/50 absolute top-4 right-6">
                  {step.number}
                </span>

                {/* Glow */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
                    activeStep === index && "opacity-100",
                    step.glowClass
                  )}
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-12 h-12 rounded-lg mb-6",
                      activeStep === index && step.glowClass
                    )}
                  >
                    <span className={step.color}>{step.icon}</span>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-foreground-muted leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="h-6 w-6 text-foreground-muted" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="mt-8 p-6 rounded-xl border border-hairline bg-bg-surface/50">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "shrink-0 p-3 rounded-lg",
                  workflowSteps[activeStep].glowClass
                )}
              >
                <span className={workflowSteps[activeStep].color}>
                  {workflowSteps[activeStep].icon}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {workflowSteps[activeStep].title}
                </h4>
                <p className="text-foreground-muted text-sm leading-relaxed">
                  {workflowSteps[activeStep].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-hairline">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { value: "68%", label: "Average cost savings" },
              { value: "99.9%", label: "SLA compliance rate" },
              { value: "<30s", label: "Failure detection" },
              { value: "$2.4M+", label: "Jobs processed" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold font-mono-data text-indicator-active mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-foreground-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indicator-active/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
              Trusted by AI Teams
            </h2>
          </div>

          {/* Testimonials grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="bg-bg-surface/50">
                <CardContent className="p-6">
                  {/* Quote */}
                  <p className="text-foreground-muted leading-relaxed mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indicator-active/20 text-indicator-active text-sm font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {testimonial.author}
                      </div>
                      <div className="text-xs text-foreground-muted">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-bg-surface/30" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indicator-active/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
            Ready to cut GPU costs by 70%?
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto mb-10">
            Join the decentralized compute revolution. Get $100 in free credits
            to start benchmarking your workloads.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-lg bg-indicator-active text-bg-base hover:bg-indicator-active/90 transition-colors"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-lg border border-hairline hover:bg-zinc-800/50 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}