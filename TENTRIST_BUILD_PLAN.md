# Tentrist — Execution Build Plan & System Architecture Checklist

**Version:** 1.0  
**Date:** 2026-06-14  
**Status:** Architecture Blueprint — Implementation Pending

---

## Overview

This document defines the phased implementation plan for the Tentrist Decentralized SLA-Enforced GPU Orchestration Protocol. Each phase is gated by verification tests that must pass before proceeding to the next phase.

---

## Phase 1: Local Environment & Smart Contract Scaffolding

**Objective:** Establish local blockchain environment, scaffold all Solidity smart contracts, and implement core staking/escrow logic.

### 1.1 Project Initialization

- [ ] Create project root directory structure

```
tentrist.ai/
├── contracts/
│   ├── .gitkeep
├── scripts/
│   └── .gitkeep
├── test/
│   └── .gitkeep
├── frontend/
├── telemetry/
├── backend/
├── docs/
├── TENTRIST_BUILD_PLAN.md
└── CLAUDE.md
```

- [ ] Initialize Hardhat project
  ```bash
  cd contracts && npx hardhat init
  ```
- [ ] Install OpenZeppelin contracts
  ```bash
  cd contracts && npm install @openzeppelin/contracts
  ```
- [ ] Install Hardhat console for interactive testing
  ```bash
  npm install --save-dev @nomicfoundation/hardhat-console
  ```

**Verification:** `npx hardhat compile` completes without errors.

---

### 1.2 Escrow.sol — Collateral Staking Contract

**File:** `contracts/Escrow.sol`

- [ ] Create `IEscrow` interface with events and function signatures:
  - `event StakeDeposited(address indexed node, uint256 amount)`
  - `event StakeWithdrawn(address indexed node, uint256 amount)`
  - `function stake() external payable`
  - `function withdraw(uint256 amount) external`
  - `function getStake(address node) external view returns (uint256)`

- [ ] Create `Escrow` contract:
  - Inherit from `ReentrancyGuard`
  - Implement stake/withdraw with non-reentrant modifiers
  - Maintain `mapping(address => uint256) public stakeOf`
  - Add `onlyStaked` modifier for functions requiring minimum stake

- [ ] Add slasher access control:
  - `address public slasher;` — authorized slashing agent
  - `function authorizeSlasher(address _slasher) external onlyOwner`
  - `function slash(address node, uint256 amount) external onlySlasher returns (bool)`

**Verification:** `npx hardhat test test/Escrow.test.js`

---

### 1.3 SLAContract.sol — SLA Benchmark Recording

**File:** `contracts/SLAContract.sol`

- [ ] Create `ISLA` interface:
  - `event SLARecorded(bytes32 indexed jobId, uint256 uptime, uint256 throughput, uint256 deadline)`
  - `event SLAFulfilled(bytes32 indexed jobId, bool success)`

- [ ] Create `SLAContract` struct and enum:
  ```solidity
  struct SLABenchmark {
      uint256 requiredUptime;    // percentage * 100 (e.g., 9900 = 99%)
      uint256 requiredThroughput; // ops/second
      uint256 deadline;          // unix timestamp
      bool fulfilled;
  }
  ```

- [ ] Implement core functions:
  - `function recordSLA(bytes32 jobId, uint256 uptime, uint256 throughput, uint256 deadline) external`
  - `function getSLA(bytes32 jobId) external view returns (SLABenchmark memory)`
  - `function fulfillSLA(bytes32 jobId, bool success) external`

- [ ] Integrate Escrow reference:
  - `IEscrow public escrow;`
  - Constructor accepts `IEscrow _escrow`

**Verification:** `npx hardhat test test/SLAContract.test.js`

---

### 1.4 SlashManager.sol — Automated Penalty Execution

**File:** `contracts/SlashManager.sol`

- [ ] Create `ISlashManager` interface:
  - `event NodeSlashed(address indexed node, uint256 amount, bytes32 jobId)`
  - `event CreditIssued(address indexed client, uint256 amount, bytes32 jobId)`

- [ ] Create `SlashManager` contract:
  - `uint256 public constant SLASH_PERCENT = 1000;` // 10% basis points
  - `uint256 public constant CREDIT_PERCENT = 7000;` // 70% of slashed goes to client

