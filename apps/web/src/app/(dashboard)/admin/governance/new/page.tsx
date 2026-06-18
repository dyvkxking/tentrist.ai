"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/providers/require-auth";

export default function AdminGovernanceNewPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminGovernanceNewContent />
    </RequireAuth>
  );
}

function AdminGovernanceNewContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    proposalType: "Parameter Change",
    parameterToChange: "",
    newValue: "",
    votingDeadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    router.push("/admin/governance");
  };

  const proposalTypes = [
    { value: "Parameter Change", description: "Modify contract parameters like slash percentage, stake requirements, etc." },
    { value: "Contract Upgrade", description: "Upgrade existing smart contracts to new versions." },
    { value: "Budget", description: "Allocate funds for operations, bug bounties, or ecosystem growth." },
  ];

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/governance">
          <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Create Proposal
          </h1>
          <p className="text-sm text-foreground-muted">
            Submit a new governance proposal for on-chain voting
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* Basic Info */}
          <Card className="bg-bg-surface/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-foreground-muted" />
                Proposal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Title
                </label>
                <Input
                  placeholder="e.g., Increase slash percentage from 5% to 10%"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description
                </label>
                <textarea
                  placeholder="Describe the rationale and impact of this proposal..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={cn(
                    "w-full h-32 rounded-md border bg-bg-base px-3 py-2 text-sm",
                    "border-border-hairline focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-indicator-active/50"
                  )}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Proposal Type */}
          <Card className="bg-bg-surface/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Proposal Type</CardTitle>
              <CardDescription>
                Select the category of governance action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {proposalTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, proposalType: type.value })}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-colors",
                      formData.proposalType === type.value
                        ? "border-indicator-active bg-indicator-active/10"
                        : "border-border-hairline hover:border-zinc-600"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{type.value}</span>
                      {formData.proposalType === type.value && (
                        <Badge variant="success" size="sm">Selected</Badge>
                      )}
                    </div>
                    <p className="text-xs text-foreground-muted">{type.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parameter Details (conditional based on type) */}
          {formData.proposalType === "Parameter Change" && (
            <Card className="bg-bg-surface/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Parameter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Parameter to Change
                  </label>
                  <Input
                    placeholder="e.g., slashPercentage"
                    value={formData.parameterToChange}
                    onChange={(e) => setFormData({ ...formData, parameterToChange: e.target.value })}
                    required
                  />
                  <p className="text-xs text-foreground-muted mt-1">
                    Enter the exact parameter name as defined in the contract
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    New Value
                  </label>
                  <Input
                    placeholder="e.g., 10"
                    value={formData.newValue}
                    onChange={(e) => setFormData({ ...formData, newValue: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {formData.proposalType === "Contract Upgrade" && (
            <Card className="bg-bg-surface/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contract Upgrade Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Contract Name
                  </label>
                  <Input
                    placeholder="e.g., Escrow.sol"
                    value={formData.parameterToChange}
                    onChange={(e) => setFormData({ ...formData, parameterToChange: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    New Version / IPFS Hash
                  </label>
                  <Input
                    placeholder="e.g., v2.1 orQm..."
                    value={formData.newValue}
                    onChange={(e) => setFormData({ ...formData, newValue: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {formData.proposalType === "Budget" && (
            <Card className="bg-bg-surface/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Budget Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Amount (ETH)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 500"
                    value={formData.newValue}
                    onChange={(e) => setFormData({ ...formData, newValue: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Recipient / Purpose
                  </label>
                  <Input
                    placeholder="e.g., Bug bounty program treasury"
                    value={formData.parameterToChange}
                    onChange={(e) => setFormData({ ...formData, parameterToChange: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Voting Deadline */}
          <Card className="bg-bg-surface/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Voting Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Voting Deadline
                </label>
                <Input
                  type="datetime-local"
                  value={formData.votingDeadline}
                  onChange={(e) => setFormData({ ...formData, votingDeadline: e.target.value })}
                  required
                />
                <p className="text-xs text-foreground-muted mt-1">
                  The proposal will be active for voting until this deadline
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Link href="/admin/governance">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isSubmitting} className="gap-2">
              <Send className="h-4 w-4" />
              Submit Proposal
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
