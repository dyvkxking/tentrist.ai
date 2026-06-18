"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Cpu, Wallet, Zap } from "lucide-react";

const GPU_MODELS = [
  "NVIDIA H100 80GB",
  "NVIDIA H100 40GB",
  "NVIDIA A100 80GB",
  "NVIDIA A100 40GB",
  "NVIDIA RTX 4090 24GB",
  "NVIDIA RTX 3090 24GB",
  "AMD MI300X 128GB",
];

const REGIONS = [
  "US-West",
  "US-East",
  "EU-Central",
  "EU-West",
  "Asia-Pacific",
  "Asia-East",
];

export default function RegisterNodePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    displayName: "",
    gpuModel: GPU_MODELS[0],
    vramGb: "",
    region: REGIONS[0],
    pricePerMin: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newNodeId = "0x" + Math.random().toString(16).slice(2, 10);
    router.push(`/node/nodes/${newNodeId}`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back link */}
      <Link
        href="/node/nodes"
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Nodes
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Register New Node</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Add a new GPU compute node to the Tentrist network
        </p>
      </div>

      {/* Info card */}
      <Card className="border-[#22c55e]/20 bg-[#22c55e]/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Wallet className="h-5 w-5 text-[#22c55e] mt-0.5" />
            <div className="text-sm">
              <p className="text-white font-medium">Wallet already linked</p>
              <p className="text-[#71717a] mt-1">
                Your wallet is connected from onboarding. You will stake collateral after
                registration to become eligible for workloads.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#71717a]" />
              Node Configuration
            </CardTitle>
            <CardDescription className="text-[#71717a]">
              Configure your node hardware and network settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-sm text-[#71717a]">Display Name</label>
              <Input
                placeholder="e.g., GPU-Rig-Alpha-01"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                required
                className="bg-[#010102] border-[#27272a]"
              />
            </div>

            {/* GPU Model */}
            <div className="space-y-2">
              <label className="text-sm text-[#71717a]">GPU Model</label>
              <select
                value={formData.gpuModel}
                onChange={(e) =>
                  setFormData({ ...formData, gpuModel: e.target.value })
                }
                className="w-full h-10 px-3 bg-[#010102] border border-[#27272a] rounded-md text-white text-sm focus:outline-none focus:border-[#22c55e]"
              >
                {GPU_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* VRAM */}
            <div className="space-y-2">
              <label className="text-sm text-[#71717a]">VRAM (GB)</label>
              <Input
                type="number"
                placeholder="80"
                min="1"
                max="512"
                value={formData.vramGb}
                onChange={(e) =>
                  setFormData({ ...formData, vramGb: e.target.value })
                }
                required
                className="bg-[#010102] border-[#27272a] font-mono"
              />
            </div>

            {/* Region */}
            <div className="space-y-2">
              <label className="text-sm text-[#71717a]">Region</label>
              <select
                value={formData.region}
                onChange={(e) =>
                  setFormData({ ...formData, region: e.target.value })
                }
                className="w-full h-10 px-3 bg-[#010102] border border-[#27272a] rounded-md text-white text-sm focus:outline-none focus:border-[#22c55e]"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Price per minute */}
            <div className="space-y-2">
              <label className="text-sm text-[#71717a]">Price per Minute (ETH)</label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.001"
                value={formData.pricePerMin}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerMin: e.target.value })
                }
                required
                className="bg-[#010102] border-[#27272a] font-mono"
              />
              <p className="text-xs text-[#71717a]">
                Competitive rates: H100 ~0.001-0.003 ETH/min, A100 ~0.0005-0.001 ETH/min
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Link href="/node/nodes">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            <Zap className="h-4 w-4 mr-1" />
            Register Node
          </Button>
        </div>
      </form>
    </div>
  );
}
