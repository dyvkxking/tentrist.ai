"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AuthenticationPage() {
  return (
    <div className="min-h-screen bg-[#010102] text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="border-zinc-800 text-zinc-400 mb-4">
            Reference
          </Badge>
          <h1 className="text-4xl font-sans font-semibold tracking-tight mb-4">
            API Authentication
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Learn how to authenticate your API requests using keys and wallet signatures.
          </p>
        </div>

        {/* Overview */}
        <Card className="bg-[#0f1011] border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-400">
            <p>
              Tentrist uses <span className="text-zinc-300">API keys</span> as the primary
              authentication method for all standard operations. For sensitive or privileged
              actions — such as withdrawing funds or updating SLA parameters — the API supports
              a <span className="text-zinc-300">wallet signature challenge-response flow</span>{" "}
              for additional security.
            </p>
          </CardContent>
        </Card>

        {/* API Key Authentication */}
        <Card className="bg-[#0f1011] border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">API Key Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-400">
              Include your API key in the <code className="font-mono text-zinc-300">Authorization</code>{" "}
              header on every request.
            </p>
            <pre className="bg-[#0f1011] border border-zinc-800 rounded-md p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
              <code>Authorization: Bearer &lt;your-api-key&gt;</code>
            </pre>
            <p className="text-zinc-500 text-sm">
              Keep your API key secret. Do not commit it to source control or expose it in
              client-side code.
            </p>
          </CardContent>
        </Card>

        {/* Wallet Signature */}
        <Card className="bg-[#0f1011] border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">Wallet Signature (Advanced)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-400">
              For privileged operations, Tentrist uses a challenge-response flow signed with
              your web3 wallet. This proves wallet ownership without exposing private keys.
            </p>
            <ol className="list-decimal list-inside space-y-3 text-sm text-zinc-400">
              <li>
                Server issues a challenge string (one-time, expires in 5 minutes).
              </li>
              <li>
                Client signs the challenge with their wallet private key.
              </li>
              <li>
                Client submits the signed challenge along with the wallet address.
              </li>
              <li>
                Server verifies the signature and grants a session token for privileged calls.
              </li>
            </ol>
            <pre className="bg-[#0f1011] border border-zinc-800 rounded-md p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
              <code>{`// Example: Sign a challenge
const challenge = await fetch('/api/v1/auth/challenge');
const signature = await wallet.signMessage(challenge.challenge);
await fetch('/api/v1/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: wallet.address, signature })
});`}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="bg-[#0f1011] border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-sans">Rate Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 text-zinc-400 font-sans">Plan</th>
                    <th className="text-right py-3 text-zinc-400 font-sans">Requests / min</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 font-mono">Standard</td>
                    <td className="py-3 text-right font-mono">100</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3 font-mono">Enterprise</td>
                    <td className="py-3 text-right font-mono">1,000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-zinc-500 text-sm font-sans pt-2">
              Rate limit headers included in every response:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { header: "X-RateLimit-Limit", desc: "Your plan limit" },
                { header: "X-RateLimit-Remaining", desc: "Requests left this window" },
                { header: "X-RateLimit-Reset", desc: "Unix timestamp when window resets" },
              ].map((h) => (
                <div key={h.header} className="border border-zinc-800 rounded-md p-3">
                  <p className="font-mono text-xs text-emerald-500">{h.header}</p>
                  <p className="text-zinc-500 text-xs mt-1">{h.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Codes */}
        <Card className="bg-[#0f1011] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg font-sans">Error Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 text-zinc-400 font-sans">Code</th>
                    <th className="text-left py-3 text-zinc-400 font-sans">Meaning</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  {[
                    {
                      code: "401",
                      name: "Unauthorized",
                      desc: "Missing or invalid API key.",
                    },
                    {
                      code: "403",
                      name: "Forbidden",
                      desc: "Valid key but insufficient permissions for this operation.",
                    },
                    {
                      code: "429",
                      name: "Rate Limited",
                      desc: "Request quota exceeded. Check X-RateLimit-Reset.",
                    },
                    {
                      code: "500",
                      name: "Internal Error",
                      desc: "Server-side issue. Retry with exponential back-off.",
                    },
                  ].map((err) => (
                    <tr key={err.code} className="border-b border-zinc-800">
                      <td className="py-3 font-mono text-rose-500">{err.code}</td>
                      <td className="py-3">
                        <span className="text-zinc-300">{err.name}</span>
                        <span className="text-zinc-500"> — {err.desc}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
