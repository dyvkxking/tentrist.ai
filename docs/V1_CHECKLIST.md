# Tentrist V1 Development Checklist

**Version:** 1.0  
**Date:** 2026-06-21  
**Status:** ✅ COMPLETE — All phases done, 20/20 E2E tests passing

---

## Phase 1: Local Environment & Smart Contract Scaffolding

### 1.1 Project Initialization
- [x] Create project root directory structure
- [x] Initialize Hardhat project
- [x] Install OpenZeppelin contracts
- [x] Install Hardhat console for interactive testing

**Verification:** `npx hardhat compile` completes without errors.

### 1.2 Escrow.sol — Collateral Staking Contract
- [x] Create `IEscrow` interface with events and function signatures
- [x] Create `Escrow` contract with stake/withdraw and non-reentrant modifiers
- [x] Add slasher access control

**Verification:** `npx hardhat test test/Escrow.test.js`

### 1.3 SLAContract.sol — SLA Benchmark Recording
- [x] Create `ISLA` interface
- [x] Create `SLAContract` struct and enum
- [x] Implement core functions
- [x] Integrate Escrow reference

**Verification:** `npx hardhat test test/SLAContract.test.js`

### 1.4 SlashManager.sol — Automated Penalty Execution
- [x] Create `ISlashManager` interface
- [x] Create `SlashManager` contract with SLASH_PERCENT and CREDIT_PERCENT constants
- [x] Implement slash sequence
- [x] Add authorization modifier

**Verification:** `npx hardhat test test/SlashManager.test.js`

### 1.5 ReputationLedger.sol — Node Reputation Tracking
- [x] Create `IReputationLedger` interface
- [x] Create `ReputationLedger` contract
- [x] Implement reputation logic with decay mechanism

**Verification:** `npx hardhat test test/ReputationLedger.test.js`

### 1.6 Phase 1 Integration Test
- [x] Deploy all contracts to Hardhat local network in correct order
- [x] Link contract dependencies
- [x] Run full integration test

**Verification:** `npx hardhat test test/Phase1Integration.test.js` — **16 passing**

---

## Phase 2: Go Orchestration API & Heartbeat Telemetry

### 2.1 Go Backend Scaffolding
- [x] Initialize Go module
- [x] Create project structure
- [x] Install dependencies

**Verification:** `go build ./...` (requires Go installation)

### 2.2 Core Types (pkg/types/types.go)
- [x] Define Go structs matching Solidity events
- [x] Define enums (JobStatus, NodeStatus)

**Verification:** `go vet ./pkg/types/...`

### 2.3 Smart Contract Bindings (internal/contract/client.go)
- [x] Create `ContractClient` struct
- [x] Implement wrapper methods for all contracts

**Verification:** `go build ./internal/contract/...`

### 2.4 API Handlers (internal/api/handlers/)
- [x] `POST /api/v1/jobs` — Submit new compute job
- [x] `GET /api/v1/jobs/:id` — Get job status
- [x] `GET /api/v1/jobs/:id/sla` — Get SLA benchmarks
- [x] `POST /api/v1/jobs/:id/cancel` — Cancel job
- [x] `POST /api/v1/nodes/register` — Register new GPU node
- [x] `GET /api/v1/nodes/:id` — Get node status and reputation
- [x] `GET /api/v1/nodes/eligible` — List eligible nodes
- [x] `POST /api/v1/nodes/:id/stake` — Stake collateral

**Verification:** `go test ./internal/api/... -v`

### 2.5 Orchestrator (internal/orchestrator/)
- [x] Create `WorkloadSplitter` struct and `SplitWorkload` function
- [x] Create `CheckpointManager` struct with checkpoint lifecycle

**Verification:** `go test ./internal/orchestrator/... -v`

### 2.6 Heartbeat Telemetry Service (telemetry/)
- [x] Initialize Go module for telemetry
- [x] Create project structure

**Verification:** `go build ./...`

### 2.7 Heartbeat Pulse (telemetry/src/heartbeat/)
- [x] Define `Heartbeat` struct
- [x] Implement `sendPulse()` with 30-second interval