- [ ] Implement slash sequence:
  - `function slashAndCredit(address node, address client, bytes32 jobId, uint256 jobValue) external onlyAuthorized`
  - Call `escrow.slash(node, slashAmount)`
  - Transfer `creditAmount` to client
  - Emit `NodeSlashed` and `CreditIssued` events

- [ ] Add authorization:
  - `modifier onlyHeartbeatOrOrchestrator()`
  - Restrict `slashAndCredit` to authorized callers

**Verification:** `npx hardhat test test/SlashManager.test.js`

---

### 1.5 ReputationLedger.sol — Node Reputation Tracking

**File:** `contracts/ReputationLedger.sol`

- [ ] Create `IReputationLedger` interface:
  - `event ReputationUpdated(address indexed node, int256 delta, uint256 newScore)`

- [ ] Create `ReputationLedger` contract:
  - `mapping(address => int256) public reputationScore;`
  - `mapping(address => uint256) public lastUpdate;`

- [ ] Implement reputation logic:
  - `function incrementReputation(address node, int256 delta) external onlyAuthorized`
  - `function decrementReputation(address node, int256 delta) external onlyAuthorized`
  - `function getReputation(address node) external view returns (int256)`

- [ ] Implement decay mechanism (optional future):
  - `function applyDecay(address node) external`

**Verification:** `npx hardhat test test/ReputationLedger.test.js`

---

### 1.6 Phase 1 Integration Test

- [ ] Deploy all contracts to Hardhat local network in correct order:
  1. Escrow → SLAContract → SlashManager → ReputationLedger
- [ ] Link contract dependencies (SLAContract needs Escrow address, etc.)
- [ ] Run full integration test:
  ```bash
  npx hardhat test test/Phase1Integration.test.js
  ```

**Verification:** All Phase 1 tests pass with `✓` before proceeding.

---

## Phase 2: Go Orchestration API & Heartbeat Telemetry

**Objective:** Build the Go backend API, workload orchestrator, and Rust/Go heartbeat telemetry service.

### 2.1 Go Backend Scaffolding

**Directory:** `backend/`

- [ ] Initialize Go module:
  ```bash
  cd backend && go mod init github.com/tentrist.ai/backend
  ```

- [ ] Create project structure:
```
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── api/
│   │   ├── handlers/
│   │   │   ├── job.go
│   │   │   └── node.go
│   │   ├── middleware/
│   │   │   └── auth.go
│   │   └── router.go
│   ├── orchestrator/
│   │   ├── splitter.go
│   │   ├── router.go
│   │   └── checkpoint.go
│   ├── contract/
│   │   ├── client.go
│   │   └── bindings/
│   └── config/
│       └── config.go
├── pkg/
│   └── types/
│       └── types.go
└── go.mod
```

- [ ] Install dependencies:
  ```bash
  go get github.com/ethereum/go-ethereum@latest
  go get github.com/gorilla/mux@latest
  go get github.com/gorilla/websocket@latest
  ```

**Verification:** `go build ./...` completes without errors.

---

### 2.2 Core Types (pkg/types/types.go)

- [ ] Define Go structs matching Solidity events:
  ```go
  type Job struct {
      ID              string
      ClientID        string
      SLA             SLABenchmark
      Status          JobStatus
      AssignedNodes   []string
      CheckpointRef   string
      CreatedAt       int64
      Deadline        int64
  }

  type SLABenchmark struct {
      RequiredUptime    uint64
      RequiredThroughput uint64
      Deadline          int64
  }

  type Node struct {
      Address         string
      StakeAmount     uint64
      Reputation      int64
      Status          NodeStatus
      LastHeartbeat   int64
  }

  type Heartbeat struct {
      NodeID          string
      VRAMUsed        uint64
      VRAMTotal       uint64
      PacketLatency   uint64 // ms
      Timestamp       int64
  }
  ```

- [ ] Define enums:
  ```go
  type JobStatus int
  const (
      JobPending   JobStatus = iota
      JobRunning
      JobCompleted
      JobFailed
      JobRequeued
  )

  type NodeStatus int
  const (
      NodeOffline NodeStatus = iota
      NodeOnline
      NodeStale
      NodeSlashed
  )
  ```

