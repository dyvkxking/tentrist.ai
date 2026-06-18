"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const workloadTypes = [
  {
    type: "llm-inference",
    description: "Running inference with a large language model (e.g., text generation, RAG).",
  },
  {
    type: "llm-fine-tuning",
    description: "Fine-tuning a language model on a custom dataset.",
  },
  {
    type: "batch-processing",
    description: "Large-scale batch jobs such as data transformation or embedding generation.",
  },
  {
    type: "rendering",
    description: "GPU-accelerated rendering tasks like image or video frame rendering.",
  },
  {
    type: "model-training",
    description: "Full model training workflows for computer vision or other ML tasks.",
  },
];

const jobStates = [
  {
    state: "pending",
    description: "Job is queued and waiting for an eligible node to pick it up.",
  },
  {
    state: "running",
    description: "A node has started executing the workload.",
  },
  {
    state: "completed",
    description: "Job finished successfully and SLA compliance has been verified.",
  },
  {
    state: "failed",
    description: "Job failed. Either the node returned an error or the SLA was violated.",
  },
  {
    state: "cancelled",
    description: "Job was cancelled by the client before completion.",
  },
  {
    state: "rerouted",
    description: "Original node failed and the job was migrated to a standby node.",
  },
];

export default function FirstJobPage() {
  return (
    <div className="min-h-screen bg-[#010102] text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="border-zinc-800 text-zinc-400 mb-4">
            Guide
          </Badge>
          <h1 className="text-4xl font-sans font-semibold tracking-tight mb-4">
            Your First GPU Job
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Learn what a job is, how to submit one, and how to interpret the results.
          </p>
        </div>

        {/* Overview */}
        <Card className="bg-[#0f1011] border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-400">
            <p>
              A <span className="text-zinc-300">job</span> is the fundamental unit of work in
              Tentrist. It represents a discrete GPU compute task — such as running an LLM
              inference or batch rendering — paired with an on-chain{" "}
              <span className="text-zinc-300">SLA contract</span> that guarantees uptime,
              defines penalties for failure, and credits your account automatically if
              benchmarks are missed.
            </p>
          </CardContent>
        </Card>

        {/* Prerequisites */}
        <Card className="bg-[#0f1011] border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">Prerequisites</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            <ul className="list-disc list-inside space-y-2">
              <li>
                An active Tentrist <code className="font-mono text-zinc-300">API key</code>{" "}
                (create one at{" "}
                <span className="text-zinc-300">/dashboard/settings/api-keys</span>)
              </li>
              <li>
                Familiarity with your workload type (see below) and the GPU resources it
                requires
              </li>
              <li>
                A wallet with sufficient balance to cover the maximum job cost (held in
                escrow during execution)
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Workload Types */}
        <Card className="bg-[#0f1011] border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">Workload Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-400 text-sm">
              Each job must declare a workload type so the orchestrator can route it to
              compatible nodes.
            </p>
            <div className="space-y-3">
              {workloadTypes.map((wt) => (
                <div
                  key={wt.type}
                  className="flex flex-col sm:flex-row sm:items-start gap-2 border border-zinc-800 rounded-md p-3"
                >
                  <code className="font-mono text-sm text-emerald-500 sm:min-w-48">
                    {wt.type}
                  </code>
                  <span className="text-zinc-400 text-sm">{wt.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step-by-step walkthrough */}
        <Card className="bg-[#0f1011] border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">
              Step-by-Step: LLM Inference Job
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-sans text-zinc-300 mb-2">1. Submit the job</h3>
              <p className="text-zinc-400 text-sm mb-3">
                Use <code className="font-mono text-zinc-300">POST /api/v1/jobs/serverless</code>{" "}
                with your SLA parameters. The <code className="font-mono text-zinc-300">required_uptime</code> is
                expressed in basis points — 9900 means 99%.
              </p>
              <pre className="bg-[#0f1011] border border-zinc-800 rounded-md p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
                <code>{`curl -X POST https://api.tentrist.ai/v1/jobs/serverless \\
  -H "Authorization: Bearer <your-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workload_type": "llm-inference",
    "vram_required_gb": 24,
    "flop_estimate": 1000000000000,
    "duration_blocks": 100,
    "required_uptime": 9900,
    "max_price_per_block": "0.0001"
  }'`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-sans text-zinc-300 mb-2">2. Check job status</h3>
              <p className="text-zinc-400 text-sm mb-3">
                Poll <code className="font-mono text-zinc-300">GET /api/v1/jobs/{`{jobId}`}</code> or
                connect to the WebSocket stream for real-time updates.
              </p>
              <pre className="bg-[#0f1011] border border-zinc-800 rounded-md p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
                <code>{`curl https://api.tentrist.ai/v1/jobs/job_01HX... \\
  -H "Authorization: Bearer <your-api-key>"`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-sans text-zinc-300 mb-2">
                3. Successful completion response
              </h3>
              <p className="text-zinc-400 text-sm mb-3">
                When the job completes successfully, the response includes the execution
                result and SLA compliance status.
              </p>
              <pre className="bg-[#0f1011] border border-zinc-800 rounded-md p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
                <code>{`{
  "job_id": "job_01HX9YZ2KP...",
  "status": "completed",
  "workload_type": "llm-inference",
  "sla": {
    "uptime_recorded": 10000,
    "uptime_required": 9900,
    "compliant": true,
    "slashed": false,
    "sla_credit_issued": false
  },
  "cost": "0.0097 ETH",
  "completed_at": "2026-06-18T14:23:11Z"
}`}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Understanding Job States */}
        <Card className="bg-[#0f1011] border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">Understanding Job States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 text-zinc-400 font-sans">State</th>
                    <th className="text-left py-3 text-zinc-400 font-sans">Description</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  {jobStates.map((s) => (
                    <tr key={s.state} className="border-b border-zinc-800">
                      <td className="py-3 font-mono text-sm">
                        {s.state}
                      </td>
                      <td className="py-3 text-zinc-400 text-sm">{s.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* SLA Credits */}
        <Card className="bg-[#0f1011] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-sans">SLA Credits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-400">
              If the node fails to meet the <code className="font-mono text-zinc-300">required_uptime</code>{" "}
              SLA during job execution, Tentrist automatically issues an on-chain SLA credit
              to your account. The credit is calculated as a percentage of the job cost
              proportional to the uptime shortfall, and is applied to your next invoice or
              job submission.
            </p>
            <div className="border border-zinc-800 rounded-md p-4">
              <p className="text-sm text-zinc-400 mb-2">Example:</p>
              <p className="text-sm text-zinc-300">
                Job with required_uptime = 9900 (99%) and actual uptime = 9850 (98.5%).
                The 0.5% shortfall triggers an automatic credit to your account — no support
                ticket required.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
