"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Cpu, Wallet, Key, CheckCircle2, Copy, Zap } from "lucide-react";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Choose your role", description: "How will you use Tentrist?" },
  { title: "Create an API key", description: "Authenticate your requests to the platform" },
  { title: "Link your wallet", description: "Optional — enables automatic payments" },
];

type RoleChoice = "client" | "provider" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [role, setRole] = React.useState<RoleChoice>(null);
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [apiKeyName, setApiKeyName] = React.useState<string>("");
  const [walletLinked, setWalletLinked] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isLinking, setIsLinking] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);

  const user = useAuthStore((s) => s.user);

  async function handleGenerateKey() {
    if (!user) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .insert({ name: apiKeyName || "Default" })
        .select("id, key_prefix")
        .single();

      if (error) throw error;
      // Display a fake full key for demo — in production the backend returns the unhashed key once
      const fakeKey = `${data.key_prefix}_${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("")}`;
      setApiKey(fakeKey);
    } catch (err) {
      console.error("Failed to generate API key:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyKey() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleLinkWallet() {
    if (!user) return;
    setIsLinking(true);
    try {
      // Get nonce challenge from backend
      const challengeRes = await fetch("/api/v1/auth/wallet/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const { nonce, message } = await challengeRes.json();

      // Request signature from wallet (mock — would use wagmi/rainbowkit in production)
      // For demo, simulate a successful signature with a mock wallet address
      const mockWallet = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const mockSig = "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const verifyRes = await fetch("/api/v1/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          nonce,
          wallet_address: mockWallet,
          signature: mockSig,
        }),
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

  async function handleComplete() {
    if (!user) return;
    setIsCompleting(true);
    try {
      await supabase
        .from("profiles")
        .update({
          user_type: role,
          onboarding_completed: true,
        })
        .eq("id", user.id);
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setIsCompleting(false);
    }
  }

  const canProceed = (() => {
    if (step === 0) return role !== null;
    if (step === 1) return true; // API key is optional
    return true;
  })();

  return (
    <OnboardingShell
      steps={STEPS}
      currentStep={step}
      onNext={() => {
        if (step === 0 && role === "provider") {
          // Providers go through the nodes app onboarding — redirect there
          window.location.href = "http://nodes.tentrist.ai/onboarding";
          return;
        }
        if (step < STEPS.length - 1) setStep(step + 1);
        else handleComplete();
      }}
      nextLabel={step === STEPS.length - 1 ? "Enter Dashboard" : "Continue"}
      nextDisabled={!canProceed}
      isLastStep={step === STEPS.length - 1}
    >
      {/* Step 0: Choose role */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <RoleCard
              selected={role === "client"}
              onClick={() => setRole("client")}
              icon={<Cpu className="h-8 w-8 text-[#22c55e]" />}
              title="Rent GPU Power"
              description="Submit compute jobs, monitor execution, and pay for GPU time"
            />
            <RoleCard
              selected={role === "provider"}
              onClick={() => setRole("provider")}
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 7h10M7 10h6"/></svg>}
              title="Provide GPU Nodes"
              description="Stake collateral, run GPU nodes, and earn rewards"
            />
          </div>
          {role === "provider" && (
            <div className="p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg text-sm text-[#f59e0b]">
              You'll be redirected to the node provider portal to complete setup.
            </div>
          )}
        </div>
      )}

      {/* Step 1: API Key */}
      {step === 1 && (
        <div className="space-y-4">
          {!apiKey ? (
            <div className="space-y-3">
              <p className="text-sm text-[#71717a]">
                Your API key authenticates all requests to the Tentrist compute API.
                Copy and store it securely — it won't be shown again.
              </p>
              <input
                type="text"
                placeholder="Key name (e.g. Production, Dev)"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0f1011] border border-[#27272a] rounded-lg text-sm text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#22c55e]"
              />
              <Button
                onClick={handleGenerateKey}
                isLoading={isGenerating}
                className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a]"
              >
                Generate API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#22c55e]">
                <CheckCircle2 className="h-4 w-4" />
                API key generated successfully
              </div>
              <div className="relative p-3 bg-[#0f1011] border border-[#27272a] rounded-lg">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs text-[#71717a]">API Key</span>
                  <button
                    onClick={handleCopyKey}
                    className="flex items-center gap-1 text-xs text-[#22c55e] hover:text-[#16a34a]"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <code className="text-xs font-mono text-white break-all">{apiKey}</code>
              </div>
              <p className="text-xs text-[#52525b]">
                Store this key securely. It won't be shown again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Link Wallet */}
      {step === 2 && (
        <div className="space-y-4">
          {walletLinked ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#22c55e]">
                <CheckCircle2 className="h-4 w-4" />
                Wallet linked successfully
              </div>
              <div className="p-3 bg-[#0f1011] border border-[#27272a] rounded-lg">
                <span className="text-xs text-[#71717a]">Connected wallet</span>
                <code className="block text-sm font-mono text-white mt-1">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </code>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#71717a]">
                Linking your Ethereum wallet enables automatic job payments and is optional.
                You can skip this and add a wallet later from Settings.
              </p>
              <Button
                onClick={handleLinkWallet}
                isLoading={isLinking}
                variant="outline"
                className="w-full border-[#27272a] text-white hover:bg-[#27272a]"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      )}
    </OnboardingShell>
  );
}

function RoleCard({
  selected,
  onClick,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border text-left transition-all",
        selected
          ? "border-[#22c55e] bg-[#22c55e]/10"
          : "border-[#27272a] bg-[#0f1011] hover:border-[#3f3f46]"
      )}
    >
      <div className="mb-3">{icon}</div>
      <div className="text-sm font-semibold text-white mb-1">{title}</div>
      <div className="text-xs text-[#71717a]">{description}</div>
    </button>
  );
}
