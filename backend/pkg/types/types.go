// Package types defines shared Go types for the Tentrist backend.
package types

import (
	"math/big"
	"time"
)

// JobStatus represents the status of a compute job.
type JobStatus uint8

const (
	JobPending   JobStatus = 0
	JobRunning   JobStatus = 1
	JobCompleted JobStatus = 2
	JobFailed    JobStatus = 3
	JobRequeued  JobStatus = 4
	JobCancelled JobStatus = 5
)

// NodeStatus represents the status of a GPU compute node.
type NodeStatus uint8

const (
	NodeOffline NodeStatus = 0
	NodeOnline  NodeStatus = 1
	NodeStale   NodeStatus = 2
	NodeSlashed NodeStatus = 3
)

// MeteredType represents the billing model for a compute job.
type MeteredType uint8

const (
	MeteredUnspecified MeteredType = 0
	TimeBased         MeteredType = 1 // Pay per millisecond of GPU time
	TokenBased       MeteredType = 2 // Pay per 1M tokens processed (LLM inference)
)

// RatePerUnit represents the rate at which a metered job is charged.
// Value is in micro-USDC (1 USDC = 1,000,000 micro-USDC).
type RatePerUnit struct {
	MicroUSDCPerUnit uint64 // fractional USDC in micro-cents per unit
	UnitType         MeteredType // TimeBased (per ms) or TokenBased (per 1M tokens)
}

// SLABenchmark defines SLA requirements for a compute job.
type SLABenchmark struct {
	RequiredUptime    uint64    // percentage * 100 (e.g., 9900 = 99%)
	RequiredThroughput uint64    // operations per second
	Deadline          time.Time // job deadline
	Fulfilled         bool      // whether SLA was met
}

// Job represents a compute job in the system.
type Job struct {
	ID              [32]byte       // unique job identifier
	ClientID        [20]byte       // client address
	SLABenchmark    SLABenchmark   // SLA requirements
	Status          JobStatus      // current job status
	AssignedNodes   [][20]byte     // list of assigned node addresses
	CheckpointRef   string         // reference to checkpoint data
	CreatedAt       time.Time      // creation timestamp
	Deadline        time.Time      // SLA deadline

	// Micro-metering fields for hybrid pay-as-you-use serverless model
	MeteredType    MeteredType      // billing model: TimeBased or TokenBased
	RatePerUnit    RatePerUnit     // rate in micro-USDC per unit (ms or per 1M tokens)
	UsageCounter   uint64           // aggregated total units processed (ms or token count)
	TotalBilled    *big.Int         // total amount billed in micro-USDC (accumulated)
	IsServerless   bool            // true if serverless multi-tenant, false if dedicated
}

// Node represents a GPU compute node.
type Node struct {
	Address         [20]byte   // node Ethereum address
	StakeAmount     *big.Int  // collateral staked
	Reputation     *big.Int  // reputation score
	Status          NodeStatus // current status
	LastHeartbeat   time.Time // last heartbeat timestamp
	RegisteredAt    time.Time // registration timestamp

	// Serverless vs Dedicated differentiation
	IsReservedPool bool       // true = serverless multi-tenant pool, false = dedicated enterprise node
	PoolCapacityMB  uint64     // available VRAM MB for serverless pool (0 if dedicated)
	BaseRateMicroUSDC uint64  // base rate in micro-USDC per ms (for serverless pricing)
}

// Heartbeat represents a telemetry heartbeat from a node.
type Heartbeat struct {
	NodeID          [20]byte // node address
	VRAMUsedMB      uint64   // VRAM used in MB
	VRAMTotalMB     uint64   // total VRAM in MB
	PacketLatencyMs uint64   // packet latency in milliseconds
	Timestamp      time.Time // heartbeat timestamp
}

// ReputationTier represents a reputation tier level.
type ReputationTier string

const (
	TierExcellent ReputationTier = "Excellent"
	TierGood     ReputationTier = "Good"
	TierFair     ReputationTier = "Fair"
	TierPoor     ReputationTier = "Poor"
	TierCritical ReputationTier = "Critical"
)

// SlashResult contains the result of a slash operation.
type SlashResult struct {
	Node           [20]byte // slashed node address
	SlashAmount    *big.Int // amount slashed from stake
	CreditAmount   *big.Int // amount credited to client
	JobValue       *big.Int // original job value
	SlashPercent   *big.Int // slash percentage (basis points)
	CreditPercent  *big.Int // credit percentage (basis points)
}

// Config holds backend configuration.
type Config struct {
	RPCURL              string        // Ethereum RPC URL
	ChainID             *big.Int      // chain ID
	EscrowAddress       [20]byte      // Escrow contract address
	SLAContractAddress  [20]byte      // SLAContract address
	SlashManagerAddress [20]byte      // SlashManager address
	ReputationAddress   [20]byte      // ReputationLedger address
	NodeRegistryAddress [20]byte      // NodeRegistry address
	HeartbeatInterval  time.Duration // heartbeat interval (default 30s)
	StaleThreshold     time.Duration // stale threshold (default 60s)
	CheckpointInterval time.Duration // checkpoint interval (default 60s)
}

// NewDefaultConfig returns a config with sensible defaults.
func NewDefaultConfig() *Config {
	return &Config{
		HeartbeatInterval:  30 * time.Second,
		StaleThreshold:     60 * time.Second,
		CheckpointInterval: 60 * time.Second,
	}
}
