# Tentrist — DePIN GPU Orchestration Protocol

## What This Project Is

Tentrist is a **B2B SaaS middleware** and **orchestration layer** sitting on top of decentralized computing hardware networks (DePIN). It bridges the reliability gap between AI SaaS companies and decentralized GPU pools by using blockchain smart contracts for:

- **Trustless node staking** — Nodes stake collateral as a performance bond
- **Real-time performance monitoring** — 30-second heartbeat intervals
- **Automated cryptographic slashing** — Penalties executed by smart contracts, not humans
- **Instantaneous job re-routing** — Failed nodes don't block workloads

**Core value prop:** B2B clients access decentralized GPU markets at rates up to **70% cheaper** than legacy cloud, with enterprise-grade SLAs enforced automatically on-chain. No manual refunds.

---

## Tech Stack

| Layer | Technology | Location |
|-------|-----------|----------|
| **Frontend** | Next.js 16 (App Router, Turbopack) | `apps/web/` |
| **Styling** | Tailwind CSS + custom design tokens | `apps/web/tailwind.config.ts` |
| **Auth** | Supabase Auth (`@supabase/ssr`) | `apps/web/src/components/providers/` |
| **Database** | Supabase (PostgreSQL) | via `lib/supabase.ts` |
| **Web3** | Wagmi v2 + RainbowKit + viem | `apps/web/src/components/providers/web3-providers.tsx` |
| **State** | TanStack Query v5 (React Query) | `apps/web/src/hooks/` |
| **Backend** | Go + pgxpool | `backend/` |
| **Smart Contracts** | Solidity (Hardhat) | `contracts/` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI SaaS Client                              │
│            (submits compute jobs via API)                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS/REST
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Next.js Frontend (Port 3000)                    │
│    (dashboard, job monitoring, node management, billing)         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────────────┐   ┌─────────────────────────────────┐
│  Supabase PostgreSQL    │   │    Go Backend API (Port 8080)   │
│  (reads + realtime)     │   │  (writes: jobs, nodes, wallet)  │
└─────────────────────────┘   └──────────────┬──────────────────┘
                                             │
                          ┌──────────────────┴──────────────────┐
                          ▼                                     ▼
          ┌───────────────────────────┐      ┌─────────────────────────────┐
          │  Smart Contract Layer      │      │  Heartbeat Telemetry (Go)   │
          │  Escrow / SLA / Slash      │      │  30s pulse, VRAM, latency   │
          └───────────────────────────┘      └─────────────────────────────┘
                          │                                     │
                          └──────────────────┬──────────────────┘
                                             │
                          ┌──────────────────▼──────────────────┐
                          │      Decentralized GPU Nodes          │
                          │   (staked collateral, DePIN network) │
                          └──────────────────────────────────────┘
