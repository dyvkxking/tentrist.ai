# Project: Tentrist — Decentralized SLA-Enforced GPU Orchestration Protocol

## Overview

Tentrist is a B2B SaaS middleware and orchestration layer that sits on top of decentralized computing hardware networks (DePIN). It bridges the reliability gap between AI SaaS companies and decentralized GPU pools by utilizing blockchain smart contracts for trustless node staking, real-time performance monitoring, automated cryptographic slashing, and instantaneous job re-routing.

**Core Value Proposition:** B2B clients access decentralized GPU markets at rates up to 70% cheaper than legacy cloud providers, with enterprise-grade SLAs enforced automatically on-chain.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js |
| **Telemetry / Heartbeat Monitor** | Go or Rust |
| **Smart Contracts** | Solidity (EVM) |
| **API Layer** | Go/Rust backend services |
| **Blockchain** | EVM-compatible chain (for smart contract execution) |

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
│                     Next.js Frontend                             │
│        (dashboard, job monitoring, node management)              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway / Go Backend                       │
│         (job ingestion, workload orchestration, routing)          │
└───────────┬─────────────────────────────────────┬───────────────┘
            │                                     │
            ▼                                     ▼
┌───────────────────────┐           ┌─────────────────────────────┐
│  Smart Contract Layer │           │   Heartbeat Telemetry (Go/Rust)
│  - Escrow/Staking     │           │   - 30-second pulse         │
│  - SLA Benchmarks     │           │   - VRAM utilization       │
│  - Slash & Reward     │           │   - Packet response times  │
│  - Reputation Scores  │           │   - Failure detection      │
└───────────────────────┘           └─────────────────────────────┘
            │                                     │
            └──────────────┬──────────────────────┘
                           │
                           ▼
            ┌─────────────────────────────────────┐
            │      Decentralized GPU Nodes        │
            │   (staked collateral, DePIN network)│
            └─────────────────────────────────────┘
```

---

## Key Concepts

### Node Staking & Escrow
- Compute nodes stake crypto/stablecoins as collateral into the platform's escrow smart contract
- Staked collateral makes nodes eligible for workload processing
- Slashing penalties are deducted from staked collateral on failure

### Job Ingestion & SLA Recording
- Client submits compute tasks (LLM fine-tuning, batch image rendering, etc.) via API
- Upon ingestion, the API records SLA benchmarks on-chain:
  - Required uptime
  - Computational throughput
  - Deadlines

### Workload Splitting
- Middleware splits workloads across eligible, staked nodes
- Checkpointing enables job migration if a node fails

### Heartbeat Telemetry (30-second intervals)
- Low-latency monitoring service
- Tracks: VRAM utilization, packet response times, node health
- Flags failures to smart contract immediately on detection

### On-Chain Slashing & Rewards
- **Success:** Telemetry signs off → smart contract transfers payment to node → reputation score incremented
- **Failure:** Network blackout or dropped frames → heartbeat flags failure → smart contract executes slashing → job re-routed to standby node → slashed funds credited to customer's SaaS balance

### Financial SLA Guarantee
- 100% financial guarantee of performance via immutable on-chain enforcement
- No manual customer support refunds — discounts applied instantly on-chain

---

## Directory Structure (Planned)

```
tentrist.ai/
├── contracts/                    # Solidity smart contracts
│   ├── Escrow.sol               # Staking escrow contract
│   ├── SLAContract.sol          # SLA benchmark & tracking
│   ├── SlashManager.sol         # Penalty execution
│   └── ReputationLedger.sol     # Node reputation scores
│
├── frontend/                     # Next.js application
│   ├── app/                     # Next.js App Router
│   ├── components/              # React components
│   ├── pages/                   # Pages (if using Pages Router)
│   └── lib/                     # Utilities, API clients
│
├── telemetry/                    # Go/Rust heartbeat monitor
│   ├── heartbeat/               # Main telemetry service
│   ├── metrics/                 # VRAM, latency collectors
│   └── detector/                # Failure detection logic
│
├── backend/                      # Go/Rust API services
│   ├── api/                     # REST API handlers
│   ├── orchestrator/            # Workload splitting & routing
│   └── checkpoint/              # Job checkpoint management
│
├── docs/                         # Documentation
│   └── V1_CHECKLIST.md          # Development checklist
│
├── CLAUDE.md                    # This file
└── README.md
```

---

## Workflows

### 1. Node Onboarding
1. Node operator stakes collateral into Escrow smart contract
2. Node registers with platform and becomes eligible for workloads
3. Reputation score initialized at 0

### 2. Job Submission
1. AI SaaS client submits compute task via API
2. API records SLA benchmarks (uptime, throughput, deadline) on smart contract
3. Orchestrator splits workload across eligible nodes
4. Nodes begin processing

### 3. Successful Job Completion
1. Heartbeat telemetry monitors node every 30 seconds
2. Node completes task successfully
3. Telemetry service signs off on execution validity
4. Smart contract transfers payment to node address
5. Node's reputation score incremented

### 4. Node Failure & Recovery
1. Node experiences blackout or drops frames
2. Heartbeat telemetry detects failure, flags smart contract immediately
3. Orchestrator shifts last saved checkpoint to healthy standby node
4. Smart contract executes on-chain slashing (confiscates % of node's collateral)
5. Major portion of slashed funds credited to customer's SaaS balance
6. Failed node reputation score decreased

---

## Global Preferences

### Architecture Decisions
- **Always** use on-chain verification for financial transactions (payments, slashing)
- **Always** implement checkpointing for long-running compute jobs
- **Always** design for 30-second heartbeat intervals as the minimum monitoring frequency

### Code Standards
- Smart contracts must follow Solidity best practices (effects-interactions pattern, reentrancy guards)
- Go/Rust telemetry must be low-latency and fault-tolerant
- Frontend must support real-time job status updates via WebSocket or SSE

### Key Files to Create
- [ ] `contracts/Escrow.sol` — staking collateral management
- [ ] `contracts/SLAContract.sol` — SLA benchmark recording
- [ ] `contracts/SlashManager.sol` — automated penalty execution
- [ ] `contracts/ReputationLedger.sol` — node reputation tracking
- [ ] `telemetry/heartbeat/main.go` — main telemetry service
- [ ] `telemetry/detector/failure.go` — failure detection logic
- [ ] `backend/orchestrator/splitter.go` — workload splitting
- [ ] `frontend/app/dashboard/` — job monitoring UI

---

## V1 Checklist

When features are completed, check them off in `@docs/V1_CHECKLIST.md`.

---

## References

- Product Spec: See top of this file
- Smart Contract Security: Follow Solidity security best practices (OpenZeppelin patterns)
- DePIN Networks: Understand staking economic models before designing collateral requirements