"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Server,
  Brain,
  Image,
  Boxes,
  Upload,
  Settings2,
  Shield,
  Wallet,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { jobsApi } from "@/lib/supabase";

// Validation schema
const jobSchema = z.object({
  jobType: z.enum(["llm", "rendering", "batch"]),
  requiredUptime: z.number().min(90, "Minimum uptime is 90%").max(100, "Maximum uptime is 100%"),
  requiredThroughput: z.number().min(10, "Minimum throughput is 10 ops/s").max(1000, "Maximum throughput is 1000 ops/s"),
  deadlineHours: z.number().min(1, "Minimum deadline is 1 hour").max(168, "Maximum deadline is 168 hours"),
  checkpointInterval: z.number().min(30, "Minimum interval is 30s").max(300, "Maximum interval is 300s"),
  parameters: z.string().optional(),
  depositAmount: z.number().min(0.001, "Minimum deposit is 0.001 ETH"),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the SLA terms",
  }),
});

type JobFormData = z.infer<typeof jobSchema>;

// Job type definitions
const jobTypes = [
  {
    id: "llm" as const,
    title: "LLM Fine-tuning",
    description: "Large language model training and fine-tuning workloads",
    icon: <Brain className="h-8 w-8" />,
    color: "indicator-active",
    deposit: 0.05,
  },
  {
    id: "rendering" as const,
    title: "Batch Rendering",
    description: "Image and video rendering pipelines",
    icon: <Image className="h-8 w-8" />,
    color: "indicator-stale",
    deposit: 0.02,
  },
  {
    id: "batch" as const,
    title: "Batch Compute",
    description: "General batch processing tasks",
    icon: <Boxes className="h-8 w-8" />,
    color: "blue-400",
    deposit: 0.01,
  },
];

// SLA presets
const slaPresets = [
  { label: "Standard", uptime: 95, throughput: 100, description: "Best effort, lower cost" },
  { label: "High", uptime: 99, throughput: 250, description: "Production workloads" },
  { label: "Ultra", uptime: 99.9, throughput: 500, description: "Mission-critical" },
];

// Step configuration
const steps = [
  { id: 1, title: "Job Type", description: "Select compute type" },
  { id: 2, title: "SLA Config", description: "Performance targets" },
  { id: 3, title: "Parameters", description: "Configure job" },
  { id: 4, title: "Review", description: "Confirm deposit" },
];

// Step indicator component
function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: { id: number; title: string; description: string }[];
}) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  isCompleted && "bg-indicator-active text-bg-base",
                  isCurrent && "bg-indicator-active/20 border-2 border-indicator-active text-indicator-active",
                  !isCompleted && !isCurrent && "bg-bg-surface border border-hairline text-foreground-muted"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <div className="mt-2 text-center">
                <div className={cn("text-sm font-medium", isCurrent ? "text-foreground" : "text-foreground-muted")}>
                  {step.title}
                </div>
                <div className="text-xs text-foreground-muted hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "w-16 sm:w-24 h-px mx-2 transition-all duration-300",
                  step.id < currentStep ? "bg-indicator-active" : "bg-hairline"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Slider component with gradient track
