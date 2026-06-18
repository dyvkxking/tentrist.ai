import Link from "next/link";
import { Zap, Cpu, ArrowRight } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#010102]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center">
            <Zap className="h-4 w-4 text-[#22c55e]" />
          </div>
          <span className="font-semibold text-white text-lg">Tentrist</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#71717a]">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/login" className="text-white hover:text-[#22c55e] transition-colors">Sign In</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full text-xs text-[#22c55e] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] pulse-active" />
          DePIN GPU Network — Live
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight max-w-3xl leading-tight">
          GPU compute<br />without compromise
        </h1>
        <p className="text-lg text-[#71717a] mt-6 max-w-xl">
          Decentralized GPU pools with on-chain SLA enforcement, automatic slashing,
          and 70% lower cost than legacy cloud.
        </p>

        {/* Two CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="http://app.tentrist.ai"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#22c55e] text-white font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
          >
            <Cpu className="h-5 w-5" />
            Rent GPU Power
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="http://nodes.tentrist.ai"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0f1011] border border-[#27272a] text-white font-medium rounded-lg hover:bg-[#27272a] transition-colors"
          >
            <Zap className="h-5 w-5" />
            Provide GPU Nodes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-xs text-[#52525b] mt-4">No credit card required · SLA-backed · On-chain enforcement</p>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 px-6 pb-20 max-w-5xl mx-auto">
        {[
          { title: "70% Cheaper", desc: "Decentralized GPU pools undercut legacy cloud by up to 70%", icon: "⚡" },
          { title: "On-Chain SLA", desc: "Automatic financial enforcement via smart contracts — no manual refunds", icon: "⛓️" },
          { title: "30s Heartbeat", desc: "Real-time VRAM and latency monitoring with instant failover", icon: "💓" },
        ].map((f) => (
          <div key={f.title} className="p-6 bg-[#0f1011] border border-[#27272a] rounded-xl">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="text-white font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-[#71717a]">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}