"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OnboardingStep {
  title: string;
  description?: string;
}

interface OnboardingShellProps {
  steps: OnboardingStep[];
  currentStep: number;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLastStep?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function OnboardingShell({
  steps,
  currentStep,
  onNext,
  onBack,
  nextLabel = "Continue",
  nextDisabled = false,
  isLastStep = false,
  children,
  className,
}: OnboardingShellProps) {
  const step = steps[currentStep];

  return (
    <div className={cn("min-h-screen bg-[#010102] flex flex-col", className)}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L10 6H15L11 9L12.5 14L8 11L3.5 14L5 9L1 6H6L8 1Z" fill="#22c55e" />
            </svg>
          </div>
          <span className="font-semibold text-white">Tentrist Nodes</span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === currentStep
                  ? "bg-[#22c55e] w-4"
                  : i < currentStep
                  ? "bg-[#22c55e]/50"
                  : "bg-[#3f3f46]"
              )}
            />
          ))}
        </div>

        <span className="text-xs text-[#71717a] font-mono">
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-white mb-2">{step.title}</h1>
            {step.description && (
              <p className="text-sm text-[#71717a]">{step.description}</p>
            )}
          </div>

          <div className="mb-8">{children}</div>

          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              disabled={currentStep === 0}
              className="text-[#71717a] hover:text-white"
            >
              Back
            </Button>
            <Button
              onClick={onNext}
              disabled={nextDisabled}
              className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
            >
              {isLastStep ? "Start Earning" : nextLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
