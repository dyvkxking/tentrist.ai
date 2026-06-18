"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Get Your API Key",
    description: "Create an API key to authenticate your requests.",
    action: (
      <Link href="/dashboard/settings/api-keys/new">
        <Button className="mt-4">Get API Key</Button>
      </Link>
    ),
  },
  {
    number: "02",
    title: "Submit Your First Job",
    description:
      "Post a serverless GPU job to the Tentrist network with your SLA requirements.",
    code: `curl -X POST https://api.tentrist.ai/v1/jobs/serverless \\
  -H "Authorization: Bearer <your-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workload_type": "llm-inference",
    "vram_required_gb": 24,
    "flop_estimate": 1000000000000,
    "duration_blocks": 100,
    "required_uptime": 9900,
    "max_price_per_block": "0.0001"
  }'`,
  },
  {
    number: "03",
    title: "Monitor the Job",
    description:
      "Poll the job status endpoint or connect via WebSocket for real-time updates.",
    code: `# Polling
curl https://api.tentrist.ai/v1/jobs/{jobId} \\
  -H "Authorization: Bearer <your-api-key}"

# WebSocket (recommended for real-time)
wss://api.tentrist.ai/v1/jobs/{jobId}/stream`,
  },
  {
    number: "04",
    title: "Check SLA Compliance",
    description:
      "After completion, verify the SLA compliance report for your job.",
    code: `curl https://api.tentrist.ai/v1/jobs/{jobId}/sla \\
  -H "Authorization: Bearer <your-api-key}"`,
  },
];

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-[#010102] text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="border-zinc-800 text-zinc-400 mb-4">
            Quick Start
          </Badge>
          <h1 className="text-4xl font-sans font-semibold tracking-tight mb-4">
            Get Started with Tentrist
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Deploy your first GPU workload on the Tentrist DePIN network in under five minutes.
          </p>
        </div>

        {/* Overview */}
        <Card className="bg-[#0f1011] border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-400">
            <p>
              You need two things to submit a GPU job: an{" "}
              <code className="font-mono text-zinc-300">API key</code> and a{" "}
              <code className="font-mono text-zinc-300">web3 wallet</code> for on-chain
              settlement. Once you have both, you can submit jobs, monitor execution, and
              receive SLA-backed guarantees.
            </p>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-5 top-5 bottom-5 w-px bg-zinc-800 hidden md:block" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex gap-6">
                {/* Step number */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-zinc-700 bg-[#0f1011] flex items-center justify-center text-zinc-400 text-sm font-mono z-10">
                  {step.number}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <Card className="bg-[#0f1011] border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-base font-sans">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-400 text-sm mb-4">{step.description}</p>
                      {step.code && (
                        <pre className="bg-[#0f1011] border border-zinc-800 rounded-md p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
                          <code>{step.code}</code>
                        </pre>
                      )}
                      {step.action}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's Next */}
        <Card className="bg-[#0f1011] border-zinc-800 mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">What&apos;s Next</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/docs/api-rest" className="block">
              <div className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
                <p className="text-sm font-sans text-zinc-300">REST API Reference</p>
                <p className="text-xs text-zinc-500 mt-1">Full endpoint documentation</p>
              </div>
            </Link>
            <Link href="/docs/sla-enforcement" className="block">
              <div className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
                <p className="text-sm font-sans text-zinc-300">SLA Enforcement</p>
                <p className="text-xs text-zinc-500 mt-1">How slashing and credits work</p>
              </div>
            </Link>
            <Link href="/docs/heartbeat" className="block">
              <div className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
                <p className="text-sm font-sans text-zinc-300">Heartbeat Telemetry</p>
                <p className="text-xs text-zinc-500 mt-1">30-second node monitoring</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