```

---

## Directory Structure

```
tentrist.ai/
├── apps/
│   └── web/                    # Next.js 16 frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/     # Login, signup, auth callback
│       │   │   ├── (dashboard)/# Authenticated routes (jobs, nodes, billing...)
│       │   │   ├── (marketing)/# Public routes (landing, features, pricing, docs, explore)
│       │   │   ├── api/        # Next.js API routes (rarely used)
│       │   │   ├── layout.tsx   # Root layout + Providers
│       │   │   └── sitemap.ts  # SEO sitemap
│       │   ├── components/
│       │   │   ├── layout/     # Sidebar, MobileNav, DashboardLayout
│       │   │   ├── providers/  # SupabaseAuth, Web3, Theme
│       │   │   ├── shared/     # PageHeader, LiveIndicator
│       │   │   └── ui/        # MetricCard, StatusBadge, Card, Button, Badge...
│       │   ├── hooks/          # useJobs, useNodes, useBilling, useWallet...
│       │   ├── lib/            # supabase.ts, contracts.ts, utils.ts, middleware.ts
│       │   └── stores/         # auth-store.ts (getCurrentUser)
│       ├── e2e-tests.spec.ts   # Playwright E2E (20 tests, all passing)
│       └── next.config.ts
│
├── backend/                     # Go REST API server (port 8080)
│   ├── cmd/server/main.go       # Entry point, router setup
│   ├── internal/api/handlers/  # HTTP handlers (job.go, node.go, wallet.go...)
│   ├── internal/api/middleware/ # Auth, CORS, logging
│   ├── internal/types/         # Go type definitions
│   └── pkg/                    # Shared packages
│
├── contracts/                   # Solidity smart contracts
│   ├── contracts/              # .sol source files
│   ├── scripts/                # Hardhat deployment scripts
│   └── test/                   # Contract tests
│
├── supabase/
│   └── migrations/             # 001-003 SQL migration files
│
└── docs/                       # Documentation
```

---

## Key Abstractions

### Data Flow

**Rule: All database writes go through the Go backend API (`POST /api/v1/...`). All reads go through Supabase directly via typed hooks.**

```
Supabase (PostgreSQL + Auth + Realtime)
         ↓ (reads only)
  lib/supabase.ts → hooks/ → components

Go Backend API (localhost:8080)
         ↓ (writes)
  Next.js API calls (use mutations)
```

### Hooks Architecture

| Hook | Data Source | Purpose |
|------|-------------|---------|
| `useJobs()` | Supabase `jobs` table | List all jobs |
| `useJob(id)` | Supabase `jobs` table | Single job detail |
| `useStreamingLogs(jobId)` | Supabase Realtime `postgres_changes` | Live job logs |
| `useNodes()` | Supabase `nodes` table | List GPU nodes |
| `useNetworkStats()` | Supabase aggregate queries | Network-wide stats |
| `useWalletTransactions()` | Supabase `transactions` table | Billing tx history |
| `useEscrowPositions()` | Supabase `escrow_positions` table | Active stakes |
| `useBillingSummary()` | Derived from wallet hooks | Balance overview |
| `useInvoices()` | Supabase `invoices` table | Billing invoices |
| `useSLACredits()` | Supabase `sla_credits` table | SLA breach credits |
| `useWalletStats()` | Derived | Wallet balance, staked, rewards |

### Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (id, email, display_name, wallet_address) |
| `jobs` | Job records (status, sla benchmarks, pricing, node assignments) |
| `nodes` | GPU node registry (status, GPU model, VRAM, reputation score) |
| `api_keys` | User API keys (name, key_hash, key_prefix) |
| `transactions` | All financial events (job_payment, slashing, reward, stake_added...) |
| `escrow_positions` | Active staking positions (amount_eth, node_id) |
| `sla_credits` | SLA breach credit events (job_id, breach_type, credit_amount) |
| `invoices` | Monthly billing invoices |
| `node_heartbeats` | Node health pings (vram_used, packet_latency_ms) |
| `job_logs` | Job lifecycle events (level: info/warn/error) |
| `node_assignments` | Which node is running which job |

### Smart Contracts (in `lib/contracts.ts`)

| Contract | Purpose |
|----------|---------|
| `Escrow.sol` | Stake/unstake collateral, pay/receive funds |
| `SLAContract.sol` | Record SLA benchmarks per job |
| `SlashManager.sol` | Execute slashing on breach, distribute to customer |

---

## Design System

Defined in `.claude/rules/frontend-design.md` — **read this before modifying UI components**.

### Color Tokens (Tailwind)
```
bg-base           → #010102  (pitch black background)
bg-surface        → #0f1011  (card/panel background)
border-hairline   → #27272a  (subtle 1px borders)
indicator-active  → emerald-500 (online, success, active)
indicator-stale   → amber-500   (warning, stale, pending)
indicator-slashed → rose-500    (error, slashed, failed)
```

### Typography
- **UI titles/labels:** Geist Sans (CSS variable `--font-geist-sans`)
- **Data/numbers/addresses:** Geist Mono (CSS variable `--font-geist-mono`)

### Required Components (must use, not copy-paste primitives)
- `MetricCard` — Standardized container for metrics with glow effects
- `StatusBadge` — Enum map for serverless states (pending/running/completed/failed)
- `TelemetryTable` — Multi-tenant list (addresses left, numbers center, prices right)
- `LiveIndicator` — Pulsing dot for real-time status

---

## Environment Variables

### `apps/web/.env.local` (required)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server-side only
NEXT_PUBLIC_API_URL=http://localhost:8080       # Go backend
NEXT_PUBLIC_SITE_URL=https://tentrist.ai
NEXT_PUBLIC_CHAIN_ID=31337                      # Hardhat local dev
```