**Verification:** `go vet ./pkg/types/...`

---

### 2.3 Smart Contract Bindings (internal/contract/client.go)

- [ ] Generate Go bindings from compiled Solidity:
  ```bash
  abigen --abi=contracts/artifacts/Escrow.sol/Escrow.json --pkg=contracts --out=backend/internal/contract/escrow.go
  abigen --abi=contracts/artifacts/SLAContract.sol/SLAContract.json --pkg=contracts --out=backend/internal/contract/sla.go
  abigen --abi=contracts/artifacts/SlashManager.sol/SlashManager.json --pkg=contracts --out=backend/internal/contract/slash.go
  abigen --abi=contracts/artifacts/ReputationLedger.sol/ReputationLedger.json --pkg=contracts --out=backend/internal/contract/reputation.go
  ```

- [ ] Create `ContractClient` struct:
  ```go
  type ContractClient struct {
      escrow        *contracts.Escrow
      sla           *contracts.SLAContract
      slashManager  *contracts.SlashManager
      reputation    *contracts.ReputationLedger
      auth          *bind.CallOpts
  }
  ```

- [ ] Implement wrapper methods:
  - `SubmitJob(job Job) (tx *types.Transaction, err error)`
  - `RecordSLA(jobID string, uptime, throughput, deadline uint64) (tx *types.Transaction, err error)`
  - `SlashAndCredit(node, client string, jobID string, value uint64) (tx *types.Transaction, err error)`
  - `UpdateReputation(node string, delta int64) (tx *types.Transaction, err error)`

**Verification:** `go build ./internal/contract/...`

---

### 2.4 API Handlers (internal/api/handlers/)

**File:** `internal/api/handlers/job.go`

- [ ] `POST /api/v1/jobs` — Submit new compute job
  - Parse request body into `Job` struct
  - Call `orchestrator.SubmitJob()`
  - Return `jobId` and initial status
- [ ] `GET /api/v1/jobs/:id` — Get job status
- [ ] `GET /api/v1/jobs/:id/sla` — Get SLA benchmarks
- [ ] `POST /api/v1/jobs/:id/cancel` — Cancel job

**File:** `internal/api/handlers/node.go`

- [ ] `POST /api/v1/nodes/register` — Register new GPU node
- [ ] `GET /api/v1/nodes/:id` — Get node status and reputation
- [ ] `GET /api/v1/nodes/eligible` — List nodes meeting stake threshold
- [ ] `POST /api/v1/nodes/:id/stake` — Stake collateral (triggers on-chain tx)

**Verification:** `go test ./internal/api/... -v`

---

### 2.5 Orchestrator (internal/orchestrator/)

**File:** `internal/orchestrator/splitter.go`

- [ ] Create `WorkloadSplitter` struct:
  ```go
  type WorkloadSplitter struct {
      contractClient *ContractClient
      nodeRegistry   *NodeRegistry
  }
  ```

- [ ] Implement `SplitWorkload(job Job) ([]WorkUnit, error)`:
  - Query eligible nodes from registry
  - Partition job into `WorkUnit` slices based on node capacity
  - Return slice of work units for assignment

- [ ] Implement `AssignWorkUnit(unit WorkUnit, nodeID string) error`:
  - Call contract to record assignment on-chain
  - Update local job state

**File:** `internal/orchestrator/checkpoint.go`

- [ ] Create `CheckpointManager` struct:
  ```go
  type CheckpointManager struct {
      storage map[string]*Checkpoint
      mu      sync.RWMutex
  }
  ```

- [ ] Implement checkpoint lifecycle:
  - `SaveCheckpoint(jobID string, unit WorkUnit, state []byte) (string, error)`
  - `GetCheckpoint(ref string) (*Checkpoint, error)`
  - `GetLastCheckpoint(jobID string) (*Checkpoint, error)`
  - `ClearCheckpoints(jobID string) error`

**Verification:** `go test ./internal/orchestrator/... -v`

---

### 2.6 Heartbeat Telemetry Service (telemetry/)

**Directory:** `telemetry/`

