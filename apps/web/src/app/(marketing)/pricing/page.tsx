"use client";

import * as React from "react";
import Link from "next/link";
import { Check, X, Zap, ArrowRight, Sparkles, Building2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Starter",
    description: "Perfect for developers testing GPU workloads",
    price: "$0",
    period: "forever",
    cta: "Start Free",
    ctaHref: "/signup",
    icon: <Sparkles className="h-5 w-5" />,
    features: [
      { text: "100 GPU hours per month", included: true },
      { text: "Up to 3 concurrent jobs", included: true },
      { text: "Basic SLA monitoring", included: true },
      { text: "Community support", included: true },
      { text: "Advanced analytics", included: false },
      { text: "Custom SLA thresholds", included: false },
      { text: "Priority job routing", included: false },
      { text: "Dedicated support", included: false },
    ],
    highlight: false,
  },
  {
    name: "Pro",
    description: "For growing AI teams with production workloads",
    price: "$299",
    period: "per month",
    cta: "Get Started",
    ctaHref: "/signup?plan=pro",
    icon: <Zap className="h-5 w-5" />,
    features: [
      { text: "1,000 GPU hours per month", included: true },
      { text: "Unlimited concurrent jobs", included: true },
      { text: "Advanced SLA monitoring", included: true },
      { text: "Priority email support", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom SLA thresholds", included: true },
      { text: "Priority job routing", included: true },
      { text: "Dedicated support", included: false },
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    description: "For organizations with mission-critical GPU compute",
    price: "Custom",
    period: "volume-based",
    cta: "Contact Sales",
    ctaHref: "/contact",
    icon: <Building2 className="h-5 w-5" />,
    features: [
      { text: "Unlimited GPU hours", included: true },
      { text: "Unlimited concurrent jobs", included: true },
      { text: "Enterprise SLA guarantees", included: true },
      { text: "24/7 dedicated support", included: true },
      { text: "Advanced analytics + exports", included: true },
      { text: "Custom SLA thresholds", included: true },
      { text: "Priority job routing", included: true },
      { text: "Dedicated support + SLAs", included: true },
    ],
    highlight: false,
  },
];

const comparisonFeatures = [
  { name: "GPU Hours", starter: "100/mo", pro: "1,000/mo", enterprise: "Unlimited" },
  { name: "Concurrent Jobs", starter: "3", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "SLA Uptime Guarantee", starter: "95%", pro: "99.5%", enterprise: "99.9%" },
  { name: "Heartbeat Interval", starter: "60s", pro: "30s", enterprise: "30s" },
  { name: "Checkpoint Frequency", starter: "120s", pro: "60s", enterprise: "60s" },
  { name: "Slash Protection", starter: true, pro: true, enterprise: true },
  { name: "Reputation System", starter: true, pro: true, enterprise: true },
  { name: "Analytics Dashboard", starter: "Basic", pro: "Advanced", enterprise: "Custom" },
  { name: "API Access", starter: false, pro: true, enterprise: true },
  { name: "Custom SLA Thresholds", starter: false, pro: true, enterprise: true },
  { name: "Priority Routing", starter: false, pro: true, enterprise: true },
  { name: "Dedicated Account Manager", starter: false, pro: false, enterprise: true },
  { name: "Custom Contracts", starter: false, pro: false, enterprise: true },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indicator-active/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Pay only for what you use. All plans include automatic SLA enforcement
            and slash protection at no extra cost.
          </p>
        </div>
      </section>

      {/* Tier Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  tier.highlight
                    ? "border-indicator-active/50 shadow-lg shadow-indicator-active/10"
                    : "hover:border-zinc-700"
                )}
              >
                {tier.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indicator-active to-indicator-stale" />
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "p-2 rounded-lg",
                      tier.highlight ? "bg-indicator-active/20 text-indicator-active" : "bg-zinc-800 text-foreground-muted"
                    )}>
                      {tier.icon}
                    </span>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price */}
                  <div>
                    <span className="text-4xl font-bold font-mono-data text-foreground">
                      {tier.price}
                    </span>
                    <span className="text-foreground-muted text-sm ml-2">
                      {tier.period}
                    </span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={tier.ctaHref}
                    className={cn(
                      "flex items-center justify-center h-10 px-6 rounded-md font-medium transition-colors",
                      tier.highlight
                        ? "bg-indicator-active text-bg-base hover:bg-indicator-active/90"
                        : "border border-hairline hover:bg-zinc-800/50"
                    )}
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-indicator-active shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-foreground-muted/50 shrink-0" />
                        )}
                        <span className={cn(
                          feature.included ? "text-foreground" : "text-foreground-muted/50"
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="py-24 bg-bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
              Compare Plans
            </h2>
            <p className="text-foreground-muted max-w-xl mx-auto">
              Detailed feature comparison to help you choose the right plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left py-4 px-4 font-medium text-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-medium text-foreground w-32">Starter</th>
                  <th className="text-center py-4 px-4 font-medium text-indicator-active w-32">Pro</th>
                  <th className="text-center py-4 px-4 font-medium text-foreground w-32">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {comparisonFeatures.map((feature) => (
                  <tr key={feature.name} className="hover:bg-bg-surface/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-foreground">{feature.name}</td>
                    <td className="py-4 px-4 text-center text-sm font-mono-data text-foreground-muted">
                      {typeof feature.starter === "boolean" ? (
                        feature.starter ? (
                          <Check className="h-4 w-4 text-indicator-active mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-foreground-muted/50 mx-auto" />
                        )
                      ) : (
                        feature.starter
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-sm font-mono-data text-indicator-active">
                      {typeof feature.pro === "boolean" ? (
                        feature.pro ? (
                          <Check className="h-4 w-4 text-indicator-active mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-foreground-muted/50 mx-auto" />
                        )
                      ) : (
                        feature.pro
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-sm font-mono-data text-foreground-muted">
                      {typeof feature.enterprise === "boolean" ? (
                        feature.enterprise ? (
                          <Check className="h-4 w-4 text-indicator-active mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-foreground-muted/50 mx-auto" />
                        )
                      ) : (
                        feature.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What counts as a GPU hour?",
                a: "A GPU hour is billed for each hour a GPU node is actively processing your job. Queued time and checkpoint saves are not billed.",
              },
              {
                q: "What happens if I exceed my GPU hour limit?",
                a: "You'll receive a notification at 80% usage. Overages are billed at $0.35/hour for Starter, and are blocked on Pro/Enterprise until you upgrade or set custom limits.",
              },
              {
                q: "How does SLA enforcement work?",
                a: "When you submit a job, you define SLA benchmarks (uptime, throughput, deadline). The smart contract monitors these on-chain. If benchmarks aren't met, automatic slashing occurs.",
              },
              {
                q: "Can I switch plans at any time?",
                a: "Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately, downgrades at the start of your next billing cycle.",
              },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-foreground-muted">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-bg-surface/30">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-12 w-12 text-indicator-active mx-auto mb-4" />
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">
            All plans include slash protection
          </h2>
          <p className="text-foreground-muted max-w-xl mx-auto mb-8">
            If a node fails your SLA, you get credited automatically. No support
            tickets required. No refunds to wait for.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-lg bg-indicator-active text-bg-base hover:bg-indicator-active/90 transition-colors"
          >
            Start Free Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}