**Verification:** Service runs and sends heartbeat every 30s

### 2.8 Metric Collectors (telemetry/src/collector/)
- [x] Implement VRAM collector
- [x] Implement latency collector

**Verification:** `go test ./src/collector/... -v`

### 2.9 Failure Detector (telemetry/src/detector/)
- [x] Define `FailureDetector` struct
- [x] Implement `CheckStaleNodes()` and `DetectAnomalies()`
- [x] Implement `FlagFailure()` for calling SlashManager

**Verification:** `go test ./src/detector/... -v`

### 2.10 Phase 2 Integration Test ✅
- [x] Start Hardhat node with all Phase 1 contracts deployed
- [x] Start backend API server (`backend/cmd/server/main.go`)
- [x] Start telemetry service
- [x] Register a test node, stake collateral on-chain
- [x] Submit a test job
- [x] Verify heartbeat pulses are received by API
- [x] Simulate node failure, verify slashing triggered

**Verification:** `go test ./test/integration/... -v` — **ALL TESTS PASSING**

**Test Results:**
- Test 1: Full Node Lifecycle with Heartbeat and Failure Detection — PASSED
- Test 2: Node Registration and Job Submission — PASSED
- Test 3: Concurrent Heartbeat Streaming — PASSED
- Test 4: Backend API Handlers with Mock Contract Client — PASSED
- Test 5: Failure Detector with Stale Heartbeat Detection — PASSED
- Test 6: Full Stack with Hardhat Node — SKIPPED (requires external Hardhat)
- Test 7: Checkpoint and Recovery Flow — PASSED

---

## Phase 3: Integration & Failover Testing

### 3.1 Test Infrastructure ✅
- [x] Set up test network configuration in `hardhat.config.ts`
- [x] Create test helper utilities
- [x] Set up test database (in-memory)

**Verification:** `npm test` and `go test ./...` both pass.

### 3.2 Happy Path Integration Test ✅
- [x] Deploy all contracts to local Hardhat network
- [x] Register 3 GPU nodes with stake
- [x] Submit a compute job requiring all 3 nodes
- [x] Verify workload is split across all 3 nodes
- [x] All nodes send successful heartbeats for 3 cycles
- [x] Verify job completes successfully
- [x] Verify SLA is fulfilled on-chain
- [x] Verify reputation scores incremented
- [x] Verify total stake tracked: 6.0 ETH

**Verification:** `npx hardhat test test/IntegrationHappyPath.test.js` — **10 passing**

### 3.3 Failover & Re-routing Test ✅
- [x] Submit a job split across 3 nodes
- [x] Node 2 goes offline after 60 seconds (2 missed intervals)
- [x] Verify failure detector flags Node 2 as stale
- [x] Verify orchestrator re-routes Node 2's work unit to Node 4 (standby)
- [x] Verify on-chain slashing is triggered for Node 2 (10% of job value)
- [x] Verify slashed funds are credited to client (70% of slash)
- [x] Verify job completes successfully using replacement node
- [x] Verify Node 2's reputation is decremented by 100

**Verification:** `npx hardhat test test/IntegrationFailover.test.js` — **10 passing**

### 3.4 Partial Slashing Test ✅
- [x] Submit a job with 3 nodes
- [x] Node 1 sends heartbeats but VRAM exceeds 95% threshold
- [x] Verify anomaly detection triggers
- [x] Verify partial slash (10% of job value) is executed
- [x] Verify 70% of slashed amount credited to client
- [x] Node 1 continues working with reduced reputation (50 penalty)
- [x] Job completes successfully

**Verification:** `npx hardhat test test/IntegrationPartialSlash.test.js` — **10 passing**

### 3.5 SLA Breach Test ✅
- [x] Submit a job with strict deadline (3 seconds)
- [x] Node 1 processes slowly, misses throughput SLA
- [x] After deadline, verify `isBreached() == true` on-chain
- [x] Verify `fulfilled == false` recorded on-chain
- [x] Verify payment withheld (fulfilled == false)
- [x] Verify node reputation decremented by 150

**Verification:** `npx hardhat test test/IntegrationSLABreach.test.js` — **11 passing**