- [ ] Initialize Rust or Go module:
  ```bash
  cd telemetry && cargo init --name heartbeat-telemetry
  # OR
  cd telemetry && go mod init github.com/tentrist.ai/telemetry
  ```

- [ ] Create project structure:
```
telemetry/
├── src/
│   ├── main.rs          # or main.go
│   ├── heartbeat/
│   │   ├── mod.rs       # or heartbeat.go
│   │   └── pulse.rs     # or pulse.go
│   ├── collector/
│   │   ├── mod.rs       # or collector.go
│   │   ├── vram.rs      # or vram.go
│   │   └── latency.rs   # or latency.go
│   ├── detector/
│   │   ├── mod.rs       # or detector.go
│   │   └── failure.rs   # or failure.go
│   └── reporter/
│       ├── mod.rs       # or reporter.go
│       └── client.rs    # or client.go
└── Cargo.toml           # or go.mod
```

**Verification:** `cargo build` or `go build ./...` completes.

---

### 2.7 Heartbeat Pulse (telemetry/src/heartbeat/)

- [ ] Define `Heartbeat` struct:
  ```rust
  // Rust
  pub struct Heartbeat {
      pub node_id: String,
      pub vram_used_mb: u64,
      pub vram_total_mb: u64,
      pub packet_latency_ms: u64,
      pub timestamp: i64,
  }
  ```

  ```go
  // Go
  type Heartbeat struct {
      NodeID          string
      VRAMUsedMB      uint64
      VRAMTotalMB     uint64
      PacketLatencyMs uint64
      Timestamp       int64
  }
  ```

- [ ] Implement `sendPulse()`:
  - Gather current metrics
  - POST to backend `/api/v1/telemetry/heartbeat`
  - Retry up to 3 times on failure
  - Log pulse every 30 seconds via interval ticker

**Verification:** Run service, confirm heartbeat POST every 30s:
```bash
go run src/main.go
# OR
cargo run
# Watch logs for "Heartbeat sent" every 30 seconds
```

---

### 2.8 Metric Collectors (telemetry/src/collector/)

**File:** `vram.go` / `vram.rs`

- [ ] Collect VRAM utilization via:
  - Linux: Read `/proc/gpuinfo` or `nvidia-smi --query-gpu=memory.used,memory.total --format=csv`
  - Cross-platform: Use `sys-info` crate or `github.com.com/mackerelio/go-osstat`

**File:** `latency.go` / `latency.rs`

- [ ] Measure packet latency:
  - TCP ping to known endpoints
  - Measure RTT in milliseconds

**Verification:**
```bash
go test ./src/collector/... -v
# OR
cargo test --lib
```

---

### 2.9 Failure Detector (telemetry/src/detector/)

- [ ] Define `FailureDetector` struct:
  ```go
  type FailureDetector struct {
      heartbeatInterval time.Duration
      staleThreshold    time.Duration // 2x heartbeat = 60s
      lastPulse         map[string]time.Time
  }
  ```

- [ ] Implement detection logic:
  - `CheckStaleNodes() []string` — returns node IDs with stale heartbeats
  - `DetectAnomalies(hb Heartbeat) bool` — VRAM > 95% or latency > 500ms
  - `FlagFailure(nodeID string, reason FailureReason) error` — calls SlashManager via contract client

- [ ] Failure reasons enum:
  ```go
  type FailureReason int
  const (
      ReasonHeartbeatStale FailureReason = iota
      ReasonVRAMExhausted
      ReasonLatencySpike
      ReasonNetworkBlackout
  )
  ```

**Verification:**
```bash
go test ./src/detector/... -v -run TestFailureDetector
# OR
cargo test detector
```

---

### 2.10 Phase 2 Integration Test

- [ ] Start Hardhat node with all Phase 1 contracts deployed
- [ ] Start backend API server
- [ ] Start telemetry service
- [ ] Register a test node, stake collateral on-chain
- [ ] Submit a test job
- [ ] Verify heartbeat pulses are received by API
- [ ] Simulate node failure, verify slashing triggered

**Verification:** `go test ./test/integration/... -v` (or equivalent Rust test)

---

## Phase 3: Integration & Failover Testing

