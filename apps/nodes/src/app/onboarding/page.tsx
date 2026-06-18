"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Wallet, Cpu, Zap, Globe, Clock } from "lucide-react";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Welcome, node provider", description: "Stake, register, and earn from your GPU hardware" },
  { title: "Link your Ethereum wallet", description: "Your wallet is your node identity and collateral holder" },
  { title: "Register your GPU node", description: "Tell us about your hardware" },
  { title: "How earning works", description: "Understand staking, heartbeats, and SLA enforcement" },
];

const GPU_MODELS = [
  "NVIDIA H100 80GB",
  "NVIDIA A100 80GB",
  "NVIDIA A6000 48GB",
  "AMD Instinct MI300X 128GB",
  "NVIDIA RTX 4090 24GB",
  "Other",
];

const REGIONS = [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
  "ap-northeast-1",
];

export default function NodesOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [walletLinked, setWalletLinked] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
  const [isLinking, setIsLinking] = React.useState(false);

  // Node registration form
  const [nodeName, setNodeName] = React.useState("");
  const client = supabase;
  if (!client) return;
  const [gpuModel, setGpuModel] = React.useState("");
  const [vramGB, setVramGB] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [pricePerMin, setPricePerMin] = React.useState("0.001");
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [nodeRegistered, setNodeRegistered] = React.useState(false);
  const [nodeId, setNodeId] = React.useState<string | null>(null);
  const [isCompleting, setIsCompleting] = React.useState(false);

  async function handleLinkWallet() {
    setIsLinking(true);
    try {
      const user = (await client?.auth.getSession())?.data.session?.user;
      if (!user) throw new Error("Not authenticated");

      const challengeRes = await fetch("/api/v1/auth/wallet/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const { nonce } = await challengeRes.json();

      // Mock wallet + signature for demo
      const mockWallet = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const mockSig = "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const verifyRes = await fetch("/api/v1/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, nonce, wallet_address: mockWallet, signature: mockSig }),
      });

      if (verifyRes.ok) {
        setWalletLinked(true);
        setWalletAddress(mockWallet);
      }
    } catch (err) {
      console.error("Wallet link failed:", err);
    } finally {
      setIsLinking(false);
    }
  }

  async function handleRegisterNode() {
    if (!client) return;
    setIsRegistering(true);
    try {
      const user = (await client?.auth.getSession())?.data.session?.user;
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await client
        .from("nodes")
        .insert({
          wallet_address: walletAddress,
          display_name: nodeName,
          gpu_model: gpuModel,
          vram_total_mb: parseInt(vramGB) * 1024,
          status: "offline",
          location: region,
          price_per_minute_usd: parseFloat(pricePerMin),
        })
        .select("id")
        .single();

      if (error) throw error;
      setNodeId(data.id);
      setNodeRegistered(true);
    } catch (err) {
      console.error("Node registration failed:", err);
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleComplete() {
    if (!client) return;
    setIsCompleting(true);
    try {
      const user = (await client?.auth.getSession())?.data.session?.user;
      if (!user || !walletAddress) throw new Error("Not authenticated");

      await client
        .from("profiles")
        .update({ user_type: "provider", onboarding_completed: true })
        .eq("id", user.id);

      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setIsCompleting(false);
    }
  }

  const canProceed = (() => {
    if (step === 1) return walletLinked;
    if (step === 2) return nodeName && gpuModel && vramGB && region;
    return true;
  })();

  return (
    <OnboardingShell
      steps={STEPS}
      currentStep={step}
      onNext={() => {
        if (step < STEPS.length - 1) setStep(step + 1);
        else handleComplete();
      }}
      nextLabel={step === STEPS.length - 1 ? "Start Earning" : "Continue"}
      nextDisabled={!canProceed}
      isLastStep={step === STEPS.length - 1}
    >
      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="p-6 bg-[#0f1011] border border-[#27272a] rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-[#22c55e]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">GPU Node Provider Program</h3>
                <p className="text-sm text-[#71717a]">
                  Earn rewards by providing reliable GPU compute. Your nodes process jobs from clients
                  who need decentralized GPU power at up to 70% lower cost than cloud providers.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Wallet className="h-5 w-5" />, label: "Stake collateral", desc: "Minimum 1 ETH" },
              { icon: <Cpu className="h-5 w-5" />, label: "Register node", desc: "GPU + region + price" },
              { icon: <Zap className="h-5 w-5" />, label: "Send heartbeats", desc: "Every 30 seconds" },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-[#0f1011] border border-[#27272a] rounded-lg text-center">
                <div className="flex justify-center mb-2 text-[#22c55e]">{item.icon}</div>
                <div className="text-xs font-medium text-white">{item.label}</div>
                <div className="text-xs text-[#71717a]">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Link Wallet */}
      {step === 1 && (
        <div className="space-y-4">
          {walletLinked ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#22c55e]">
                <CheckCircle2 className="h-4 w-4" />
                Wallet linked successfully
              </div>
              <div className="p-4 bg-[#0f1011] border border-[#27272a] rounded-lg">
                <div className="text-xs text-[#71717a] mb-1">Connected wallet</div>
                <code className="text-sm font-mono text-white">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </code>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#71717a]">
                Your Ethereum wallet identifies your node and holds your stake collateral.
                All job payments and slashing events flow through this wallet.
              </p>
              <div className="p-4 bg-[#0f1011] border border-[#27272a] rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#71717a]">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  Wallet is used for on-chain staking
                </div>
                <div className="flex items-center gap-2 text-xs text-[#71717a]">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  Node identity tied to wallet address
                </div>
                <div className="flex items-center gap-2 text-xs text-[#71717a]">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  Payment settlements in ETH
                </div>
              </div>
              <Button
                onClick={handleLinkWallet}
                isLoading={isLinking}
                className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a]"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Register Node */}
      {step === 2 && (
        <div className="space-y-4">
          {nodeRegistered ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#22c55e]">
                <CheckCircle2 className="h-4 w-4" />
                Node registered successfully
              </div>
              <div className="p-4 bg-[#0f1011] border border-[#27272a] rounded-lg">
                <div className="text-xs text-[#71717a] mb-1">Node ID</div>
                <code className="text-sm font-mono text-white">{nodeId}</code>
              </div>
              <p className="text-xs text-[#52525b]">
                Your node is registered but offline. Once you stake collateral and start the heartbeat
                agent, it will come online and receive jobs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#71717a] mb-1.5">Node display name</label>
                <input
                  type="text"
                  placeholder="e.g. GPU-Rig-01"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f1011] border border-[#27272a] rounded-lg text-sm text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#22c55e]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#71717a] mb-1.5">GPU Model</label>
                <select
                  value={gpuModel}
                  onChange={(e) => setGpuModel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f1011] border border-[#27272a] rounded-lg text-sm text-white focus:outline-none focus:border-[#22c55e]"
                >
                  <option value="">Select GPU model</option>
                  {GPU_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#71717a] mb-1.5">VRAM (GB)</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={vramGB}
                    onChange={(e) => setVramGB(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f1011] border border-[#27272a] rounded-lg text-sm text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#71717a] mb-1.5">Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f1011] border border-[#27272a] rounded-lg text-sm text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="">Select region</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#71717a] mb-1.5">Price per minute (ETH)</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="0.001"
                  value={pricePerMin}
                  onChange={(e) => setPricePerMin(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f1011] border border-[#27272a] rounded-lg text-sm text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#22c55e]"
                />
              </div>
              <Button
                onClick={handleRegisterNode}
                isLoading={isRegistering}
                disabled={!canProceed}
                className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a]"
              >
                Register Node
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: How earning works */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              {
                icon: <Clock className="h-4 w-4 text-[#22c55e]" />,
                title: "30-second heartbeats",
                desc: "Your node sends a heartbeat every 30s. Miss it and the node goes stale — jobs get rerouted.",
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg>,
                title: "SLA slashing",
                desc: "Miss more than 10% of heartbeats in a 24h window and your stake gets partially slashed.",
              },
              {
                icon: <Zap className="h-4 w-4 text-[#22c55e]" />,
                title: "Automatic payments",
                desc: "When a job completes successfully, payment is transferred automatically to your wallet.",
              },
              {
                icon: <Globe className="h-4 w-4 text-[#22c55e]" />,
                title: "Minimum stake: 1 ETH",
                desc: "You must stake at least 1 ETH equivalent to receive jobs. Higher stake = more jobs assigned.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[#0f1011] border border-[#27272a] rounded-lg">
                <div className="mt-0.5 shrink-0">{item.icon}</div>
                <div>
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  <div className="text-xs text-[#71717a] mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </OnboardingShell>
  );
}
