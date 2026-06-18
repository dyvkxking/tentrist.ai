"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ApiRestPage() {
  return (
    <div className="min-h-screen bg-[#010102] text-[#fafafa]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="border-[#27272a] text-[#a1a1aa] mb-4">
            API Reference
          </Badge>
          <h1 className="text-4xl font-sans font-semibold mb-4">
            REST API Overview
          </h1>
          <p className="text-[#a1a1aa] text-lg font-sans">
            Build integrations with the Tentrist compute network using our HTTPS JSON API.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Overview</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed">
                The Tentrist REST API provides programmatic access to job management, node querying,
                and account operations. All endpoints are served over HTTPS and use JSON for both
                request and response payloads.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Authentication</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                Authenticate requests by including your API key in the Authorization header:
              </p>
              <div className="p-4 rounded-lg bg-[#010102] border border-[#27272a] overflow-x-auto">
                <pre className="text-sm font-mono text-[#a1a1aa]">
                  <span className="text-[#22c55e]">Authorization</span>:{" "}
                  <span className="text-[#fafafa]">Bearer &lt;api-key&gt;</span>
                </pre>
              </div>
              <p className="text-sm text-[#a1a1aa] mt-4">
                Generate and manage API keys at{" "}
                <Link href="/settings/api-keys" className="text-[#22c55e] hover:underline">
                  /settings/api-keys
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Base URL */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Base URL</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="p-4 rounded-lg bg-[#010102] border border-[#27272a]">
                <pre className="text-sm font-mono text-[#fafafa]">
                  https://api.tentrist.ai/v1
                </pre>
              </div>
              <p className="text-sm text-[#a1a1aa] mt-4">
                All endpoints described in this reference are relative to this base URL.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Core Endpoints */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Core Endpoints</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#27272a]">
                      <th className="text-left py-3 px-4 text-sm font-sans font-medium text-[#a1a1aa]">
                        Method
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-sans font-medium text-[#a1a1aa]">
                        Path
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-sans font-medium text-[#a1a1aa]">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        method: "POST",
                        path: "/jobs/serverless",
                        desc: "Submit a new GPU compute job",
                      },
                      {
                        method: "GET",
                        path: "/jobs/{id}",
                        desc: "Get job details and current status",
                      },
                      {
                        method: "GET",
                        path: "/jobs/{id}/sla",
                        desc: "Get SLA compliance record for a job",
                      },
                      {
                        method: "GET",
                        path: "/jobs/{id}/nodes",
                        desc: "Get nodes assigned to a job",
                      },
                      {
                        method: "GET",
                        path: "/jobs/{id}/checkpoints",
                        desc: "List all checkpoints for a job",
                      },
                      {
                        method: "GET",
                        path: "/jobs/{id}/events",
                        desc: "Get job event log",
                      },
                      {
                        method: "POST",
                        path: "/jobs/{id}/cancel",
                        desc: "Cancel an active job",
                      },
                      {
                        method: "GET",
                        path: "/nodes/eligible",
                        desc: "List eligible nodes for job params",
                      },
                      {
                        method: "GET",
                        path: "/nodes/{address}",
                        desc: "Get node info by address",
                      },
                      {
                        method: "GET",
                        path: "/user/balance",
                        desc: "Get account balance",
                      },
                      {
                        method: "GET",
                        path: "/user/transactions",
                        desc: "Get transaction history",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[#27272a]/50">
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded text-xs font-mono",
                              row.method === "GET"
                                ? "bg-[#22c55e]/10 text-[#22c55e]"
                                : "bg-[#f59e0b]/10 text-[#f59e0b]"
                            )}
                          >
                            {row.method}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-[#fafafa]">{row.path}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#a1a1aa]">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Response Format */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Response Format</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                All responses follow a standard wrapper format:
              </p>
              <div className="p-4 rounded-lg bg-[#010102] border border-[#27272a] overflow-x-auto">
                <pre className="text-sm font-mono text-[#a1a1aa]">
{`{
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "pagination": {
      "limit": 20,
      "after": "cursor_xyz",
      "has_more": true
    }
  },
  "error": null
}`}
                </pre>
              </div>
              <ul className="mt-4 space-y-2">
                {[
                  "data — The response payload (null if error)",
                  "meta — Request metadata including pagination info",
                  "error — Error object or null on success",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#22c55e] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Pagination */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Pagination</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                List endpoints use cursor-based pagination:
              </p>
              <div className="p-4 rounded-lg bg-[#010102] border border-[#27272a] overflow-x-auto">
                <pre className="text-sm font-mono text-[#a1a1aa]">
{`GET /jobs?limit=20&after=cursor_xyz`}
                </pre>
              </div>
              <ul className="mt-4 space-y-2">
                {[
                  "limit — Number of items to return (default 20, max 100)",
                  "after — Cursor from previous response to fetch next page",
                  "has_more — Boolean indicating if additional pages exist",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#22c55e] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Webhooks */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Webhooks</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                For asynchronous event notifications, use webhooks to receive push updates when:
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "A job completes successfully",
                  "A node is slashed due to SLA violation",
                  "A checkpoint is created or restored",
                  "A job is migrated to a standby node",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#22c55e] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/docs/api-websocket">
                <Button
                  variant="outline"
                  className="border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]"
                >
                  View Webhook Documentation
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Rate Limits */}
        <section className="mb-12">
          <h2 className="text-2xl font-sans font-semibold mb-4">Rate Limits</h2>
          <Card className="bg-[#0f1011] border-[#27272a]">
            <CardContent className="p-6">
              <p className="text-[#a1a1aa] leading-relaxed mb-4">
                API requests are rate-limited to ensure fair usage across all clients.
                Limits vary by endpoint and plan tier:
              </p>
              <ul className="space-y-3">
                {[
                  "Standard: 1,000 requests per minute",
                  "Enterprise: 10,000 requests per minute",
                  "Rate limit headers are included in every response",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[#22c55e] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/docs/rate-limits">
                  <Button
                    variant="outline"
                    className="border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]"
                  >
                    View Rate Limit Details
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
          <Link href="/docs/websocket">
            <Button variant="outline" className="border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]">
              WebSocket API &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