**Objective:** End-to-end integration testing of the full system including failover scenarios.

### 3.1 Test Infrastructure

- [ ] Set up test network configuration in `hardhat.config.ts`:
  ```typescript
  networks: {
    hardhat: { chainId: 31337 },
    sepolia: { url: process.env.SEPOLIA_RPC, accounts: [process.env.PRIVATE_KEY] }
  }
  ```

- [ ] Create test helper utilities:
  - `contracts/test/helpers.ts` — contract deployment helpers
  - `backend/test/helpers.go` — API test fixtures
  - `telemetry/test/helpers.go` — mock node registration

- [ ] Set up test database (in-memory or SQLite for local):
  - Jobs table
  - Nodes table
  - Checkpoints table

**Verification:** `npm test` and `go test ./...` both pass.

---

### 3.2 Happy Path Integration Test

- [ ] Deploy all contracts to local Hardhat network
- [ ] Start backend API
- [ ] Start telemetry service
- [ ] Register 3 GPU nodes with stake
- [ ] Submit a compute job requiring all 3 nodes
- [ ] Verify workload is split across all 3 nodes
- [ ] All nodes send successful heartbeats for 5 minutes
- [ ] Verify job completes successfully
- [ ] Verify payment is transferred to nodes on-chain
- [ ] Verify reputation scores incremented

**Verification:**
```bash
npx hardhat test test/IntegrationHappyPath.test.js
# OR
go test ./test/integration/... -run TestHappyPath
```

---

### 3.3 Failover & Re-routing Test

- [ ] Submit a job split across 3 nodes
- [ ] Node 2 goes offline after 90 seconds (no heartbeat for 2+ intervals)
- [ ] Verify failure detector flags Node 2
- [ ] Verify orchestrator re-routes Node 2's work unit to Node 4
- [ ] Verify on-chain slashing is triggered for Node 2
- [ ] Verify slashed funds are credited to client
- [ ] Verify job completes successfully using replacement node
- [ ] Verify Node 2's reputation is decremented

**Verification:**
```bash
npx hardhat test test/IntegrationFailover.test.js
# OR
go test ./test/integration/... -run TestFailover
```

---

### 3.4 Partial Slashing Test

- [ ] Submit a job with 3 nodes
- [ ] Node 1 sends heartbeats but VRAM exceeds 95% threshold
- [ ] Verify anomaly detection triggers
- [ ] Verify partial slash (10% of stake) is executed
- [ ] Verify 70% of slashed amount credited to client
- [ ] Node 1 continues working with reduced reputation
- [ ] Job completes successfully

**Verification:**
```bash
npx hardhat test test/IntegrationPartialSlash.test.js
# OR
go test ./test/integration/... -run TestPartialSlash
```

---

### 3.5 SLA Breach Test

- [ ] Submit a job with strict deadline (e.g., 2 minutes)
- [ ] Node 1 processes slowly, misses throughput SLA
- [ ] After deadline, verify `SLA.fulfilled == false` on-chain
- [ ] Verify partial payment withheld
- [ ] Verify node reputation decremented

**Verification:**
```bash
npx hardhat test test/IntegrationSLABreach.test.js
```

---

### 3.6 Load Test

- [ ] Submit 50 concurrent jobs
- [ ] Distribute across 10 nodes
- [ ] Verify all heartbeats fire correctly under load
- [ ] Verify no missed heartbeats during peak
- [ ] Verify job success rate > 99%

**Verification:**
```bash
npx hardhat test test/IntegrationLoad.test.js
```

---

### 3.7 Checkpoint & Resume Test

- [ ] Submit a long-running job (simulate with artificial delay)
- [ ] Kill a node mid-execution at checkpoint interval
- [ ] Verify checkpoint state is saved
- [ ] Verify job resumes from last checkpoint on replacement node
- [ ] Verify final output is correct

**Verification:**
```bash
npx hardhat test test/IntegrationCheckpoint.test.js
# OR
go test ./test/integration/... -run TestCheckpoint
```

---

## Phase 4: Frontend Next.js Dashboard

**Objective:** Build the Next.js dashboard for job monitoring, node management, and real-time status updates.

### 4.1 Next.js Project Scaffolding