function SliderWithLabels({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  formatValue,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (v: number) => string;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-foreground-muted">Min: {min}{unit}</span>
        <span className="font-mono-data text-indicator-active font-semibold">
          {formatValue ? formatValue(value) : value}{unit}
        </span>
        <span className="text-foreground-muted">Max: {max}{unit}</span>
      </div>
      <div className="relative h-2 bg-bg-base rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indicator-active to-indicator-stale rounded-full"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function NewJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobType: undefined,
      requiredUptime: 99,
      requiredThroughput: 100,
      deadlineHours: 24,
      checkpointInterval: 60,
      parameters: "",
      depositAmount: 0.01,
      agreeTerms: false,
    },
  });

  const watchedValues = watch();

  // Calculate estimated cost
  const estimatedCost = React.useMemo(() => {
    const baseCost = watchedValues.depositAmount || 0.01;
    const slaMultiplier = (watchedValues.requiredUptime || 99) / 95;
    const throughputMultiplier = (watchedValues.requiredThroughput || 100) / 50;
    return baseCost * slaMultiplier * throughputMultiplier;
  }, [watchedValues.depositAmount, watchedValues.requiredUptime, watchedValues.requiredThroughput]);

  const onSubmit = async (data: JobFormData) => {
    setShowConfirmDialog(false);
    const user = useAuthStore.getState().user;
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      // Transform form data to API request shape
      // requiredUptime is a percentage (e.g. 99), backend expects basis points (9900)
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + data.deadlineHours * 3600;

      const apiPayload = {
        clientId: user.id,
        requiredUptime: Math.round(data.requiredUptime * 100), // 99% → 9900 basis points
        requiredThroughput: data.requiredThroughput,
        deadlineTimestamp,
        workloadPayload: data.parameters
          ? new TextEncoder().encode(data.parameters)
          : new TextEncoder().encode("{}"),
        isServerless: true,
      };

      // Call backend API
      const res = await fetch("/api/v1/jobs/serverless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) {
        throw new Error(`Job submission failed: ${res.statusText}`);
      }

      const apiResult: {
        jobId: string;
        status: string;
        assignedNode: string;
        checkpointRef?: string;
        estimatedRate: string;
        createdAt: number;
      } = await res.json();

      // Also persist to Supabase for long-term record
      await jobsApi.create({
        job_id_256: apiResult.jobId,
        user_id: user.id,
        node_id: apiResult.assignedNode || null,
        status: "pending",
        job_type: data.jobType,
        input_payload: data.parameters ? JSON.parse(data.parameters) : {},
        output_payload: null,
        estimated_duration_minutes: data.deadlineHours * 60,
        actual_duration_minutes: null,
        checkpoint_url: apiResult.checkpointRef || null,
        sla_uptime_required: Math.round(data.requiredUptime * 100),
        sla_throughput_required: data.requiredThroughput,
        deadline: new Date(deadlineTimestamp * 1000).toISOString(),
        budget_usd: data.depositAmount,
        price_charged_usd: null,
        paid_at: null,
        completed_at: null,
      });

      router.push(`/dashboard/jobs/${apiResult.jobId}`);
    } catch (err) {
      console.error("Job submission failed:", err);
      // Error is shown via form — no manual state reset needed; react-hook-form resets on next submit
    }
  };

  const goToNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!watchedValues.jobType;
      case 2:
        return watchedValues.requiredUptime >= 90 && watchedValues.requiredThroughput >= 10;
      case 3:
        return true;
      case 4:
        return watchedValues.agreeTerms;
      default:
        return true;
    }
  };

  const goToPreview = () => {
    const encoded = btoa(JSON.stringify(watchedValues));
    router.push(`/dashboard/jobs/new/preview?job=${encoded}`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <PageHeader
        title="Submit New Job"
        description="Configure and submit a GPU compute job to the network"
      />

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={steps} />

      <form onSubmit={handleSubmit(() => setShowConfirmDialog(true))}>
        {/* Step 1: Job Type Selection */}
        {currentStep === 1 && (
          <Card className="bg-bg-surface/80">
            <CardHeader>
              <CardTitle>Select Job Type</CardTitle>
              <CardDescription>
                Choose the type of compute workload you want to run
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                name="jobType"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-4 md:grid-cols-3">
                    {jobTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => field.onChange(type.id)}
                        className={cn(
                          "relative p-6 rounded-lg border text-left transition-all duration-200",
                          field.value === type.id
                            ? `border-${type.color}/50 bg-${type.color}/10 shadow-lg`
                            : "border-hairline hover:border-zinc-700 bg-bg-base"
                        )}
                      >
                        {field.value === type.id && (
                          <div className={cn("absolute top-3 right-3", `text-${type.color}`)}>
                            <Check className="h-5 w-5" />
                          </div>
                        )}
                        <div className={cn("mb-4", `text-${type.color}`)}>{type.icon}</div>
                        <h3 className="font-semibold text-foreground mb-1">{type.title}</h3>
                        <p className="text-sm text-foreground-muted">{type.description}</p>
                        <div className="mt-4 pt-4 border-t border-hairline">
                          <span className="text-xs text-foreground-muted">Min deposit: </span>
                          <span className="text-xs font-mono-data text-indicator-active">
                            ~{type.deposit} ETH
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.jobType && (
                <p className="text-sm text-indicator-slashed">{errors.jobType.message}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: SLA Configuration */}
        {currentStep === 2 && (
          <Card className="bg-bg-surface/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-indicator-stale" />
                SLA Configuration
              </CardTitle>
              <CardDescription>
                Define performance targets for your job execution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SLA Presets */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Quick Presets
                </label>
                <div className="flex gap-2">
                  {slaPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setValue("requiredUptime", preset.uptime);
                        setValue("requiredThroughput", preset.throughput);
                      }}
                      className="flex-1 p-3 rounded-lg border border-hairline hover:border-indicator-active/50 bg-bg-base transition-colors"
                    >
                      <div className="font-medium text-sm text-foreground">{preset.label}</div>
                      <div className="text-xs text-foreground-muted">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Uptime Slider */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Required Uptime (%)
                </label>
                <Controller
                  name="requiredUptime"
                  control={control}
                  render={({ field }) => (
                    <SliderWithLabels
                      value={field.value}
                      onChange={field.onChange}
                      min={90}
                      max={100}
                      step={0.1}
                      unit="%"
                      formatValue={(v) => v.toFixed(1)}
                    />
                  )}
                />
              </div>

              {/* Throughput Slider */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Required Throughput (ops/sec)
                </label>
                <Controller
                  name="requiredThroughput"
                  control={control}
                  render={({ field }) => (
                    <SliderWithLabels
                      value={field.value}
                      onChange={field.onChange}
                      min={10}
                      max={1000}
                      step={10}
                      unit=" ops/s"
                    />
                  )}
                />
              </div>

              {/* Deadline and Checkpoint */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Deadline (hours)
                  </label>
                  <Controller
                    name="deadlineHours"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={168}
                        {...field}
                        className="font-mono-data"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Checkpoint Interval (sec)
                  </label>
                  <Controller
                    name="checkpointInterval"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={30}
                        max={300}
                        step={30}
                        {...field}
                        className="font-mono-data"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Parameters */}
        {currentStep === 3 && (
          <Card className="bg-bg-surface/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-indicator-stale" />
                Job Parameters
              </CardTitle>
              <CardDescription>
                Configure your workload parameters and input data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-hairline rounded-lg p-8 text-center hover:border-zinc-700 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 text-foreground-muted mx-auto mb-4" />
                <div className="font-medium text-foreground mb-1">
                  Drop files here or click to upload
                </div>
                <div className="text-sm text-foreground-muted">
                  Training data, model weights, batch inputs
                </div>
                <input type="file" className="hidden" multiple />
              </div>

              {/* Parameters JSON */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Parameters (JSON)
                </label>
                <Controller
                  name="parameters"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder='{"batch_size": 32, "learning_rate": 0.001, "epochs": 100}'
                      className="w-full h-32 p-3 rounded-lg border border-hairline bg-bg-base text-sm font-mono-data placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-indicator-active/50"
                    />
                  )}
                />
              </div>

              {/* Node Preference */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Node Preference
                </label>
                <div className="flex gap-2">
                  {["Any", "High Reputation", "Specific GPU"].map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      className="flex-1 p-3 rounded-lg border border-hairline hover:border-indicator-active/50 bg-bg-base text-sm transition-colors"
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Confirm */}
        {currentStep === 4 && (
          <Card className="bg-bg-surface/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indicator-active" />
                Review & Confirm
              </CardTitle>
              <CardDescription>
                Review your job configuration and deposit funds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-hairline">
                    <span className="text-foreground-muted">Job Type</span>
                    <span className="font-medium text-foreground">
                      {jobTypes.find((t) => t.id === watchedValues.jobType)?.title || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-hairline">
                    <span className="text-foreground-muted">Required Uptime</span>
                    <span className="font-mono-data text-indicator-active">
                      {watchedValues.requiredUptime?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-hairline">
                    <span className="text-foreground-muted">Required Throughput</span>
                    <span className="font-mono-data text-indicator-active">
                      {watchedValues.requiredThroughput} ops/s
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-hairline">
                    <span className="text-foreground-muted">Deadline</span>
                    <span className="font-mono-data text-foreground">
                      {watchedValues.deadlineHours}h
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-hairline">
                    <span className="text-foreground-muted">Checkpoint Interval</span>
                    <span className="font-mono-data text-foreground">
                      {watchedValues.checkpointInterval}s
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-hairline">
                    <span className="text-foreground-muted">Est. Cost</span>
                    <span className="font-mono-data text-indicator-active font-semibold">
                      ~${estimatedCost.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-hairline">
                    <span className="text-foreground-muted">Min. Deposit</span>
                    <span className="font-mono-data text-foreground">
                      {watchedValues.depositAmount} ETH
                    </span>
                  </div>
                </div>
              </div>

              {/* SLA Warning */}
              <div className="p-4 rounded-lg bg-indicator-stale/10 border border-indicator-stale/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-indicator-stale shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-indicator-stale mb-1">
                      SLA Enforcement Notice
                    </div>
                    <div className="text-sm text-foreground-muted">
                      If benchmarks are not met, automatic slashing will occur. 10% of your
                      deposit may be deducted, with 70% credited back to your account.
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <Controller
                name="agreeTerms"
                control={control}
                render={({ field }) => (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1 h-4 w-4 rounded border-border-hairline bg-bg-base text-indicator-active focus:ring-indicator-active/50"
                    />
                    <span className="text-sm text-foreground-muted">
                      I agree to the{" "}
                      <a href="/terms" className="text-indicator-active hover:underline">
                        SLA terms
                      </a>{" "}
                      and understand that missed benchmarks will result in automatic slashing.
                    </span>
                  </label>
                )}
              />
              {errors.agreeTerms && (
                <p className="text-sm text-indicator-slashed">{errors.agreeTerms.message}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={goToPrev}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={goToNext}
                disabled={!canProceed()}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goToPreview}
                disabled={!canProceed() || isSubmitting}
              >
                Review & Confirm
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent onClose={() => setShowConfirmDialog(false)}>
          <DialogHeader>
            <DialogTitle>Confirm Job Submission</DialogTitle>
            <DialogDescription>
              You are about to submit a job with the following configuration.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-3 py-4">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Job Type</span>
                <span className="font-medium text-foreground">
                  {jobTypes.find((t) => t.id === watchedValues.jobType)?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">SLA Uptime</span>
                <span className="font-mono-data text-indicator-active">
                  {watchedValues.requiredUptime?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Throughput</span>
                <span className="font-mono-data text-indicator-active">
                  {watchedValues.requiredThroughput} ops/s
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-hairline">
                <span className="font-medium text-foreground">Deposit Required</span>
                <span className="font-mono-data text-indicator-active font-semibold">
                  {watchedValues.depositAmount} ETH
                </span>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Submission"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}