// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
export const API_TIMEOUT = 30000;

// WebSocket Configuration
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
export const WS_RECONNECT_DELAY = 5000;
export const WS_MAX_RECONNECT_ATTEMPTS = 10;

// Heartbeat Configuration
export const HEARTBEAT_INTERVAL = 30000; // 30 seconds
export const HEARTBEAT_STALE_THRESHOLD = 60000; // 60 seconds

// SLA Thresholds
export const SLA_MIN_UPTIME = 90;
export const SLA_DEFAULT_UPTIME = 95;
export const SLA_MAX_UPTIME = 100;

export const SLA_MIN_THROUGHPUT = 10;
export const SLA_DEFAULT_THROUGHPUT = 100;
export const SLA_MAX_THROUGHPUT = 1000;

// Staking Configuration
export const STAKE_MIN_AMOUNT = 10; // ETH
export const STAKE_UNSTAKE_COOLDOWN = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

// Reputation Tiers
export const REPUTATION_GOLD_THRESHOLD = 100;
export const REPUTATION_SILVER_THRESHOLD = 50;
export const REPUTATION_BRONZE_THRESHOLD = 0;

// Slashing Configuration
export const SLASH_PERCENT = 10; // 10% of job value
export const CREDIT_PERCENT = 70; // 70% of slashed amount credited to client

// Job Configuration
export const JOB_CHECKPOINT_INTERVAL = 300; // 5 minutes
export const JOB_MAX_RETRIES = 3;
export const JOB_DEFAULT_DEADLINE = 24 * 60 * 60 * 1000; // 24 hours in ms

// Pagination
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

// Cache Configuration
export const CACHE_STALE_TIME = 10000; // 10 seconds
export const CACHE_REFETCH_INTERVAL = 30000; // 30 seconds

// Node Status
export type NodeStatus = "online" | "offline" | "stale" | "slashed";

// Job Status
export type JobStatus = "pending" | "running" | "completed" | "failed" | "requeued";

// Transaction Types
export type TransactionType = "stake_added" | "stake_removed" | "job_payment" | "slashing" | "reward";

// Reputation Tiers
export type ReputationTier = "gold" | "silver" | "bronze" | "unranked";

// Regions
export const REGIONS = [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
  "ap-northeast-1",
] as const;

// Supported Chains
export const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum Mainnet", icon: "eth" },
  { id: 11155111, name: "Sepolia Testnet", icon: "eth" },
  { id: 31337, name: "Hardhat Local", icon: "hardhat" },
] as const;

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: true,
  ENABLE_ADMIN_PANEL: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_WEB3: true,
} as const;