- [ ] Initialize Next.js project:
  ```bash
  cd frontend && npx create-next-app@latest . --typescript --tailwind --app --src-dir
  ```

- [ ] Install dependencies:
  ```bash
  npm install @tanstack/react-query ethers viem wagmi
  npm install -D @types/node @types/react @types/react-dom
  ```

- [ ] Create project structure:
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── nodes/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── [...slug]/
│   │   │           └── route.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   ├── jobs/
│   │   │   ├── JobList.tsx
│   │   │   ├── JobCard.tsx
│   │   │   └── JobStatusBadge.tsx
│   │   ├── nodes/
│   │   │   ├── NodeList.tsx
│   │   │   ├── NodeCard.tsx
│   │   │   └── ReputationBadge.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── hooks/
│   │   ├── useJobs.ts
│   │   ├── useNodes.ts
│   │   └── useHeartbeat.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── public/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Verification:** `npm run build` completes without errors.

---

### 4.2 Shared Types (src/types/index.ts)

- [ ] Mirror Go backend types:
  ```typescript
  export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'requeued';
  export type NodeStatus = 'offline' | 'online' | 'stale' | 'slashed';

  export interface Job {
    id: string;
    clientId: string;
    sla: SLABenchmark;
    status: JobStatus;
    assignedNodes: string[];
    checkpointRef: string;
    createdAt: number;
    deadline: number;
  }

  export interface SLABenchmark {
    requiredUptime: number;
    requiredThroughput: number;
    deadline: number;
  }

  export interface Node {
    address: string;
    stakeAmount: number;
    reputation: number;
    status: NodeStatus;
    lastHeartbeat: number;
  }

  export interface Heartbeat {
    nodeId: string;
    vramUsed: number;
    vramTotal: number;
    packetLatency: number;
    timestamp: number;
  }
  ```

**Verification:** `npx tsc --noEmit` passes.

---

### 4.3 API Client (src/lib/api.ts)