### `backend/.env` (required)
```bash
DATABASE_URL=postgres://user:pass@localhost:5432/tentrist
ESCROW_CONTRACT_ADDRESS=0x...
PORT=8080
CORS_ORIGIN=http://localhost:3000
SUPABASE_JWT_SECRET=eyJ...
```

---

## Running Locally

### 1. Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev        # Port 3000
npm run build     # Production build (must pass before commit)
```

### 2. Backend (Go)
```bash
cd backend
go build -o server.exe ./cmd/server
./server.exe      # Port 8080
```

### 3. Supabase CLI (local database)
```bash
cd supabase
npx supabase start     # Starts local Supabase on port 54322
npx supabase db reset # Reset + apply migrations
```

### 4. Run E2E Tests
```bash
cd apps/web
npx playwright test e2e-tests.spec.ts --reporter=list
# 20 tests — all must pass
```

---

## Code Conventions

1. **No `console.log`** — Use `useToast()` for UI feedback
2. **Wallet addresses are lowercase hex** — Always `address.toLowerCase()` before Supabase queries
3. **React Query is the only server state manager** — No Redux or Zustand for server data
4. **Providers wrap everything** — `SupabaseAuthProvider` + `Web3Providers` in root `layout.tsx`
5. **Marketing pages use route group `(marketing)`** — Shares layout, public
6. **Dashboard pages use route group `(dashboard)`** — Auth-gated, has sidebar
7. **Monetary values:** USD stored as `number`, ETH stored as `string` with wei precision
8. **Build must pass** — Run `npm run build` in `apps/web` before every commit

---

## Architecture Decisions

- **Supabase Realtime** replaces SSE for live job logs — uses `postgres_changes` subscription on `job_logs` table
- **Go backend is primary for writes** — Supabase for reads only (R+W split)
- **Escrow contract reads via wagmi** — `useReadContract` on dashboard for real-time stake balance
- **Hardhat chain only in local dev** — wagmi config uses `hardhat` chain with `http://127.0.0.1:8545`
- **Go backend uses in-memory maps** — Data survives restarts via PostgreSQL dual-write (best-effort)
- **Always use `useJobs`, `useNodes`, etc.** — Don't call `jobsApi.list()` directly in components

---

## Important File Reference

| File | Purpose |
|------|---------|
| `apps/web/src/lib/supabase.ts` | Typed API wrappers (jobsApi, nodesApi, profileApi, prefsApi) |
| `apps/web/src/lib/contracts.ts` | Escrow ABI + Hardhat contract addresses |
| `apps/web/src/lib/middleware.ts` | Security headers (X-Frame-Options, CSP, etc.) |
| `apps/web/src/stores/auth-store.ts` | `getCurrentUser()` helper for React Query |
| `apps/web/src/components/providers/web3-providers.tsx` | Wagmi config, RainbowKit theme |
| `apps/web/src/components/layout/sidebar.tsx` | Dashboard sidebar with Billing, Explore, Admin sub-nav |
| `apps/web/e2e-tests.spec.ts` | 20 Playwright tests covering all major flows |
