# Tentrist Architecture

## System Overview

Tentrist connects AI SaaS companies to decentralized GPU pools with cryptographic SLA guarantees. The system has four layers:

1. **Frontend** — Next.js dashboard for clients and node operators
2. **API Backend** — Go service handling job routing, node management, wallet operations
3. **Smart Contracts** — Solidity contracts on EVM for escrow, SLA, and slashing
4. **Telemetry** — Go service monitoring node health via 30-second heartbeats

---

## Frontend Architecture (`apps/web/`)

### Route Groups

| Group | Path | Auth | Layout |
|-------|------|------|--------|
| `(auth)` | `/login`, `/signup` | Optional | Minimal |
| `(dashboard)` | `/dashboard`, `/jobs/*`, `/nodes/*`, `/billing/*`, `/admin/*` | Required | Sidebar |
| `(marketing)` | `/`, `/features`, `/pricing`, `/explore/*`, `/docs/*` | None | Navbar + Footer |

### Data Fetching Pattern

```
Component → Hook → lib/supabase.ts (reads)
                        ↓
              Supabase PostgreSQL (real-time)

Component → Mutation → Go Backend API (writes)
                              ↓
                    Smart Contracts + DB
```

### Key Hooks

- **`useJobs()`** — Polls `jobs` table every 60s, stale 30s
- **`useJob(id)`** — Detail view, polls every 15s
- **`useStreamingLogs(jobId)`** — Supabase Realtime channel on `job_logs` table
- **`useNodes()`** — All registered GPU nodes
- **`useNetworkStats()`** — Aggregate counts (online/stale/offline/slashed)
- **`useWalletTransactions()`** — `transactions` table for billing history
- **`useBillingSummary()`** — Derived from wallet hooks
- **`useEscrowPositions()`** — Active stakes from `escrow_positions`

### Auth Flow

1. User clicks "Sign in" → Supabase OAuth (GitHub/Google/Discord)
2. Supabase sets `@supabase/ssr` cookie
3. `SupabaseAuthProvider` hydrates session on app load
4. `getCurrentUser()` from `auth-store.ts` used in React Query `queryFn` callbacks

### Web3 Flow

1. RainbowKit `ConnectButton` triggers wallet connection
2. Wagmi connects to `hardhat` chain (local) via `http://127.0.0.1:8545`
3. `useReadContract` reads Escrow contract for real-time stake balance on dashboard
4. Wallet address stored in `profiles.wallet_address` after signing challenge

---

## Backend Architecture (`backend/`)

### API Routes

All routes under `/api/v1/`:

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/jobs/serverless` | `job.go` | Submit compute job |
| GET | `/jobs/:id` | `job.go` | Get job status |
| POST | `/jobs/:id/cancel` | `job.go` | Cancel job |
| POST | `/nodes/register` | `node.go` | Register GPU node |
| GET | `/nodes/:id` | `node.go` | Get node status |
| POST | `/nodes/:id/stake` | `node.go` | Stake collateral |
| POST | `/wallet/topup` | `wallet.go` | Add funds |
| POST | `/escrow/stake` | `wallet.go` | Stake in escrow |
| POST | `/escrow/unstake` | `wallet.go` | Unstake |
| GET | `/auth/wallet/challenge` | `auth.go` | Get wallet challenge |
| POST | `/auth/wallet/verify` | `auth.go` | Verify wallet link |

### Storage Strategy

- **Primary:** PostgreSQL via `pgxpool`
- **Secondary:** In-memory `sync.RWMutex` maps (dev fallback)
- **Dual-write:** All writes attempt PostgreSQL first; in-memory is fallback
- **On-chain:** Smart contract calls for financial operations (stake/unstake/slash)

### Concurrency Model

- Go handlers use `sync.RWMutex` for concurrent read/write to in-memory maps
- PostgreSQL connection pool (`pgxpool`) for DB access
- Heartbeat telemetry uses goroutines with 30-second ticker

---

## Smart Contracts (`contracts/`)

### Escrow.sol
- Nodes deposit collateral via `stake()`
- Customers fund job escrow via `depositForJob()`
- Withdrawal on job completion via `withdraw()`
- Only `SlashManager` can call `slash()` (access control)

### SLAContract.sol
- Records per-job SLA benchmarks: uptime %, throughput, deadline
- `recordJobStart()` called when job assigned
- `recordHeartbeat()` called on each pulse
- `checkBreach()` returns bool — called by SlashManager

### SlashManager.sol
- Called by heartbeat telemetry on breach detection
- Calculates penalty: `SLASH_PERCENT` (default 10%) of job value
- Distributes: 70% to customer `slaCredits`, 30% to protocol treasury
- Only authorized caller (telemetry service) can invoke

### ReputationLedger.sol
- Tracks per-node reputation score
- Increments on successful job completion
- Decrements on SLA breach or missed heartbeat
- Decay mechanism over time for inactive nodes

---

## Database Schema (Supabase PostgreSQL)

```
profiles
  ├── id (uuid, PK)
  ├── email
  ├── display_name
  ├── avatar_url
  └── wallet_address