- [ ] Create API client using fetch:
  ```typescript
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  export const api = {
    jobs: {
      list: () => fetch(`${API_BASE}/api/v1/jobs`).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/v1/jobs/${id}`).then(r => r.json()),
      submit: (job: Partial<Job>) => fetch(`${API_BASE}/api/v1/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      }).then(r => r.json()),
    },
    nodes: {
      list: () => fetch(`${API_BASE}/api/v1/nodes`).then(r => r.json()),
      get: (id: string) => fetch(`${API_BASE}/api/v1/nodes/${id}`).then(r => r.json()),
      eligible: () => fetch(`${API_BASE}/api/v1/nodes/eligible`).then(r => r.json()),
    }
  };
  ```

- [ ] Add React Query hooks in `src/hooks/`:
  - `useJobs()` — fetches all jobs with polling
  - `useJob(id)` — fetches single job with real-time updates
  - `useNodes()` — fetches all nodes with polling
  - `useNode(id)` — fetches single node

**Verification:** `npx tsc --noEmit` and `npm run build` pass.

---

### 4.4 Dashboard Layout (src/components/layout/)

- [ ] Create `Header.tsx` with:
  - Logo "Tentrist"
  - Navigation links (Dashboard, Jobs, Nodes)
  - Wallet connect button (for Web3 interactions)

- [ ] Create `Sidebar.tsx` with:
  - Collapsible navigation
  - Active state highlighting
  - Network status indicator (Connected/Disconnected)

- [ ] Create root layout with Header and Sidebar

**Verification:** `npm run dev` — navigate to `http://localhost:3000` and verify layout renders.

---

### 4.5 Jobs Dashboard (src/app/dashboard/jobs/)

- [ ] Create `JobList.tsx`:
  - Table view with columns: Job ID, Status, SLA Deadline, Nodes, Actions
  - Real-time status updates via React Query polling (5s interval)
  - Filter by status (pending, running, completed, failed)

- [ ] Create `JobCard.tsx`:
  - Compact card showing job summary
  - Color-coded status badge
  - Progress indicator for running jobs

- [ ] Create `JobStatusBadge.tsx`:
  - `pending` — gray
  - `running` — blue
  - `completed` — green
  - `failed` — red
  - `requeued` — yellow

- [ ] Create job detail page `src/app/dashboard/jobs/[id]/page.tsx`:
  - Full job details
  - Assigned nodes list
  - SLA benchmarks
  - Checkpoint history
  - Real-time log stream (SSE or WebSocket)

**Verification:** `npm run build` and manual browser test.

---

### 4.6 Nodes Dashboard (src/app/dashboard/nodes/)

- [ ] Create `NodeList.tsx`:
  - Table with columns: Address, Stake, Reputation, Status, Last Heartbeat
  - Sort by reputation (descending)
  - Filter by status

- [ ] Create `NodeCard.tsx`:
  - Address (truncated)
  - Stake amount in ETH/token
  - Reputation score with trend arrow
  - Heartbeat status indicator (green dot = live, red = stale)

- [ ] Create `ReputationBadge.tsx`:
  - High (> 100) — gold badge
  - Medium (50-100) — silver badge
  - Low (< 50) — bronze badge
  - Negative — red warning badge

- [ ] Create node detail page `src/app/dashboard/nodes/[id]/page.tsx`:
  - Full node details
  - Reputation history chart
  - Recent job history
  - Heartbeat timeline

**Verification:** `npm run build` and manual browser test.

---

### 4.7 Web3 Integration (Wallet Connect)

- [ ] Set up Wagmi + Viem:
  ```typescript
  import { http, createConfig } from 'wagmi';
  import { mainnet, sepolia } from 'wagmi/chains';

  export const config = createConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
  ```

- [ ] Create `WalletConnect.tsx` button:
  - Connect wallet
  - Display connected address
  - Switch network to Sepolia

- [ ] Create `ContractInteraction.tsx`:
  - Read node stake amount
  - Read node reputation
  - Display recent slashing events

**Verification:** Connect wallet on Sepolia testnet, verify contract reads.

---

### 4.8 Real-time Updates (WebSocket/SSE)

- [ ] Add WebSocket connection for live updates:
  ```typescript
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

  export function useJobUpdates(jobId: string, onUpdate: (job: Job) => void) {
    // Connect to WebSocket
    // Subscribe to job updates
    // Call onUpdate on each message
  }
  ```

- [ ] Create `LiveIndicator.tsx`:
  - Green pulse animation when WebSocket connected
  - Red indicator when disconnected

- [ ] Add SSE endpoint `src/app/api/v1/jobs/[id]/stream/route.ts`:
  - Server-Sent Events for job progress
  - Heartbeat status updates

**Verification:** Submit job, observe real-time status updates in UI without page refresh.

---

### 4.9 Phase 4 Final Verification

- [ ] Full `npm run build` passes with zero errors
- [ ] Manual browser test of all pages:
  - Dashboard home loads with stats
  - Jobs page shows all jobs with correct status
  - Nodes page shows all nodes with reputation scores
  - Job detail page shows real-time updates
  - Node detail page shows heartbeat history
- [ ] Wallet connect works on Sepolia testnet
- [ ] Responsive design works on mobile viewport

**Verification:** `npm run build && npm run start` — full production build succeeds.

---

## Phase 5: Production Hardening & Deployment (Future)

*This phase is outlined but not yet actionable — requires Phase 1-4 completion.*

### 5.1 Smart Contract Audit
- [ ] Engage third-party audit firm (OpenZeppelin, Trail of Bits)
- [ ] Fix all critical/high findings
- [ ] Publish audit report

### 5.2 Deployment
- [ ] Deploy contracts to mainnet
- [ ] Set up multi-sig for contract upgrades
- [ ] Deploy backend to cloud (AWS/GCP)
- [ ] Deploy frontend to Vercel/Cloudflare Pages

### 5.3 Monitoring & Observability
- [ ] Set up Grafana dashboards
- [ ] Configure PagerDuty alerts
- [ ] Implement log aggregation (Datadog/Splunk)

---

## Global Verification Commands

Run these before marking any phase complete:

```bash
# Phase 1
npx hardhat compile
npx hardhat test test/Escrow.test.js
npx hardhat test test/SLAContract.test.js
npx hardhat test test/SlashManager.test.js
npx hardhat test test/ReputationLedger.test.js
npx hardhat test test/Phase1Integration.test.js

# Phase 2
go build ./...
go test ./internal/... -v
go run telemetry/src/main.go  # Verify 30s heartbeat interval

# Phase 3
npx hardhat test test/IntegrationHappyPath.test.js
npx hardhat test test/IntegrationFailover.test.js
npx hardhat test test/IntegrationLoad.test.js
go test ./test/integration/... -v

# Phase 4
cd frontend && npm run build && npm run start
```

---

## File Checklist Summary

### Phase 1 — Smart Contracts
- [ ] `contracts/Escrow.sol`
- [ ] `contracts/SLAContract.sol`
- [ ] `contracts/SlashManager.sol`
- [ ] `contracts/ReputationLedger.sol`
- [ ] `contracts/test/Escrow.test.js`
- [ ] `contracts/test/SLAContract.test.js`
- [ ] `contracts/test/SlashManager.test.js`
- [ ] `contracts/test/ReputationLedger.test.js`
- [ ] `contracts/test/Phase1Integration.test.js`

### Phase 2 — Backend & Telemetry
- [ ] `backend/cmd/server/main.go`
- [ ] `backend/internal/api/router.go`
- [ ] `backend/internal/api/handlers/job.go`
- [ ] `backend/internal/api/handlers/node.go`
- [ ] `backend/internal/orchestrator/splitter.go`
- [ ] `backend/internal/orchestrator/checkpoint.go`
- [ ] `backend/internal/contract/client.go`
- [ ] `backend/pkg/types/types.go`
- [ ] `telemetry/src/main.go`
- [ ] `telemetry/src/heartbeat/pulse.go`
- [ ] `telemetry/src/collector/vram.go`
- [ ] `telemetry/src/collector/latency.go`
- [ ] `telemetry/src/detector/failure.go`
- [ ] `telemetry/src/reporter/client.go`

### Phase 3 — Integration Tests
- [ ] `contracts/test/IntegrationHappyPath.test.js`
- [ ] `contracts/test/IntegrationFailover.test.js`
- [ ] `contracts/test/IntegrationPartialSlash.test.js`
- [ ] `contracts/test/IntegrationSLABreach.test.js`
- [ ] `contracts/test/IntegrationLoad.test.js`
- [ ] `contracts/test/IntegrationCheckpoint.test.js`

### Phase 4 — Frontend
- [ ] `frontend/src/app/layout.tsx`
- [ ] `frontend/src/app/page.tsx`
- [ ] `frontend/src/app/dashboard/page.tsx`
- [ ] `frontend/src/app/dashboard/jobs/page.tsx`
- [ ] `frontend/src/app/dashboard/jobs/[id]/page.tsx`
- [ ] `frontend/src/app/dashboard/nodes/page.tsx`
- [ ] `frontend/src/app/dashboard/nodes/[id]/page.tsx`
- [ ] `frontend/src/components/layout/Header.tsx`
- [ ] `frontend/src/components/layout/Sidebar.tsx`
- [ ] `frontend/src/components/jobs/JobList.tsx`
- [ ] `frontend/src/components/jobs/JobCard.tsx`
- [ ] `frontend/src/components/jobs/JobStatusBadge.tsx`
- [ ] `frontend/src/components/nodes/NodeList.tsx`
- [ ] `frontend/src/components/nodes/NodeCard.tsx`
- [ ] `frontend/src/components/nodes/ReputationBadge.tsx`
- [ ] `frontend/src/hooks/useJobs.ts`
- [ ] `frontend/src/hooks/useNodes.ts`
- [ ] `frontend/src/lib/api.ts`
- [ ] `frontend/src/types/index.ts`

---

## Notes

- **Dependencies:** Phase 1 must be fully verified before starting Phase 2
- **Blockchain:** All financial transactions (staking, slashing, payments) MUST be on-chain
- **Heartbeat Interval:** 30 seconds is the minimum — do not increase beyond 60s without adjusting stale threshold
- **Checkpoint Frequency:** Save checkpoints at least every 60 seconds for resumable jobs
- **Reputation Decay:** Consider implementing periodic reputation decay to incentivize consistent performance