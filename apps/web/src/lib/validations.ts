import * as z from "zod";

// Job submission validation
export const jobTypeSchema = z.enum([
  "llm_finetuning",
  "batch_processing",
  "image_rendering",
  "data_processing",
  "custom",
]);

export const submitJobSchema = z.object({
  type: jobTypeSchema,
  sla: z.object({
    requiredUptime: z.number().min(90).max(100),
    requiredThroughput: z.number().min(1).max(1000),
    deadline: z.number().positive(),
  }),
  workload: z.object({
    inputData: z.string().optional(),
    parameters: z.record(z.string(), z.any()).optional(),
    checkpointInterval: z.number().min(60).max(3600).default(300),
    nodePreference: z.enum(["any", "high_reputation", "specific"]).default("any"),
  }),
});

export type SubmitJobInput = z.infer<typeof submitJobSchema>;

// Node registration validation
export const registerNodeSchema = z.object({
  nodeName: z.string().min(3).max(50),
  region: z.string().min(1),
  hardware: z.object({
    cpuModel: z.string().min(1),
    cpuCores: z.number().int().positive(),
    vramTotal: z.number().positive(),
  }),
  stakeAmount: z.number().min(10),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

export type RegisterNodeInput = z.infer<typeof registerNodeSchema>;

// Stake validation
export const stakeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  maxStake: z.number().optional(),
});

export const unstakeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currentStake: z.number().positive(),
  minStake: z.number().default(10),
  hasActiveJobs: z.boolean().default(false),
});

export type StakeInput = z.infer<typeof stakeSchema>;
export type UnstakeInput = z.infer<typeof unstakeSchema>;

// API key validation
export const createApiKeySchema = z.object({
  name: z.string().min(3).max(50),
  permissions: z.array(z.enum(["jobs:read", "jobs:write", "nodes:read", "nodes:write"])),
  expiresIn: z.number().min(1).max(365).optional(), // days
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

// User settings validation
export const updateSettingsSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(),
  defaultSla: z.object({
    requiredUptime: z.number().min(90).max(100).optional(),
    requiredThroughput: z.number().min(1).max(1000).optional(),
  }).optional(),
  notifications: z.object({
    jobCompleted: z.boolean().default(true),
    jobFailed: z.boolean().default(true),
    slaBreached: z.boolean().default(true),
    nodeOffline: z.boolean().default(true),
    slashEvent: z.boolean().default(true),
    weeklyReport: z.boolean().default(false),
  }).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

// Notification settings validation
export const notificationSettingsSchema = z.object({
  email: z.boolean().default(true),
  browser: z.boolean().default(true),
  jobCompleted: z.boolean().default(true),
  jobFailed: z.boolean().default(true),
  slaBreached: z.boolean().default(true),
  nodeOffline: z.boolean().default(true),
  slashEvent: z.boolean().default(true),
  weeklyReport: z.boolean().default(false),
});

export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;

// Team member validation
export const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "billing"]),
});

export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;

// Validation helpers
export function validateStakeAmount(amount: number, max: number): string | null {
  if (amount <= 0) return "Amount must be greater than 0";
  if (amount > max) return `Amount cannot exceed ${max} ETH`;
  return null;
}

export function validateUnstakeAmount(
  amount: number,
  currentStake: number,
  minStake: number = 10
): string | null {
  if (amount <= 0) return "Amount must be greater than 0";
  if (amount > currentStake) return "Cannot unstake more than current stake";
  if (currentStake - amount < minStake) {
    return `Must maintain minimum stake of ${minStake} ETH`;
  }
  return null;
}

export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