jobs
  ├── id (uuid, PK)
  ├── job_id_256 (unique)
  ├── user_id (FK profiles)
  ├── node_id (FK nodes, nullable)
  ├── status (pending/running/completed/failed)
  ├── job_type
  ├── sla_uptime_required
  ├── sla_throughput_required
  ├── budget_usd / price_charged_usd
  └── checkpoint_url

nodes
  ├── id (uuid, PK)
  ├── wallet_address
  ├── display_name
  ├── gpu_model / vram_total_mb
  ├── status (online/offline/busy/maintenance)
  ├── reputation_score
  ├── stake_amount (migration 004)
  └── vram_used_mb / uptime_seconds (migration 004)

transactions
  ├── id (uuid, PK)
  ├── user_id (FK profiles)
  ├── type (job_payment/slashing/reward/stake_added...)
  ├── amount_usd
  ├── job_id (FK jobs, nullable)
  └── tx_hash

escrow_positions
  ├── id (uuid, PK)
  ├── user_id (FK profiles)
  ├── node_id (FK nodes, nullable)
  └── amount_eth

sla_credits
  ├── id (uuid, PK)
  ├── user_id (FK profiles)
  ├── job_id (FK jobs)
  ├── breach_type (uptime/throughput/deadline)
  └── credit_amount_eth

invoices
  ├── id (uuid, PK)
  ├── user_id (FK profiles)
  ├── period / amount_eth / status
  └── jobs_count

node_heartbeats
  ├── id (uuid, PK)
  ├── node_id (FK nodes)
  ├── vram_used_mb / vram_total_mb
  └── packet_latency_ms

job_logs
  ├── id (uuid, PK)
  ├── job_id (FK jobs)
  ├── level (info/warn/error)
  └── message
```

---

## Performance Design

### Frontend
- Marketing pages: `revalidate = 3600` (ISR, 1-hour cache)
- Dashboard pages: Dynamic (auth-gated, per-request)
- React Query: stale 30s, polling intervals reduced from defaults
- Images: AVIF/WebP with 30-day cache
- Fonts: Variable fonts, `display: swap`

### Backend
- Go `pgxpool` connection pooling
- In-memory cache for hot paths (node list, job status)
- Goroutine-per-heartbeat, no thread-per-request blocking

---

## Security Model

- **Auth:** Supabase JWT + OAuth; service role key server-side only
- **Wallet linking:** Nonce + signed message challenge, verified on backend
- **Smart contracts:** Reentrancy guards, only-authorized caller modifiers
- **CORS:** Backend only allows `localhost:3000` in dev
- **Headers:** Security headers in `middleware.ts` (X-Frame-Options, CSP, etc.)