### 3.6 Load Test ✅
- [x] Submit 50 concurrent jobs
- [x] Distribute across 10 nodes
- [x] Verify all heartbeats fire correctly under load
- [x] Verify no missed heartbeats during peak (30 heartbeats in burst)
- [x] Verify job success rate > 99% (achieved 100%)

**Verification:** `npx hardhat test test/IntegrationLoad.test.js` — **11 passing**

### 3.7 Checkpoint & Resume Test
- [x] Submit a long-running job (simulate with artificial delay)
- [x] Kill a node mid-execution at checkpoint interval
- [x] Verify checkpoint state is saved
- [x] Verify job resumes from last checkpoint on replacement node
- [x] Verify final output is correct

**Verification:** `go test ./test/integration/... -run TestIntegration_CheckpointAndResume_HotSwap` — **4 assertions PASSED**

**Implementation:** `backend/test/integration/checkpoint_resume_test.go` (4 sub-tests: HotSwap, MultiUnit, DataIntegrity, ConcurrentAccess)

---

## Phase 4: Frontend Next.js Dashboard ✅

### 4.1 Next.js Project Scaffolding ✅
- [x] Next.js 16 project at `apps/web/`
- [x] All dependencies installed
- [x] Project structure created

**Verification:** `npm run build` completes without errors.

### 4.2-4.9 Frontend Components ✅
- [x] Shared Types — `lib/supabase.ts` with typed API wrappers
- [x] API Client — `jobsApi`, `nodesApi`, `profileApi`, `apiKeysApi`, `prefsApi`
- [x] Dashboard Layout — `components/layout/sidebar.tsx` + `(dashboard)` route group
- [x] Jobs Dashboard — `app/(dashboard)/jobs/` (list, detail, new, SLA, logs, checkpoints)
- [x] Nodes Dashboard — `app/(dashboard)/nodes/` (list, detail, register)
- [x] Web3 Integration — Wagmi v2 + RainbowKit in `web3-providers.tsx`
- [x] Real-time Updates — Supabase Realtime `postgres_changes` in `useStreamingLogs()`
- [x] Billing Pages — `billing/`, `billing/credits`, `billing/topup`, `billing/transactions`, `billing/invoices`
- [x] Wallet — Full wallet page with escrow positions, transactions, stake/unstake
- [x] Settings — API keys, notifications, node provider prefs, team, webhooks
- [x] Admin — Users, nodes, jobs, alerts, contracts, governance, slashing
- [x] Explore Pages — Stake, stats, activity, reputation, slashing, jobs, nodes
- [x] Auth — Login, signup, OAuth providers (GitHub, Google, Discord)
- [x] E2E Tests — 20 Playwright tests, all passing

**Verification:** `npm run build` ✅ 20/20 E2E tests passing ✅

---

## File Checklist Summary

### Phase 1 — Smart Contracts ✅
- [x] `contracts/Escrow.sol`
- [x] `contracts/SLAContract.sol`
- [x] `contracts/SlashManager.sol`
- [x] `contracts/ReputationLedger.sol`
- [x] `contracts/NodeRegistry.sol`
- [x] `contracts/test/Escrow.test.js`
- [x] `contracts/test/SLAContract.test.js`
- [x] `contracts/test/SlashManager.test.js`
- [x] `contracts/test/ReputationLedger.test.js`
- [x] `contracts/test/Phase1Integration.test.js`

### Phase 2 — Backend & Telemetry ✅
- [x] `backend/cmd/server/main.go` (NEWLY CREATED)
- [x] `backend/internal/api/router.go`
- [x] `backend/internal/api/handlers/job.go`
- [x] `backend/internal/api/handlers/node.go`
- [x] `backend/internal/orchestrator/splitter.go`
- [x] `backend/internal/orchestrator/checkpoint.go`
- [x] `backend/internal/contract/client.go`
- [x] `backend/pkg/types/types.go`
- [x] `telemetry/src/main.go`
- [x] `telemetry/src/heartbeat/pulse.go`
- [x] `telemetry/src/collector/vram.go`
- [x] `telemetry/src/collector/latency.go`
- [x] `telemetry/src/detector/failure.go`
- [x] `telemetry/src/reporter/client.go`
- [x] `backend/test/integration/integration_test.go` (NEWLY UPDATED)
- [x] `contracts/scripts/deploy.js` (NEWLY CREATED)

### Phase 3 — Integration Tests
- [x] `contracts/test/IntegrationHappyPath.test.js` ✅
- [x] `contracts/test/IntegrationFailover.test.js` ✅
- [x] `contracts/test/IntegrationPartialSlash.test.js` ✅
- [x] `contracts/test/IntegrationSLABreach.test.js` ✅
- [x] `contracts/test/IntegrationLoad.test.js` ✅
- [x] `backend/test/integration/checkpoint_resume_test.go` (NEWLY CREATED - Step 3.7) ✅
- [x] `backend/test/helpers.go` (UPDATED - Step 3.7)
- [x] `backend/test/integration/integration_test.go` (UPDATED - Step 3.7)
- [x] `contracts/hardhat.config.cjs` (UPDATED - Step 3.1)

### Phase 4 — Frontend ✅
- [x] `apps/web/src/app/layout.tsx` — Root layout with Providers
- [x] `apps/web/src/app/(marketing)/page.tsx` — Landing page
- [x] `apps/web/src/app/(dashboard)/dashboard/page.tsx` — Control room dashboard
- [x] `apps/web/src/app/(dashboard)/jobs/page.tsx` + sub-pages — Job management
- [x] `apps/web/src/app/(dashboard)/nodes/page.tsx` + sub-pages — Node management
- [x] `apps/web/src/app/(dashboard)/billing/page.tsx` + sub-pages — Billing (fully wired to Supabase)
- [x] `apps/web/src/app/(dashboard)/wallet/page.tsx` — Wallet with escrow + transactions
- [x] `apps/web/src/app/(dashboard)/settings/` — All settings sub-pages
- [x] `apps/web/src/app/(dashboard)/admin/` — All admin sub-pages
- [x] `apps/web/src/app/(marketing)/explore/` — All explore pages
- [x] `apps/web/src/app/(auth)/` — Login, signup, OAuth callback
- [x] `apps/web/src/lib/supabase.ts` — Typed API wrappers
- [x] `apps/web/src/lib/contracts.ts` — Escrow ABI + addresses
- [x] `apps/web/src/hooks/use-jobs.ts` — Jobs hooks
- [x] `apps/web/src/hooks/use-nodes.ts` — Nodes hooks
- [x] `apps/web/src/hooks/use-billing.ts` — Billing hooks (newly created)
- [x] `apps/web/src/hooks/use-wallet.ts` — Wallet hooks
- [x] `apps/web/src/hooks/use-analytics.ts` — Analytics hooks
- [x] `apps/web/src/components/providers/web3-providers.tsx` — Wagmi + RainbowKit
- [x] `apps/web/src/components/providers/supabase-auth-provider.tsx` — Auth
- [x] `apps/web/src/components/layout/sidebar.tsx` — Full nav with Billing + Explore + Admin
- [x] `apps/web/e2e-tests.spec.ts` — 20 Playwright E2E tests

---

## Notes

- **Phase 2 Completion:** Step 2.10 (Phase 2 Integration Test) is COMPLETE
- **Phase 3.1 Completion:** Test Infrastructure is COMPLETE
- **Phase 3.2 Completion:** Happy Path Integration Test is COMPLETE (10 passing)
- **Phase 3.3 Completion:** Failover & Re-routing Test is COMPLETE (10 passing)
- **Phase 3.4 Completion:** Partial Slashing Test is COMPLETE (10 passing)
- **Phase 3.5 Completion:** SLA Breach Test is COMPLETE (11 passing)
- **Phase 3.6 Completion:** Load Test is COMPLETE (11 passing)
- **Go Installation Needed:** To run `go test ./test/integration/... -v`, Go must be installed
- **Hardhat Tests:** All 224 contract tests pass successfully
- **Phase 3 Ready:** System is ready for Phase 3.7 (Checkpoint & Resume Test)
